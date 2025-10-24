// lutTransform.ts
import {
    Fn, vec2, vec4, float, floor, fract, min, mix, texture,
} from 'three/tsl';
import {Texture} from "three";
import {renderOutput} from "three/tsl";
type RenderOutputObj = ReturnType<typeof renderOutput>;

/**
 * Interpolation methods for the LUT transform.
 * @type {LUTInterpolation}
 * @enum {'zOnly' | 'trilinear'}
 */

export type LUTInterpolation = 'zOnly' | 'trilinear';


/**
 * Options for the LUT transform.
 * @interface LUTTransformOptions
 * @property {number} size - The size of the LUT (e.g., 64 for a 64x64x64 LUT).
 * @property {number} grid - The grid size of the LUT (e.g., 8 for an 8x8 grid).
 * @property {LUTInterpolation} [interp='zOnly'] - The interpolation method ('zOnly' or 'trilinear').
 * @property {boolean} [clampInput=true] - Whether to clamp input colors to the [0, 1] range.
 */
export interface LUTTransformOptions {
    size: number;
    grid: number;
    interp?: LUTInterpolation;
    clampInput?: boolean;
}


/**
 * TSL function for creating a Lut operator node which performs edge detection with a sobel filter.
 *
 * @tsl
 * @function
 * @param {Node<vec4>} node - The node that represents the input of the effect.
 * @param {LUTTransformOptions} options - Options for the LUT transform.
 *
 * @returns {Node<vec4>} The resulting node with the LUT transform applied.
 */
export const makeLUTTransform = (
    {size, grid, interp = 'zOnly', clampInput = true}: LUTTransformOptions
) => {
    const S = float(size);
    const G = float(grid);

    return Fn(([color, lut]: [RenderOutputObj, Texture]) => {
        const c = clampInput ? (color as any).clamp(vec4(0.0), vec4(1.0)) : color as any;

        const b = (c as any).b.mul(S.sub(1.0));
        const z0 = floor(b);
        const z1 = min(z0.add(1.0), S.sub(1.0));
        const f = fract(b);

        const rg = (c as any).rg.mul(S.sub(1.0)).add(0.5).div(S);

        const tileUV = (slice: any) => {
            const sx = fract(slice.div(G));
            const sy = floor(slice.div(G)).div(G);
            return rg.add(vec2(sx, sy)).div(G);
        };

        const uv0 = tileUV(z0);
        const uv1 = tileUV(z1);

        if (interp === 'zOnly') {
            const c0 = texture(lut, uv0).rgb;
            const c1 = texture(lut, uv1).rgb;
            return vec4(mix(c0, c1, f), (c as any).a);
        } else {
            const step = vec2(1.0).div(S.mul(G));

            const uv00 = uv0;
            const uv10 = uv0.add(vec2(step.x, 0.0));
            const uv01 = uv0.add(vec2(0.0, step.y));
            const uv11 = uv0.add(step);

            const uv00b = uv1;
            const uv10b = uv1.add(vec2(step.x, 0.0));
            const uv01b = uv1.add(vec2(0.0, step.y));
            const uv11b = uv1.add(step);

            const fr = fract((c as any).r.mul(S.sub(1.0)));
            const fg = fract((c as any).g.mul(S.sub(1.0)));

            const a0 = mix(texture(lut, uv00).rgb, texture(lut, uv10).rgb, fr);
            const a1 = mix(texture(lut, uv01).rgb, texture(lut, uv11).rgb, fr);
            const c0 = mix(a0, a1, fg);

            const b0 = mix(texture(lut, uv00b).rgb, texture(lut, uv10b).rgb, fr);
            const b1 = mix(texture(lut, uv01b).rgb, texture(lut, uv11b).rgb, fr);
            const c1 = mix(b0, b1, fg);

            return vec4(mix(c0, c1, f), (c as any).a);
        }
    });
};
