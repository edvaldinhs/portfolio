import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const container = document.getElementById('canvas-container');

const setups = [
    {
        name: "Eddy",
        file: 'models/Eddy7.glb',
        animation: 'Idle',
        cameraPos: { x: 0, y: 0, z: 3.7 },
        modelPos: { x: 0.25, y: -2.4, z: 0 },
        modelRotY: -(Math.PI / 8),
        modelScale: 1.5
    },
    {
        name: "Ydde",
        file: 'models/Ydde3.glb',
        animation: 'Play_Guitar',
        cameraPos: { x: 0, y: 0.5, z: 3.7 },
        modelPos: { x: 0.4, y: -0.5, z: 0 },
        modelRotY: -(Math.PI / 4),
        modelScale: 1.5
    }
];

const config = setups[Math.floor(Math.random() * setups.length)];
console.log(`Randomly selected: ${config.name}`);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 1000);

camera.position.set(config.cameraPos.x, config.cameraPos.y, config.cameraPos.z);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);
const topLight = new THREE.DirectionalLight(0xffffff, 2);
topLight.position.set(5, 5, 5);
scene.add(topLight);

const loader = new GLTFLoader();
let mixer;

loader.load(config.file, (gltf) => {
    const model = gltf.scene;
    
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    
    model.position.x += (model.position.x - center.x);
    model.position.z += (model.position.z - center.z);
    model.position.y = config.modelPos.y; 

    model.position.x += config.modelPos.x; 
    
    model.scale.set(config.modelScale, config.modelScale, config.modelScale);
    model.rotation.y = config.modelRotY;
    
    scene.add(model);
    if (gltf.animations.length) {
        mixer = new THREE.AnimationMixer(model);
        const clip = THREE.AnimationClip.findByName(gltf.animations, config.animation);
        
        if (clip) {
            mixer.clipAction(clip).play();
        } else {
            mixer.clipAction(gltf.animations[0]).play();
        }
    }
});

const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});