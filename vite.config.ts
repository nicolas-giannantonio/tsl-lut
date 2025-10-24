import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/index.ts',
            name: 'tsl-lut',
            formats: ['es', 'cjs'],
            fileName: (format) => `index.${format}.js`,
        },
        rollupOptions: {
            external: ['three', 'three/tsl', 'three/webgpu'],
            output: {
                exports: 'named',
                globals: {
                    three: 'THREE',
                    'three/tsl': 'THREE_TSL',
                    'three/webgpu': 'THREE',
                },
            }
        },
        sourcemap: true,
        emptyOutDir: true,
    },
});
