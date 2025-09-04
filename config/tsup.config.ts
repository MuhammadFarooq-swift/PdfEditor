import path from 'node:path';
import { defineConfig } from 'tsup';

const PACKAGE_ROOT_PATH = process.cwd();

export default defineConfig({
  entry: ['src/index.ts'],
  dts: true, // Generate declaration files
  format: ['cjs', 'esm'],
  sourcemap: true,
  clean: true, // Clean the dist folder before building
  outDir: 'dist',
  tsconfig: path.join(PACKAGE_ROOT_PATH, 'tsconfig.json'),
});
