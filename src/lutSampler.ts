// lutSampler.ts
import * as THREE from 'three/webgpu';

export interface LUT {
    texture: THREE.Texture;
    ready: Promise<void>;
}

export interface LUTOptions {
    min?: THREE.MinificationTextureFilter;
    mag?: THREE.MagnificationTextureFilter;
    flipY?: boolean;
}

interface CreateLUTParams {
    input: string | HTMLImageElement | THREE.Texture;
    options?: LUTOptions;
    loader?: THREE.TextureLoader;
}

export async function createLUT({
                                    input,
                                    options = {},
                                    loader,
                                }: CreateLUTParams): Promise<LUT> {
    const {min = THREE.NearestFilter, mag = THREE.NearestFilter, flipY = false} = options;

    const getTexture = async (): Promise<THREE.Texture> => {
        if (input instanceof THREE.Texture) return input;
        if (typeof input === 'string') {
            const usedLoader = loader ?? new THREE.TextureLoader();
            return await new Promise<THREE.Texture>((res, rej) =>
                usedLoader.load(input, res, undefined, rej)
            );
        }
        const t = new THREE.Texture(input);
        t.needsUpdate = true;
        return t;
    };

    const tex = await getTexture();

    tex.minFilter = min;
    tex.magFilter = mag;
    tex.generateMipmaps = false;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.flipY = flipY;
    tex.needsUpdate = true;

    return {texture: tex, ready: Promise.resolve()};
}
