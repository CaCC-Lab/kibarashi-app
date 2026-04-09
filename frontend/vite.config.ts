import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

const isCapacitor = process.env.VITE_BUILD_TARGET === 'capacitor';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  build: {
    manifest: true,
    rollupOptions: {
      output: {},
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true,
      },
    },
    assetsInlineLimit: 4096,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 500,
  },
  plugins: [
    react(),
    // Capacitorビルド時はPWAを無効化、Web版では有効
    ...(!isCapacitor ? [VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      disable: process.env.NODE_ENV === 'development',
      manifest: {
        name: '5分気晴らし',
        short_name: '気晴らし',
        description: '音声ガイド付きストレス解消アプリ',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,txt,woff,woff2}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [],
        navigateFallbackDenylist: [/^\/api\//],
      },
      devOptions: {
        enabled: false,
        suppressWarnings: true,
        navigateFallback: 'index.html',
        type: 'module',
      },
      selfDestroying: true,
    })] : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        configure: (proxy, _options) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
})