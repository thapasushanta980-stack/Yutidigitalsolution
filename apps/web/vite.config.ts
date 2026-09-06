import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Proxy /api and SEO files to the backend during development.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:4000', changeOrigin: true },
      '/sitemap.xml': { target: 'http://localhost:4000', changeOrigin: true },
      '/robots.txt': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },
  build: {
    // Code-splitting: keep vendor libs in a separate chunk.
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query'],
          motion: ['framer-motion'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
