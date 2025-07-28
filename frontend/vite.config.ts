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
      // 開発時にService Workerを完全に無効化
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
        runtimeCaching: [], // ランタイムキャッシュを無効化
        // APIリクエストをキャッシュ対象から除外
        navigateFallbackDenylist: [/^\/api\//],
      },
      devOptions: {
        enabled: false, // 開発時はPWAを無効化
        suppressWarnings: true,
        navigateFallback: 'index.html',
        type: 'module',
      },
      selfDestroying: true, // 既存のService Workerを削除
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
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (_proxyReq, req) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
})