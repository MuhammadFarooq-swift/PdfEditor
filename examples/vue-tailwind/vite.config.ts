import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: { port: 3000, open: true },
  build: { outDir: 'dist', sourcemap: true },
  optimizeDeps: {
    exclude: ['@embedpdf/engines'], // keep Pdfium engine out of pre‑bundle
  },
});
