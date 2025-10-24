import '../style.css'
import * as THREE from 'three/webgpu'
import {
    vec4,
    uv,
    pass,
    renderOutput,
} from 'three/tsl'
import {createLUT} from "../../lutSampler.ts";
import {makeLUTTransform} from "../../lutTransform.ts";


// Canvas
const canvas = document.querySelector('#webgl') as HTMLCanvasElement
const loader = new THREE.TextureLoader();

// Scene
const scene = new THREE.Scene()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 0, 3)

scene.add(camera)


/**
 * Renderer
 */
const renderer = new THREE.WebGPURenderer({
    canvas: canvas,
    forceWebGL: false,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0x222222, 1);

/**
 * LUT
 */
const {texture: lutText} = await createLUT({
    input: './lookup_selective_color.png',
    loader: loader
});
const transform = makeLUTTransform({size: 64, grid: 8, interp: 'zOnly'});

/**
 * Post processing
 */
const postProcessing = new THREE.PostProcessing(renderer)
postProcessing.outputColorTransform = false

const scenePass = pass(scene, camera);
const outputPass = renderOutput(scenePass)

postProcessing.outputNode = transform(outputPass, lutText);
// postProcessing.outputNode = outputPass;


// Material
const material = new THREE.MeshBasicNodeMaterial()

material.colorNode = vec4(
    uv().mul(20.0).sin().add(1.0).mul(0.5),
    0.0,
    1.0
)

// Mesh
const box = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    material
)
scene.add(box)

/**
 * Animate
 */
const tick = () => {
    postProcessing.renderAsync()
}
renderer.setAnimationLoop(tick)
