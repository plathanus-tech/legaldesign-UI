import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// App do protótipo ("sistema"). Para publicar em subcaminho (GitHub Pages), defina SISTEMA_BASE=/repo/sistema/ no build.
export default defineConfig({
  root: 'sistema',
  base: process.env.SISTEMA_BASE ?? '/',
  plugins: [react()],
  // as telas vêm do Storybook: em /sistema/ ele fica em ../storybook/; no dev local, aponte VITE_STORYBOOK_URL=http://localhost:6008/
  define: { "import.meta.env.VITE_STORYBOOK_URL": JSON.stringify(process.env.VITE_STORYBOOK_URL ?? "../storybook/") },
  server: { fs: { allow: ['..'] } },
  build: { outDir: '../dist/sistema', emptyOutDir: true },
});
