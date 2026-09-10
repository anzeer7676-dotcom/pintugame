import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  base: './',
  publicDir: 'public',
  resolve: {
    alias: {
      '@': `${root}games/sokoban/src`
    }
  },
  server: {
    host: true,
    port: 5180,
    open: false,
    cors: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      input: {
        portal: `${root}index.html`,
        sliding: `${root}games/sliding/index.html`,
        sokoban: `${root}games/sokoban/index.html`,
        poetry: `${root}games/poetry/index.html`
      }
    }
  }
})
