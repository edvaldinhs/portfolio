import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap'

gsap.registerPlugin(ScrollTrigger)

interface ModelSetup {
  name: string
  gltfFile: string
  binFile: string
  animation: string
  desktop: { x: number; y: number; z: number; scale: number; camZ: number }
  mobile: { x: number; y: number; z: number; scale: number; camZ: number }
}

interface BakedData {
  colors: Float32Array
  frames: { targets: Float32Array }[]
}

const SELECTED_MODEL = Math.random() < 0.5 ? 'Eddy' : 'Ydde'

const isMobile = () => window.innerWidth < 800

const targetResolution = isMobile() ? 250 : 400

const setups: ModelSetup[] = [
  {
    name: 'Eddy',
    gltfFile: '/models/Eddy7.glb',
    binFile: `/models/baked/Eddy_${targetResolution}.bin`,
    animation: 'Idle',
    desktop: { x: 0.25, y: -2.4, z: 0, scale: 1.6, camZ: 3.7 },
    mobile: { x: 0.1, y: -2.4, z: 0, scale: 1.5, camZ: 3.7 },
  },
  {
    name: 'Ydde',
    gltfFile: '/models/Ydde3.glb',
    binFile: `/models/baked/Ydde_${targetResolution}.bin`,
    animation: 'Play_Guitar',
    desktop: { x: 0.4, y: -0.85, z: 0, scale: 1.7, camZ: 3.7 },
    mobile: { x: 0.1, y: -0.65, z: 0, scale: 1.25, camZ: 3 },
  },
]

const config = setups.find((s) => s.name === SELECTED_MODEL) as ModelSetup

const computeVelocityShader = `
    uniform float delta; uniform float drag;
    uniform sampler2D targetTexture;
    uniform vec3 mousePos; uniform float mouseRadius; uniform float mouseStrength; uniform float time;

    void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec3 pos = texture2D( texturePosition, uv ).xyz;
        vec3 vel = texture2D( textureVelocity, uv ).xyz;
        vec3 target = texture2D( targetTexture, uv ).xyz;

        vec3 toTarget = target - pos;
        float distSq = dot(toTarget, toTarget);

        float zoneScale = 5.0; float zoneSpeed = 0.8;
        float noise = sin(target.x * zoneScale + time * zoneSpeed) * cos(target.y * zoneScale - time * zoneSpeed * 0.8) * sin(target.z * zoneScale + time * zoneSpeed * 1.1);
        float chaosFactor = smoothstep(0.5, 0.6, noise);

        vec3 turbulence = vec3(
            sin(pos.y * 6.0 + time * 4.0) * cos(pos.z * 4.0),
            cos(pos.z * 6.0 - time * 3.5) * sin(pos.x * 4.0),
            sin(pos.x * 6.0 + time * 4.5) * cos(pos.y * 4.0)
        );

        float dynamicReturn = mix(10.0, 0.0, chaosFactor) + (distSq * distSq);
        vec3 force = toTarget * dynamicReturn + (turbulence * mix(0.05, 0.75, chaosFactor));

        vec3 toMouse = pos - mousePos;
        float distSqToMouse = dot(toMouse, toMouse);
        float radiusSq = mouseRadius * mouseRadius;

        if (distSqToMouse < radiusSq) {
            float mouseDist = sqrt(distSqToMouse);
            force += normalize(toMouse) * ((1.0 - (mouseDist / mouseRadius)) * mouseStrength);
        }

        vel += force * delta;
        float maxSpeed = mix(4.0, 8.0, chaosFactor);
        float currentSpeed = length(vel);
        if (currentSpeed > maxSpeed) vel = (vel / currentSpeed) * maxSpeed;
        vel *= drag;
        if (vel.x != vel.x) vel = vec3(0.0);

        gl_FragColor = vec4(vel, 1.0);
    }
`

const computePositionShader = `
    void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec3 pos = texture2D( texturePosition, uv ).xyz;
        vec3 vel = texture2D( textureVelocity, uv ).xyz;
        gl_FragColor = vec4(pos + (vel * 0.1), 1.0);
    }
`

const particleVertexShader = `
    uniform sampler2D texturePosition;
    uniform float pointMultiplier;
    attribute vec3 aColor;
    varying vec3 vColor; varying vec3 vWorldPosition;

    void main() {
        vColor = aColor;
        vec4 texPos = texture2D( texturePosition, position.xy );
        vec4 mvPosition = modelViewMatrix * vec4( texPos.xyz, 1.0 );
        vWorldPosition = (modelMatrix * vec4(texPos.xyz, 1.0)).xyz;

        gl_PointSize = (25.0 * pointMultiplier) * ( 1.0 / - mvPosition.z );
        gl_Position = projectionMatrix * mvPosition;
    }
`

const particleFragmentShader = `
    uniform vec3 lightDirection;
    varying vec3 vColor; varying vec3 vWorldPosition;

    void main() {
        vec2 circCoord = 2.0 * gl_PointCoord - 1.0;
        float distSq = dot(circCoord, circCoord);
        if (distSq > 1.0) discard;
        float z = sqrt(1.0 - distSq);

        float diffuse = max(0.0, dot(normalize(vec3(circCoord.x, -circCoord.y, z)), lightDirection)) * 1.0;
        float ambient = 1.0 + (smoothstep(-1.5, 1.5, vWorldPosition.z) * 0.4);

        gl_FragColor = vec4(vColor * (diffuse + ambient), 1.0);
    }
`

export class ParticleSimulation {
  private container: HTMLElement
  private scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private groupGLTF = new THREE.Group()
  private groupParticles = new THREE.Group()
  private mixerGLTF: THREE.AnimationMixer | null = null
  private particleMesh: THREE.Points | null = null
  private gpuCompute: GPUComputationRenderer | null = null
  private velocityVariable: any = null
  private positionVariable: any = null
  private velocityUniforms: Record<string, { value: any }> = {}
  private bakedTargets: THREE.DataTexture[] = []
  private bakeData: BakedData | null = null
  private WIDTH = 0
  private PARTICLES = 0
  private mouse = new THREE.Vector2(-999, -999)
  private mouseWorld = new THREE.Vector3()
  private targetRotationX = 0
  private targetRotationY = -(Math.PI / 8)
  private clock = new THREE.Clock()
  private mm: gsap.MatchMedia | null = null
  private disposed = false
  private cleanupFns: Array<() => void> = []

  constructor(container: HTMLElement) {
    this.container = container

    this.camera = new THREE.PerspectiveCamera(
      35,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    )
    this.camera.position.set(0, 0, isMobile() ? config.mobile.camZ : config.desktop.camZ)

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
    const lightDirection = topLight.position.clone().normalize()

    this.scene.add(this.groupGLTF)
    this.scene.add(this.groupParticles)

    const currentPos = isMobile() ? config.mobile : config.desktop
    this.groupGLTF.position.set(currentPos.x, currentPos.y, currentPos.z)
    this.groupGLTF.scale.set(currentPos.scale, currentPos.scale, currentPos.scale)
    this.groupGLTF.rotation.y = this.targetRotationY

    this.groupParticles.position.set(currentPos.x, currentPos.y, currentPos.z)
    this.groupParticles.scale.set(0, 0, 0)
    this.groupParticles.rotation.y = this.targetRotationY

    this.bindEvents()

    void this.load({ lightDirection }).then(() => {
      if (this.disposed) return
      this.renderer.compile(this.scene, this.camera)
      this.renderer.render(this.scene, this.camera)

      requestAnimationFrame(() => {
        if (this.disposed) return
        this.initScrollAnimation(lightDirection)
        window.dispatchEvent(new Event('simulation-loaded'))
      })
    })

    this.animate()
  }

  private async load(env: { lightDirection: THREE.Vector3 }): Promise<void> {
    const [, bakeData] = await Promise.all([
      new Promise<THREE.Group>((resolve, reject) => {
        new GLTFLoader().load(
          config.gltfFile,
          (gltf) => {
            const model = gltf.scene
            this.groupGLTF.add(model)
            if (gltf.animations.length) {
              this.mixerGLTF = new THREE.AnimationMixer(model)
              const clip = THREE.AnimationClip.findByName(gltf.animations, config.animation)
              this.mixerGLTF.clipAction(clip || gltf.animations[0]).play()
            }
            resolve(model)
          },
          undefined,
          reject,
        )
      }),
      this.loadPrebakedBinary(config.binFile),
    ])

    if (this.disposed) return
    this.bakeData = bakeData
    this.initGPGPU(bakeData, env.lightDirection)
    this.createParticles(bakeData, env.lightDirection)
  }

  private async loadPrebakedBinary(url: string): Promise<BakedData> {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()

    const headerView = new Int32Array(arrayBuffer, 0, 2)
    this.WIDTH = headerView[0]
    this.PARTICLES = this.WIDTH * this.WIDTH
    const numFrames = headerView[1]
    const totalChannels = this.PARTICLES * 3

    const headerBytes = 8
    const colorBytes = totalChannels
    const padding = colorBytes % 2 !== 0 ? 1 : 0

    const colorData = new Uint8Array(arrayBuffer, headerBytes, colorBytes)
    const colors = new Float32Array(totalChannels)
    for (let i = 0; i < totalChannels; i++) colors[i] = colorData[i] / 255.0

    const frameData = new Uint16Array(arrayBuffer, headerBytes + colorBytes + padding)
    const frames: { targets: Float32Array }[] = []
    let offset = 0
    for (let i = 0; i < numFrames; i++) {
      const targets = new Float32Array(totalChannels)
      for (let j = 0; j < totalChannels; j++) {
        targets[j] = THREE.DataUtils.fromHalfFloat(frameData[offset++])
      }
      frames.push({ targets })
    }
    return { colors, frames }
  }

  private initGPGPU(data: BakedData, lightDirection: THREE.Vector3) {
    const { WIDTH, PARTICLES } = this
    this.gpuCompute = new GPUComputationRenderer(WIDTH, WIDTH, this.renderer)
    const dtPosition = this.gpuCompute.createTexture()
    const dtVelocity = this.gpuCompute.createTexture()

    this.bakedTargets = data.frames.map((frame) => {
      const dtTarget = this.gpuCompute!.createTexture()
      for (let i = 0; i < PARTICLES; i++) {
        const i4 = i * 4
        const i3 = i * 3
        dtTarget.image.data[i4] = frame.targets[i3]
        dtTarget.image.data[i4 + 1] = frame.targets[i3 + 1]
        dtTarget.image.data[i4 + 2] = frame.targets[i3 + 2]
        dtTarget.image.data[i4 + 3] = 1.0
      }
      return dtTarget
    })

    for (let i = 0; i < PARTICLES; i++) {
      const i4 = i * 4
      const i3 = i * 3
      dtPosition.image.data[i4] = data.frames[0].targets[i3]
      dtPosition.image.data[i4 + 1] = data.frames[0].targets[i3 + 1]
      dtPosition.image.data[i4 + 2] = data.frames[0].targets[i3 + 2]
      dtPosition.image.data[i4 + 3] = 1.0
      dtVelocity.image.data[i4] =
        dtVelocity.image.data[i4 + 1] =
        dtVelocity.image.data[i4 + 2] =
        0
      dtVelocity.image.data[i4 + 3] = 1.0
    }

    this.velocityVariable = this.gpuCompute.addVariable('textureVelocity', computeVelocityShader, dtVelocity)
    this.positionVariable = this.gpuCompute.addVariable('texturePosition', computePositionShader, dtPosition)

    this.gpuCompute.setVariableDependencies(this.velocityVariable, [this.positionVariable, this.velocityVariable])
    this.gpuCompute.setVariableDependencies(this.positionVariable, [this.positionVariable, this.velocityVariable])

    this.velocityUniforms = this.velocityVariable.material.uniforms
    Object.assign(this.velocityUniforms, {
      delta: { value: 0.0 },
      drag: { value: 0.88 },
      mousePos: { value: this.mouseWorld },
      mouseRadius: { value: 0.2 },
      mouseStrength: { value: 25.0 },
      time: { value: 0.0 },
      targetTexture: { value: this.bakedTargets[0] },
    })
    this.gpuCompute.init()

    void lightDirection
  }

  private createParticles(data: BakedData, lightDirection: THREE.Vector3) {
    const { WIDTH, PARTICLES } = this
    const geometry = new THREE.BufferGeometry()
    const uvs = new Float32Array(PARTICLES * 3)

    for (let j = 0; j < WIDTH; j++) {
      for (let i = 0; i < WIDTH; i++) {
        const idx = (j * WIDTH + i) * 3
        uvs[idx] = (i + 0.5) / WIDTH
        uvs[idx + 1] = (j + 0.5) / WIDTH
        uvs[idx + 2] = 0
      }
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(uvs, 3))
    geometry.setAttribute('aColor', new THREE.BufferAttribute(new Float32Array(data.colors), 3))

    this.particleMesh = new THREE.Points(
      geometry,
      new THREE.ShaderMaterial({
        uniforms: {
          texturePosition: { value: null },
          lightDirection: { value: lightDirection },
          pointMultiplier: { value: 400.0 / WIDTH },
        },
        vertexShader: particleVertexShader,
        fragmentShader: particleFragmentShader,
        transparent: false,
        depthWrite: true,
        depthTest: true,
      }),
    )
    this.groupParticles.add(this.particleMesh)
  }

  private initScrollAnimation(lightDirection: THREE.Vector3) {
    this.mm = gsap.matchMedia()
    const activeScale = isMobile() ? config.mobile.scale : config.desktop.scale

    this.mm.add(
      {
        isDesktop: '(min-width: 769px)',
        isMobile: '(max-width: 768px)',
      },
      (context) => {
        const { isDesktop } = context.conditions as { isDesktop: boolean; isMobile: boolean }

        gsap.set('main', { position: 'relative' })

        if (isDesktop) {
          gsap.set('.content', { x: '0vw', opacity: 1 })
          gsap.set('.ydde', { x: '0vw' })
          gsap.set('.image-gradient', { x: '0vw' })
          gsap.set('.content2', {
            position: 'absolute',
            right: '10%',
            x: '100vw',
            opacity: 0,
            top: '50%',
            yPercent: -50,
            maxWidth: '40rem',
            left: 'auto',
            width: 'auto',
            margin: '',
          })
        } else {
          const c1 = document.querySelector('.content') as HTMLElement
          gsap.set('.content', { x: '0vw', opacity: 1 })
          gsap.set('.ydde', { x: '0vw' })
          gsap.set('.image-gradient', { x: '0vw' })
          gsap.set('.content2', {
            position: 'absolute',
            top: () => c1.offsetTop,
            left: () => c1.offsetLeft,
            width: () => c1.offsetWidth,
            height: () => c1.offsetHeight,
            margin: 0,
            padding: 0,
            x: '100vw',
            opacity: 0,
            yPercent: 0,
            right: 'auto',
            maxWidth: 'none',
          })
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: 'main',
            start: 'top top',
            end: '+=2000',
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            pinType: 'fixed',
            fastScrollEnd: true,
            invalidateOnRefresh: true,
          },
        })

        tl.to(this.groupGLTF.rotation, { y: Math.PI, duration: 0.5, ease: 'power2.in' }, 0)
          .to(this.groupGLTF.scale, { x: 0, y: 0, z: 0, duration: 0.5, ease: 'power2.in' }, 0)
          .to(
            this.groupParticles.scale,
            { x: activeScale, y: activeScale, z: activeScale, duration: 0.5, ease: 'power2.out' },
            0.5,
          )
          .fromTo(
            this.groupParticles.rotation,
            { y: -Math.PI },
            { y: 0, duration: 0.5, ease: 'power2.out' },
            0.5,
          )

        if (isDesktop) {
          tl.to('.content', { x: '-50vw', opacity: 0, duration: 1, ease: 'power2.inOut' }, 0)
            .to('.ydde', { x: '-50vw', duration: 1, ease: 'power2.inOut' }, 0)
            .to('.image-gradient', { x: '-60vw', duration: 1, ease: 'power2.inOut' }, 0)
            .to('.content2', { x: '0vw', opacity: 1, duration: 1, ease: 'power2.inOut' }, 0)
        } else {
          tl.to('.content', { x: '-100vw', opacity: 0, duration: 1, ease: 'power2.inOut' }, 0).to(
            '.content2',
            { x: '0', opacity: 1, duration: 1, ease: 'power2.inOut' },
            0,
          )
        }

        return () => gsap.set('main, .content, .content2, .ydde', { clearProps: 'all' })
      },
    )

    const onWindowLoad = () => {
      ScrollTrigger.refresh()
    }
    window.addEventListener('load', onWindowLoad)
    this.cleanupFns.push(() => window.removeEventListener('load', onWindowLoad))

    void lightDirection
  }

  private bindEvents() {
    const onDeviceOrientation = (event: DeviceOrientationEvent) => {
      if (event.gamma !== null) {
        this.targetRotationY = event.gamma * (Math.PI / 180) * 0.5
        this.targetRotationX = event.beta! * (Math.PI / 180) * 0.2
      }
    }

    const onMouseMove = (event: MouseEvent) => {
      const rect = this.container.getBoundingClientRect()
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      if (!isMobile()) {
        this.targetRotationY = this.mouse.x * 0.25 - Math.PI / 8
        this.targetRotationX = this.mouse.y * -0.1
      }
    }

    const onResize = () => {
      const width = this.container.clientWidth
      const height = this.container.clientHeight

      this.camera.aspect = width / height
      this.camera.position.z = isMobile() ? config.mobile.camZ : config.desktop.camZ
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(width, height)

      const pos = isMobile() ? config.mobile : config.desktop
      this.groupGLTF.position.set(pos.x, pos.y, pos.z)
      this.groupParticles.position.set(pos.x, pos.y, pos.z)

      if (ScrollTrigger.getAll().length === 0) {
        this.groupGLTF.scale.set(pos.scale, pos.scale, pos.scale)
      }

      ScrollTrigger.refresh()
    }

    window.addEventListener('deviceorientation', onDeviceOrientation)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('resize', onResize)
    this.cleanupFns.push(() => {
      window.removeEventListener('deviceorientation', onDeviceOrientation)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
    })
  }

  private updateMouseWorldPosition() {
    if (!this.particleMesh) return
    const vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 0.5).unproject(this.camera)
    const dir = vector.sub(this.camera.position).normalize()
    const distance = -this.camera.position.z / dir.z
    const pos = this.camera.position.clone().add(dir.multiplyScalar(distance))
    this.mouseWorld.copy(this.particleMesh.worldToLocal(pos))
  }

  private animate() {
    if (this.disposed) return
    requestAnimationFrame(() => this.animate())

    const delta = this.clock.getDelta()
    const time = this.clock.getElapsedTime()

    if (this.mixerGLTF && this.groupGLTF.scale.x > 0.01) {
      this.mixerGLTF.update(delta)
    }

    this.groupGLTF.rotation.y += (this.targetRotationY - this.groupGLTF.rotation.y) * 0.05
    this.groupGLTF.rotation.x += (this.targetRotationX - this.groupGLTF.rotation.x) * 0.05

    this.groupParticles.rotation.y += (this.targetRotationY - this.groupParticles.rotation.y) * 0.05
    this.groupParticles.rotation.x += (this.targetRotationX - this.groupParticles.rotation.x) * 0.05

    if (
      this.gpuCompute &&
      this.particleMesh &&
      this.bakeData &&
      'targetTexture' in this.velocityUniforms
    ) {
      if (this.groupParticles.scale.x > 0.01) {
        const frameIndex = Math.floor(time * 24) % this.bakeData.frames.length
        this.velocityUniforms.targetTexture.value = this.bakedTargets[frameIndex]

        this.updateMouseWorldPosition()
        this.velocityUniforms.delta.value = Math.min(delta, 0.03)
        this.velocityUniforms.time.value = time
        this.gpuCompute.compute()
        const material = this.particleMesh.material as THREE.ShaderMaterial
        material.uniforms.texturePosition.value =
          this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture
      }
    }

    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    this.disposed = true
    this.cleanupFns.forEach((fn) => fn())
    this.cleanupFns = []

    if (this.mm) this.mm.revert()

    this.gpuCompute?.dispose()
    this.particleMesh?.geometry.dispose()
    this.mixerGLTF?.stopAllAction()
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