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
    this.renderer.compile(this.scene, this.camera)
    this.onLoaded?.()
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

    window.addEventListener('deviceorientation', onDeviceOrientation)
    window.addEventListener('resize', onResize)

    this.cleanupFns.push(
      () => window.removeEventListener('deviceorientation', onDeviceOrientation),
      () => window.removeEventListener('resize', onResize),
    )
  }

  private animate() {
    if (this.disposed) return
    requestAnimationFrame(() => this.animate())
    if (document.hidden) return
    if (!this.isVisible) return

    const delta = this.clock.getDelta()

    if (this.mixer) this.mixer.update(delta)

    if (this.config.tiltEnabled) {
      this.model.rotation.y += (this.targetRotationY - this.model.rotation.y) * 0.05
      this.model.rotation.x += (this.targetRotationX - this.model.rotation.x) * 0.05
    }

    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    this.disposed = true
    this.cleanupFns.forEach((fn) => fn())
    this.cleanupFns = []
    this.onLoaded = undefined

    this.mixer?.stopAllAction()
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