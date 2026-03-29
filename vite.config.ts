import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 4173,
  },
  build: {
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
        },
      },
    },
  },
});
