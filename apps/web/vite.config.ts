import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
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
        theme_color: '#007AFF',
        background_color: '#F2F2F7',
        icons: [
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
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
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
            return 'vendor';
          }
          if (id.includes('node_modules/@supabase')) {
            return 'supabase';
          }
          if (id.includes('content/kana')) return 'content-kana';
          if (id.includes('/n5.json') || id.includes('/n5/')) return 'content-n5';
          if (id.includes('/n4.json') || id.includes('/n4/')) return 'content-n4';
          if (id.includes('/n3.json') || id.includes('/n3/')) return 'content-n3';
          if (id.includes('packages/content')) return 'content-core';
        },
      },
    },
  },
  server: {
    port: 5173,
  },
});
