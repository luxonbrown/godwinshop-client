import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The dev server proxies API + upload requests to the Express backend
// so the browser never needs a hard-coded backend URL.
export default defineConfig({
  plugins: [react()],
  // Relative asset paths so the built app also works when loaded from
  // file:// inside the Electron (desktop) window. Identical behavior on web.
  base: './',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 900
  }
});