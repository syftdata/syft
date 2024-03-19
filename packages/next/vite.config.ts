import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') };
  return {
    plugins: [
      react(),
      dts({
        insertTypesEntry: true
      }),
      tsconfigPaths()
    ],
    define: {
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV)
    },
    build: {
      minify: env.NODE_ENV === 'production',
      sourcemap: env.NODE_ENV === 'production',
      lib: {
        entry: path.resolve(__dirname, 'src/bundle/index.ts'),
        name: 'Syft',
        formats: ['es', 'umd'],
        fileName: (format: string) => `syft.${format}.js`
      }
    }
  };
});
