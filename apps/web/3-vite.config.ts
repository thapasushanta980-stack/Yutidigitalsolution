import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import { seoBuild } from './seo-build';
import { analytics } from './analytics';

// Standalone marketing site: development and production need no backend.
export default defineConfig(({ mode, isSsrBuild }) => ({
  plugins: [react(), analytics(), seoBuild(loadEnv(mode, process.cwd(), 'VITE_').VITE_SITE_URL || 'https://yuktids.com')],
  server: {
    port: 5173,
  },
  // Build-time page rendering (prerender.mjs): bundle the packages whose
  // module format Node cannot import directly.
  ssr: {
    noExternal: ['gsap', 'react-helmet-async'],
  },
  build: {
    // Code-splitting: keep vendor libs in a separate chunk.
    rollupOptions: {
      output: {
        manualChunks: isSsrBuild ? undefined : {
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
}));
