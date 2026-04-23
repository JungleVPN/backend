import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgLoader from 'vite-svg-loader';

export default defineConfig({
  plugins: [
    react(),
    svgLoader({
      defaultImport: 'url', // or 'raw'
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    postcss: './postcss.config.mjs',
  },
  server: {
    port: 7090,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
