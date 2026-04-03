import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@keiro/types': path.resolve(__dirname, '../../packages/types/src'),
      '@keiro/engine': path.resolve(__dirname, '../../packages/engine/src'),
      '@keiro/content': path.resolve(__dirname, '../../packages/content/src'),
    },
  },
});
