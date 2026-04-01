import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@keiro/types': path.resolve(__dirname, '../../packages/types/src'),
      '@keiro/engine': path.resolve(__dirname, '../../packages/engine/src'),
      '@keiro/content': path.resolve(__dirname, '../../packages/content/src'),
    },
  },
  server: {
    port: 5174,
  },
});
