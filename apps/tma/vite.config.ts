import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 7091,
    allowedHosts: ['national-content-barnacle.ngrok-free.app'],
    /**
     * TMA requires HTTPS in production (served at tma.thejungle.pro).
     * For local dev, use ngrok or a reverse proxy to expose with HTTPS,
     * or configure `https: { key, cert }` here with a self-signed certificate.
     */
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
