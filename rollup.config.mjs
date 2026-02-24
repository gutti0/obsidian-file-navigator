import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import copy from 'rollup-plugin-copy';

const isProduction = process.env.BUILD === 'production';

export default defineConfig({
  input: 'src/main.ts',
  output: {
    dir: 'build',
    entryFileNames: 'main.js',
    format: 'cjs',
    sourcemap: !isProduction,
    exports: 'default',
  },
  external: ['obsidian', 'electron', 'fs', 'path', 'os', 'crypto'],
  plugins: [
    nodeResolve({ browser: true }),
    commonjs(),
    json(),
    typescript({
      tsconfig: './tsconfig.json',
      sourceMap: !isProduction,
      inlineSources: !isProduction,
    }),
    copy({
      targets: [
        { src: 'manifest.json', dest: 'build' },
        { src: 'styles.css', dest: 'build' },
      ],
      copyOnce: false,
    }),
  ],
  onwarn(warning, warn) {
    if (warning.code === 'THIS_IS_UNDEFINED') {
      return;
    }
    warn(warning);
  },
});
