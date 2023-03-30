import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import react from '@vitejs/plugin-react'

import manifest from './src/manifest'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    define: {
      global: {},
    },
    build: {
      emptyOutDir: true,
      outDir: 'build',
      rollupOptions: {
        input: {
          devpanel: './devpanel.html',
        },
        output: {
          chunkFileNames: 'assets/chunk-[hash].js',
        },
      },
    },

    plugins: [crx({ manifest }), react()],
  }
})
