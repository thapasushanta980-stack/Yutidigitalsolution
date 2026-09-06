import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Admin runs at /admin base and proxies the API in dev.
export default defineConfig({
  plugins: [react()],
  base: '/admin/',
  server: {
    port: 5174,
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },
});
