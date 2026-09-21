import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export interface ModelViewerConfig {
  gltfFile: string
  animation?: string
  cameraZ?: number
  modelX?: number
  modelY?: number
  modelZ?: number
  scale?: number
  tiltEnabled?: boolean
  headGltfFile?: string
  headFollow?: boolean
  headBoneName?: string
  headMaxYaw?: number
  headMaxPitch?: number
  onLoaded?: () => void
}

export class ModelViewer {
  private container: HTMLElement
  private config: ModelViewerConfig
  private scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private model = new THREE.Group()
  private mixer: THREE.AnimationMixer | null = null
  private headGltf: THREE.Group | null = null
  private headMixer: THREE.AnimationMixer | null = null
  private headBone: THREE.Bone | null = null
  private headYawTarget = 0
  private headPitchTarget = 0
  private headYawCurrent = 0
  private headPitchCurrent = 0
  private clock = new THREE.Clock()
  private targetRotationX = 0
  private targetRotationY = 0
  private disposed = false
  private isVisible = true
  private cleanupFns: Array<() => void> = []
  private onLoaded?: () => void

  constructor(container: HTMLElement, config: ModelViewerConfig) {
    this.container = container
    this.config = {
      tiltEnabled: true,
      ...config,
    }
    this.onLoaded = this.config.onLoaded

    this.camera = new THREE.PerspectiveCamera(
      35,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    )
    this.camera.position.set(0, 0, this.config.cameraZ ?? 5)

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    container.appendChild(this.renderer.domElement)

    this.scene.add(new THREE.AmbientLight(0xffffff, 1.5))
    const topLight = new THREE.DirectionalLight(0xffffff, 2)
    topLight.position.set(5, 5, 5)
    this.scene.add(topLight)

    this.scene.add(this.model)

    this.bindEvents()
    this.observeVisibility()
    void this.load()
    this.animate()
  }

  private async load(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      new GLTFLoader().load(
        this.config.gltfFile,
        (gltf) => {
          this.model.add(gltf.scene)
          this.model.position.set(
            this.config.modelX ?? 0,
            this.config.modelY ?? 0,
            this.config.modelZ ?? 0,
          )
          const scale = this.config.scale ?? 1
          this.model.scale.set(scale, scale, scale)
          if (gltf.animations.length) {
            this.mixer = new THREE.AnimationMixer(gltf.scene)
            const clip = this.config.animation
              ? THREE.AnimationClip.findByName(gltf.animations, this.config.animation)
              : undefined
            this.mixer.clipAction(clip || gltf.animations[0]).play()
          }
          resolve()
        },
        undefined,
        reject,
      )
    })

    if (this.disposed) return
    if (this.config.headGltfFile) {
      await this.loadHead()
      if (this.disposed) return
    }
    this.renderer.compile(this.scene, this.camera)
    this.onLoaded?.()
  }

  private async loadHead(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      new GLTFLoader().load(
        this.config.headGltfFile!,
        (gltf) => {
          this.headGltf = gltf.scene
          this.model.add(this.headGltf)
          if (gltf.animations.length) {
            this.headMixer = new THREE.AnimationMixer(gltf.scene)
            const clip = this.config.animation
              ? THREE.AnimationClip.findByName(gltf.animations, this.config.animation)
              : undefined
            this.headMixer.clipAction(clip || gltf.animations[0]).play()
          }
          resolve()
        },
        undefined,
        reject,
      )
    })

    if (this.disposed) return
    const boneName = this.config.headBoneName
    const named = boneName ? this.headGltf?.getObjectByName(boneName) : undefined
    this.headBone = (named as THREE.Bone | null) ?? this.resolveHeadBone()
  }

  private resolveHeadBone(): THREE.Bone | null {
    const scene = this.headGltf
    if (!scene) return null

    const skinned: THREE.SkinnedMesh[] = []
    scene.traverse((obj) => {
      if ((obj as THREE.SkinnedMesh).isSkinnedMesh) skinned.push(obj as THREE.SkinnedMesh)
    })

    const weights = new Map<number, number>()
    for (const mesh of skinned) {
      const geometry = mesh.geometry
      const index = geometry.getAttribute('skinIndex')
      const weightAttr = geometry.getAttribute('skinWeight')
      if (!index || !weightAttr) continue
      for (let i = 0; i < index.count; i++) {
        const ids = [index.getX(i), index.getY(i), index.getZ(i), index.getW(i)]
        const ws = [weightAttr.getX(i), weightAttr.getY(i), weightAttr.getZ(i), weightAttr.getW(i)]
        for (let j = 0; j < 4; j++) {
          const w = ws[j]
          if (w <= 0) continue
          weights.set(ids[j], (weights.get(ids[j]) ?? 0) + w)
        }
      }
    }

    let bestBone: THREE.Bone | null = null
    let bestWeight = 0
    for (const mesh of skinned) {
      const bones = mesh.skeleton?.bones
      if (!bones) continue
      for (const [boneIndex, sum] of weights) {
        const bone = bones[boneIndex] as THREE.Bone | undefined
        if (bone && sum > bestWeight) {
          bestWeight = sum
          bestBone = bone
        }
      }
    }
    return bestBone
  }

  private observeVisibility() {
    const observer = new IntersectionObserver((entries) => {
      this.isVisible = entries[0]?.isIntersecting ?? true
    })
    observer.observe(this.container)
    this.cleanupFns.push(() => observer.disconnect())
  }

  private bindEvents() {
    const onDeviceOrientation = (event: DeviceOrientationEvent) => {
      if (event.gamma === null || event.beta === null) return
      this.targetRotationY = event.gamma * (Math.PI / 180) * 0.5
      this.targetRotationX = event.beta * (Math.PI / 180) * 0.2
    }

    const onResize = () => {
      const width = this.container.clientWidth
      const height = this.container.clientHeight
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(width, height)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!this.config.headFollow) return
      const mx = (event.clientX / window.innerWidth) * 2 - 1
      const my = 1 - (event.clientY / window.innerHeight) * 2
      this.headYawTarget = mx * (this.config.headMaxYaw ?? 0.3)
      this.headPitchTarget = my * (this.config.headMaxPitch ?? 0.15)
    }

    window.addEventListener('deviceorientation', onDeviceOrientation)
    window.addEventListener('resize', onResize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })

    this.cleanupFns.push(
      () => window.removeEventListener('deviceorientation', onDeviceOrientation),
      () => window.removeEventListener('resize', onResize),
      () => window.removeEventListener('pointermove', onPointerMove),
    )
  }

  private animate() {
    if (this.disposed) return
    requestAnimationFrame(() => this.animate())
    if (document.hidden) return
    if (!this.isVisible) return

    const delta = this.clock.getDelta()

    if (this.mixer) this.mixer.update(delta)
    if (this.headMixer) this.headMixer.update(delta)

    if (this.config.tiltEnabled) {
      this.model.rotation.y += (this.targetRotationY - this.model.rotation.y) * 0.05
      this.model.rotation.x += (this.targetRotationX - this.model.rotation.x) * 0.05
    }

    if (this.config.headFollow) this.applyHeadFollow()

    this.renderer.render(this.scene, this.camera)
  }

  private applyHeadFollow() {
    const bone = this.headBone
    if (!bone) return

    const damp = 0.07
    this.headYawCurrent += (this.headYawTarget - this.headYawCurrent) * damp
    this.headPitchCurrent += (this.headPitchTarget - this.headPitchCurrent) * damp

    const yaw = this.headYawCurrent
    const pitch = this.headPitchCurrent
    if (Math.abs(yaw) < 0.0005 && Math.abs(pitch) < 0.0005) return

    const pose = bone.quaternion.clone()
    const offset = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(-pitch, yaw, 0, 'XYZ'),
    )
    bone.quaternion.copy(pose).multiply(offset)
  }

  dispose() {
    this.disposed = true
    this.cleanupFns.forEach((fn) => fn())
    this.cleanupFns = []
    this.onLoaded = undefined

    this.mixer?.stopAllAction()
    this.headMixer?.stopAllAction()
    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (mesh.geometry) mesh.geometry.dispose()
      const material = mesh.material as THREE.Material | THREE.Material[] | undefined
      if (Array.isArray(material)) {
        material.forEach((m) => m.dispose())
      } else if (material) {
        material.dispose()
      }
    })
    this.renderer.dispose()
    if (this.renderer.domElement.parentElement === this.container) {
      this.container.removeChild(this.renderer.domElement)
    }
  }
}