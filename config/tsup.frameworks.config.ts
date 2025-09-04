import path from 'node:path';
import fs from 'node:fs';
import { defineConfig } from 'tsup';

const PACKAGE_ROOT_PATH = process.cwd();
const SRC_PATH = path.join(PACKAGE_ROOT_PATH, 'src');

function getFrameworkEntries() {
  const entries: Record<string, string> = {};
  const frameworks = ['react', 'preact', 'vue', 'svelte'];
  frameworks.forEach((framework) => {
    const frameworkEntry = path.join(SRC_PATH, framework, 'index.ts');
    if (fs.existsSync(frameworkEntry)) {
      entries[`${framework}/index`] = frameworkEntry;
    }
  });
  return entries;
}

function getPackageName() {
  const packageJsonPath = path.join(PACKAGE_ROOT_PATH, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  return packageJson.name;
}

const PACKAGE_NAME = getPackageName();

export default defineConfig((options) => {
  const entries = getFrameworkEntries();

  // If no framework entries found, return an empty config
  // This prevents tsup from erroring when no frameworks are present
  if (Object.keys(entries).length === 0) {
    console.log('No framework entries found. Skipping framework build.');
    return []; // Return an empty array to skip the build without errors
  }

  return {
    entry: entries,
    dts: true,
    format: ['cjs', 'esm'],
    sourcemap: true,
    clean: false, // Don't clean, as we need the core build output
    outDir: 'dist',
    tsconfig: path.join(PACKAGE_ROOT_PATH, 'tsconfig.json'),
    external: [PACKAGE_NAME], // Treat the core package as external
  };
});
