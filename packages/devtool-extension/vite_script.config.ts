import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    build: {
      emptyOutDir: false,
      outDir: 'build',
      rollupOptions: {
        input: 'src/content/react_devtools_hook.ts',
        output: {
          entryFileNames: 'scripts/[name].js',
        },
      },
    },
  }
})
