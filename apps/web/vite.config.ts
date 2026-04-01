import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
        clientsClaim: true,
        skipWaiting: true,
      },
      manifest: {
        name: 'Keiro — Learn Japanese',
        short_name: 'Keiro',
        description: 'Learn Japanese from zero to reading manga',
        display: 'standalone',
        start_url: '/',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        icons: [],
      },
    }),
  ],
  resolve: {
    alias: {
      '@keiro/types': path.resolve(__dirname, '../../packages/types/src'),
      '@keiro/engine': path.resolve(__dirname, '../../packages/engine/src'),
      '@keiro/content': path.resolve(__dirname, '../../packages/content/src'),
    },
  },
  server: {
    port: 5173,
  },
});
