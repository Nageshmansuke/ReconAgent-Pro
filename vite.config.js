import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const dirname = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, '$1');

export default defineConfig({
  plugins: [react()],
  root: path.resolve(dirname, 'client'),
  build: {
    outDir: path.resolve(dirname, 'public'),
    emptyOutDir: true
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
});
