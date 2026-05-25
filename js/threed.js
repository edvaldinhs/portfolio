import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

gsap.registerPlugin(ScrollTrigger);

const container = document.getElementById('canvas-container');
const isMobile = () => window.innerWidth < 800;

const setups = [
    {
        name: "Eddy",
        file: 'models/Eddy7.glb',
        animation: 'Idle',
        desktop: { x: 0.25, y: -2.4, z: 0, scale: 1.5, camZ: 3.7 },
        mobile: { x: 0.1, y: -2.4, z: 0, scale: 1.5, camZ: 3.7 },
    },
    {
        name: "Ydde",
        file: 'models/Ydde3.glb',
        animation: 'Play_Guitar',
        desktop: { x: 0.4, y: -0.85, z: 0, scale: 1.7, camZ: 3.7 },
        mobile: { x: 0.1, y: -0.65, z: 0, scale: 1.25, camZ: 3 }
    }
];

let targetRotationX = 0;
let targetRotationY = isMobile() ? -(Math.PI / 8) : -(Math.PI / 8);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 0, isMobile() ? setups[0].mobile.camZ : setups[0].desktop.camZ);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 1.5));
const topLight = new THREE.DirectionalLight(0xffffff, 2);
topLight.position.set(5, 5, 5);
scene.add(topLight);

const groupEddy = new THREE.Group();
const groupYdde = new THREE.Group();
scene.add(groupEddy);
scene.add(groupYdde);

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

function checkLoadComplete() {
    loadedCount++;
    if (loadedCount === 2) {
        initScrollAnimation();
    }
}

function initScrollAnimation() {
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: "main",
            start: "top top",
            end: "+=2000",
            scrub: 1,
            pin: true,
            anticipatePin: 1
        }
    });
    tl.to(groupEddy.rotation, { y: Math.PI, duration: 1, ease: "power2.inOut" }, 0)
      .to(groupEddy.scale, { x: 0, y: 0, z: 0, duration: 1, ease: "power2.inOut" }, 0)
      
      .to(groupYdde.scale, { x: 1, y: 1, z: 1, duration: 1, ease: "power2.inOut" }, 1)
      .fromTo(groupYdde.rotation, 
          { y: -Math.PI }, 
          { y: 0, duration: 1, ease: "power2.inOut" }, 
      1);

      setTimeout(() => {
        ScrollTrigger.refresh();
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }, 100);
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
    if (modelYdde) {
        let pos = isMobile() ? setups[1].mobile : setups[1].desktop;
        modelYdde.position.set(pos.x, pos.y, pos.z);
        modelYdde.scale.set(pos.scale, pos.scale, pos.scale);
    }
});