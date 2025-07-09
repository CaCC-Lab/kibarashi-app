import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  build: {
    manifest: true, // マニフェストファイルを生成
    // バンドルサイズ最適化
    rollupOptions: {
      output: {
        // 一時的にmanualChunksを無効化
        // manualChunks: {
        //   vendor: ['react', 'react-dom'],
        //   utils: ['web-vitals'],
        // },
      },
    },
    // 圧縮設定
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // 一時的にconsole.logを残す
        drop_debugger: true,
      },
    },
    // アセット最適化
    assetsInlineLimit: 4096,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 500,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt', // autoUpdateからpromptに変更
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
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
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,txt,woff,woff2}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true, // Service Workerを即座に更新
        runtimeCaching: [], // 一時的にランタイムキャッシュを無効化
      },
      devOptions: {
        enabled: false, // 一時的にPWAを無効化
        suppressWarnings: true,
        navigateFallback: 'index.html',
        type: 'module',
      },
      selfDestroying: true, // 既存のService Workerを削除
      disable: false, // PWA機能自体は有効（Service Workerのみ無効）
    })
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
        target: 'http://localhost:3004',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
})