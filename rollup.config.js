/* eslint-disable no-underscore-dangle */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, './package.json'), 'utf8'));

export default {
  input: 'src/index.ts', // your main TypeScript file
  output: [
    {
      file: 'dist/bundle.cjs.js', // output bundle location for CommonJS
      format: 'cjs', // CommonJS format for Node.js
      sourcemap: process.env.BUILD_DEV === 'true', // Conditionally generate sourcemaps
    },
    {
      file: 'dist/bundle.esm.js', // output bundle location for ESM
      format: 'esm', // ES Module format for import
      sourcemap: process.env.BUILD_DEV === 'true', // Conditionally generate sourcemaps
    },
    {
      file: 'dist/bundle.iife.js', // output bundle location for IIFE
      format: 'iife', // Immediately-invoked Function Expression — suitable for <script> tags
      name: 'Nucleus',
      sourcemap: process.env.BUILD_DEV === 'true', // Conditionally generate sourcemaps
    },
  ],
  plugins: [
    typescript({
      // this option enables use of the declarations directory defined in tsconfig.json
      useTsconfigDeclarationDir: true,
      // this enables generation of declaration files and specifies the output directory
      tsconfigOverride: {
        compilerOptions: {
          declaration: true,
          declarationDir: './dist/types',
        },
      },
    }),
    resolve(),
    commonjs(),
    replace({
      preventAssignment: true, // This is required since rollup plugin replace v3.0.0
      values: {
        __VERSION__: JSON.stringify(pkg.version),
      },
    }),
  ],
};
