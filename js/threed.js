import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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
        desktop: { x: 0.4, y: -0.5, z: 0, scale: 1.5, camZ: 3.7 },
        mobile: { x: 0.1, y: -0.65, z: 0, scale: 1.1, camZ: 3 }
    }
];

const config = setups[Math.floor(Math.random() * setups.length)];
let currentPos = isMobile() ? config.mobile : config.desktop;

let targetRotationX = 0;
let targetRotationY = isMobile() ? -(Math.PI / 8) : -(Math.PI / 8);
let model = null;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 0, currentPos.camZ);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 1.5));
const topLight = new THREE.DirectionalLight(0xffffff, 2);
topLight.position.set(5, 5, 5);
scene.add(topLight);

let mixer;
const loader = new GLTFLoader();
loader.load(config.file, (gltf) => {
    model = gltf.scene;
    model.position.set(currentPos.x, currentPos.y, currentPos.z);
    model.scale.set(currentPos.scale, currentPos.scale, currentPos.scale);
    model.rotation.y = targetRotationY;
    scene.add(model);

    if (gltf.animations.length) {
        mixer = new THREE.AnimationMixer(model);
        const clip = THREE.AnimationClip.findByName(gltf.animations, config.animation);
        mixer.clipAction(clip || gltf.animations[0]).play();
    }
});


window.addEventListener('deviceorientation', (event) => {
    if (event.gamma !== null) {
        targetRotationY = (event.gamma * (Math.PI / 180)) * 0.5 + config.mobile.x; 
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
    if (mixer) mixer.update(delta);

    if (model) {
        model.rotation.y += (targetRotationY - model.rotation.y) * 0.05;
        model.rotation.x += (targetRotationX - model.rotation.x) * 0.05;
    }

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    
    currentPos = isMobile() ? config.mobile : config.desktop;
    if (model) {
        model.position.set(currentPos.x, currentPos.y, currentPos.z);
        model.scale.set(currentPos.scale, currentPos.scale, currentPos.scale);
    }
});