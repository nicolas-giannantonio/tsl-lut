# tsl-lut

Use a LUT texture to remap colors in a shader, as a post-process stage.

Inspired by the GLSL version of [mattdesl/glsl-lut](https://github.com/mattdesl/glsl-lut) and adapted to Three Shader
Language [(TSL)](https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language).

## Installation

```bash
npm install tsl-lut
```

## Usage
GUIDE [mattdesl/glsl-lut](https://github.com/mattdesl/glsl-lut)

First, grab the original (un-altered) lookup table [image](https://github.com/mattdesl/glsl-lut/blob/master/image/lookup.png).

Then you can apply any filters with Photoshop or at runtime to the lookup table image. These can be things like curves,
levels, grayscale, etc. Each transform must be independent of surrounding pixels (no blurs, median, etc.).


Then load the LUT texture in Three.js:


**Apply the LUT transform**
```js
import * as THREE from 'three/webgpu';
import { pass, renderOutput } from 'three/tsl';
import { createLUT, makeLUTTransform } from 'tsl-lut';

// 1) Load LUT texture
const { texture: lutTex } = await createLUT({
    input: '/lookup_selective_color.png'
});

// 2) Create the LUT transform (64^3 LUT packed as an 8x8 grid)
const transform = makeLUTTransform({ size: 64, grid: 8, interp: 'zOnly' });

// 3) Hook into post-processing
const postProcessing = new THREE.PostProcessing(renderer);
postProcessing.outputColorTransform = false;

const scenePass = pass(scene, camera);
const outputPass = renderOutput(scenePass);

postProcessing.outputNode = transform(outputPass, lutTex); // Apply LUT transform

```
### Options

Adding existing loaders:
```js
// ...
const {texture: lutText} = await createLUT({
    input: './lookup_miss.png',
    loader: loader, // your existing THREE.TextureLoader
    options: { 
        min: THREE.MinificationTextureFilter,
        mag: THREE.MagnificationTextureFilter,
        flipY: false
    }
});
```

## Notes

Use Nearest filtering, no mipmaps, and ClampToEdge for LUTs (handled in createLUT).

interp: 'zOnly' = 2 fetches/pixel (fast). interp: 'trilinear' = 8 fetches (smoother on RG).

Ensure the LUT size/grid match your image (e.g., 64 with grid 8 for a 512×512 packed LUT).


## About TSL
Official documentation : [Three.js-Shading-Language](https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language)


## License

MIT - [LICENSE.md](https://github.com/nicolas-giannantonio/tsl-lut/LICENSE.md)

Includes code adapted from [mattdesl/glsl-lut](https://github.com/mattdesl/glsl-lut/blob/master/LICENSE.md) (MIT © Matt DesLauriers).
