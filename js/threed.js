import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

gsap.registerPlugin(ScrollTrigger);

const container = document.getElementById('canvas-container');
const isMobile = () => window.innerWidth < 800;

const targetResolution = isMobile() ? 250 : 400;

const setups = [
    {
        name: "Eddy",
        gltfFile: 'models/Eddy7.glb',
        binFile: `models/baked/Eddy_${targetResolution}.bin`, 
        animation: 'Idle',
        desktop: { x: 0.25, y: -2.4, z: 0, scale: 1.5, camZ: 3.7 },
        mobile: { x: 0.1, y: -2.4, z: 0, scale: 1.5, camZ: 3.7 },
    },
    {
        name: "Ydde",
        gltfFile: 'models/Ydde3.glb',
        binFile: `models/baked/Ydde_${targetResolution}.bin`,
        animation: 'Play_Guitar',
        desktop: { x: 0.4, y: -0.85, z: 0, scale: 1.7, camZ: 3.7 },
        mobile: { x: 0.1, y: -0.65, z: 0, scale: 1.25, camZ: 3 }
    }
];

const config = setups.find(s => s.name === SELECTED_MODEL);

let WIDTH = 0;
let PARTICLES = 0;

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
`;

const computePositionShader = `
    void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec3 pos = texture2D( texturePosition, uv ).xyz;
        vec3 vel = texture2D( textureVelocity, uv ).xyz;
        gl_FragColor = vec4(pos + (vel * 0.1), 1.0);
    }
`;

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
`;

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
`;

let targetRotationX = 0;
let targetRotationY = isMobile() ? -(Math.PI / 8) : -(Math.PI / 8);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 0, isMobile() ? setups[0].mobile.camZ : setups[0].desktop.camZ);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
container.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 1.5));
const topLight = new THREE.DirectionalLight(0xffffff, 2);
topLight.position.set(5, 5, 5);
scene.add(topLight);

const groupGLTF = new THREE.Group();
const groupParticles = new THREE.Group();
scene.add(groupGLTF);
scene.add(groupParticles);

let mixerGLTF = null;
let particleMesh = null;
let gpuCompute, velocityVariable, positionVariable, velocityUniforms;
let bakedTargets = [];
let bakeData = null;

const mouse = new THREE.Vector2(-999, -999);
const mouseWorld = new THREE.Vector3(0, 0, 0);

const currentPos = isMobile() ? config.mobile : config.desktop;
groupGLTF.position.set(currentPos.x, currentPos.y, currentPos.z);
groupGLTF.scale.set(currentPos.scale, currentPos.scale, currentPos.scale);
groupGLTF.rotation.y = targetRotationY;

groupParticles.position.set(currentPos.x, currentPos.y, currentPos.z);
groupParticles.scale.set(0, 0, 0);
groupParticles.rotation.y = targetRotationY;

async function loadPrebakedBinary(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();

    const headerView = new Int32Array(arrayBuffer, 0, 2);
    
    WIDTH = headerView[0];
    PARTICLES = WIDTH * WIDTH;
    
    const numFrames = headerView[1];
    const totalChannels = PARTICLES * 3;

let modelEddy = null, modelYdde = null;
let mixerEddy, mixerYdde;
let loadedCount = 0;

const loader = new GLTFLoader();


function loadModel(config, group, isVisibleOnStart, callback) {
    let currentPos = isMobile() ? config.mobile : config.desktop;
    
    loader.load(config.file, (gltf) => {
        const model = gltf.scene;
        model.position.set(currentPos.x, currentPos.y, currentPos.z);
        model.scale.set(currentPos.scale, currentPos.scale, currentPos.scale);
        model.rotation.y = targetRotationY;
        
        group.add(model);
        
        if (!isVisibleOnStart) {
            group.scale.set(0, 0, 0);
        }

        let mixer = null;
        if (gltf.animations.length) {
            mixer = new THREE.AnimationMixer(model);
            const clip = THREE.AnimationClip.findByName(gltf.animations, config.animation);
            mixer.clipAction(clip || gltf.animations[0]).play();
        }
        
        callback(model, mixer);
    });
}

// Load Eddy
loadModel(setups[0], groupEddy, true, (model, mixer) => {
    modelEddy = model;
    mixerEddy = mixer;
    checkLoadComplete();
});

// Load Ydde
loadModel(setups[1], groupYdde, false, (model, mixer) => {
    modelYdde = model;
    mixerYdde = mixer;
    checkLoadComplete();
});

    particleMesh = new THREE.Points(geometry, new THREE.ShaderMaterial({
        uniforms: {
            texturePosition: { value: null },
            lightDirection: { value: topLight.position.clone().normalize() },
            pointMultiplier: { value: (400.0 / WIDTH) }
        },
        vertexShader: particleVertexShader,
        fragmentShader: particleFragmentShader,
        transparent: false, depthWrite: true, depthTest: true
    }));
    groupParticles.add(particleMesh);
}

function initScrollAnimation() {
    const mm = gsap.matchMedia();
    const activeScale = typeof isMobile === 'function' && isMobile() ? config.mobile.scale : config.desktop.scale;

    mm.add({
        isDesktop: "(min-width: 769px)", 
        isMobile: "(max-width: 768px)"
    }, (context) => {
        let { isDesktop, isMobile } = context.conditions;

        gsap.set("main", { position: "relative" });

        if (isDesktop) {
            gsap.set(".content", { x: "0vw", opacity: 1 });
            gsap.set(".ydde", { x: "0vw" });
            gsap.set(".image-gradient", { x: "0vw" });
            gsap.set(".content2", { 
                position: "absolute", 
                right: "10%", 
                x: "100vw",
                opacity: 0, 
                top: "50%", 
                yPercent: -50, 
                maxWidth: "40rem",
                left: "auto", 
                width: "auto", 
                margin: ""
            });
        } else {
            const c1 = document.querySelector(".content");
            
            gsap.set(".content", { x: "0vw", opacity: 1 });
            gsap.set(".ydde", { x: "0vw" });
            gsap.set(".image-gradient", { x: "0vw" });
            
            gsap.set(".content2", { 
                position: "absolute",
                top: () => c1.offsetTop,
                left: () => c1.offsetLeft,
                width: () => c1.offsetWidth,
                height: () => c1.offsetHeight,
                margin: 0,
                padding: 0,
                x: "100vw",
                opacity: 0,
                yPercent: 0,
                right: "auto",
                maxWidth: "none"
            });
        }

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "main",
                start: "top top",
                end: "+=2000",
                scrub: 1,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true
            }
        });

        tl.to(groupGLTF.rotation, { y: Math.PI, duration: 0.5, ease: "power2.in" }, 0)
          .to(groupGLTF.scale, { x: 0, y: 0, z: 0, duration: 0.5, ease: "power2.in" }, 0)
          .to(groupParticles.scale, { x: activeScale, y: activeScale, z: activeScale, duration: 0.5, ease: "power2.out" }, 0.5)
          .fromTo(groupParticles.rotation, { y: -Math.PI }, { y: 0, duration: 0.5, ease: "power2.out" }, 0.5);

        if (isDesktop) {
            tl.to(".content", { x: "-50vw", opacity: 0, duration: 1, ease: "power2.inOut" }, 0)
              .to(".ydde", { x: "-50vw", duration: 1, ease: "power2.inOut" }, 0)
              .to(".image-gradient", { x: "-60vw", duration: 1, ease: "power2.inOut" }, 0)
              .to(".content2", { x: "0vw", opacity: 1, duration: 1, ease: "power2.inOut" }, 0);
        } else {
            tl.to(".content", { x: "-100vw", opacity: 0, duration: 1, ease: "power2.inOut" }, 0)
              .to(".content2", { x: "0", opacity: 1, duration: 1, ease: "power2.inOut" }, 0);
        }

        return () => gsap.set("main, .content, .content2, .ydde", { clearProps: "all" });
    });

    setTimeout(() => {
        ScrollTrigger.refresh();
        if (typeof AOS !== 'undefined') AOS.refresh();
    }, 150);
}

window.addEventListener('deviceorientation', (event) => {
    if (event.gamma !== null) {
        targetRotationY = (event.gamma * (Math.PI / 180)) * 0.5 + (isMobile() ? setups[0].mobile.x : 0); 
        targetRotationX = (event.beta * (Math.PI / 180)) * 0.2;
    }
});

window.addEventListener('mousemove', (event) => {
    if (!isMobile()) {
        const x = (event.clientX / window.innerWidth) - 0.5;
        const y = (event.clientY / window.innerHeight) - 0.5;
        targetRotationY = x * 0.5 - (Math.PI / 8);
        targetRotationX = y * 0.2;
    }
});

const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    
    if (mixerEddy) mixerEddy.update(delta);
    if (mixerYdde) mixerYdde.update(delta);

    if (modelEddy) {
        modelEddy.rotation.y += (targetRotationY - modelEddy.rotation.y) * 0.05;
        modelEddy.rotation.x += (targetRotationX - modelEddy.rotation.x) * 0.05;
    }
    if (modelYdde) {
        modelYdde.rotation.y += (targetRotationY - modelYdde.rotation.y) * 0.05;
        modelYdde.rotation.x += (targetRotationX - modelYdde.rotation.x) * 0.05;
    }

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;

    camera.position.z = isMobile() ? setups[0].mobile.camZ : setups[0].desktop.camZ;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    

    if (modelEddy) {
        let pos = isMobile() ? setups[0].mobile : setups[0].desktop;
        modelEddy.position.set(pos.x, pos.y, pos.z);
        modelEddy.scale.set(pos.scale, pos.scale, pos.scale);
    }
});

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta(), time = clock.getElapsedTime();

    if (mixerGLTF && groupGLTF.scale.x > 0.01) {
        mixerGLTF.update(delta);
    }

    groupGLTF.rotation.y += (targetRotationY - groupGLTF.rotation.y) * 0.05;
    groupGLTF.rotation.x += (targetRotationX - groupGLTF.rotation.x) * 0.05;

    groupParticles.rotation.y += (targetRotationY - groupParticles.rotation.y) * 0.05;
    groupParticles.rotation.x += (targetRotationX - groupParticles.rotation.x) * 0.05;

    if (gpuCompute && particleMesh && bakeData) {
        if (groupParticles.scale.x > 0.01) {
            const frameIndex = Math.floor(time * 24) % bakeData.frames.length;
            velocityUniforms.targetTexture.value = bakedTargets[frameIndex];

            updateMouseWorldPosition();
            velocityUniforms.delta.value = Math.min(delta, 0.03);
            velocityUniforms.time.value = time;
            gpuCompute.compute();
            particleMesh.material.uniforms.texturePosition.value = gpuCompute.getCurrentRenderTarget(positionVariable).texture;
        }
    }
});