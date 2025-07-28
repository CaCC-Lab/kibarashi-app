#!/bin/bash

echo "Fixing remaining lint errors..."

# Fix import.meta.env as any
find frontend/src -name "*.ts*" -exec sed -i 's/(import\.meta\.env as any)/(import.meta.env as Record<string, string>)/g' {} \;

# Fix specific files
sed -i 's/default: ({ item, onDelete: _onDelete, onUpdateRating: _onUpdateRating, onUpdateNote: _onUpdateNote }: MockHistoryItemProps)/default: ({ item }: MockHistoryItemProps)/g' frontend/src/features/history/HistoryList.test.tsx

# Fix HistoryList.tsx
sed -i 's/acceptedFiles: any\[\]/acceptedFiles: File[]/g' frontend/src/features/history/HistoryList.tsx

# Fix SituationSelector.tsx 
sed -i 's/getRootProps: () => any/getRootProps: () => React.HTMLAttributes<HTMLDivElement>/g' frontend/src/features/situation/SituationSelector.tsx

# Fix useABTest files
sed -i 's/trackMetric: (name: string, data: any)/trackMetric: (name: string, data: Record<string, unknown>)/g' frontend/src/hooks/useABTest.ts
sed -i 's/logExperimentExposure: (experimentName: string, variant: any)/logExperimentExposure: (experimentName: string, variant: string)/g' frontend/src/hooks/useABTest.ts
sed -i 's/const { result } = renderHook/const { } = renderHook/g' frontend/src/hooks/useABTest.test.ts
sed -i 's/const { result } = renderHook/const { } = renderHook/g' frontend/src/hooks/useStudentABTest.test.ts

# Fix Career and Job Seeker AB Test hooks
sed -i 's/trackMetric: (metric: string, data?: any)/trackMetric: (metric: string, data?: Record<string, unknown>)/g' frontend/src/hooks/useCareerChangerABTest.ts frontend/src/hooks/useJobSeekerABTest.ts
sed -i 's/const trackMetric = useCallback((metric: string, data: any = {})/const trackMetric = useCallback((metric: string, data: Record<string, unknown> = {})/g' frontend/src/hooks/useCareerChangerABTest.ts frontend/src/hooks/useJobSeekerABTest.ts

# Fix analytics service
sed -i 's/logEvent(name: string, data: any)/logEvent(name: string, data: Record<string, unknown>)/g' frontend/src/services/analytics/abTestService.ts

# Fix API client
sed -i 's/} catch (error: any) {/} catch (error) {/g' frontend/src/services/api/client.ts

# Fix suggestionAdapter test
sed -i 's/(transformSuggestion as any)/(transformSuggestion as unknown as { _original: typeof transformSuggestion })/g' frontend/src/services/api/suggestionAdapter.test.ts

# Fix TTS service
sed -i 's/cache: Map<string, any>/cache: Map<string, AudioBuffer | string>/g' frontend/src/services/api/tts.ts

# Fix browserTTS test
sed -i 's/(speechSynthesis as any)/(speechSynthesis as unknown as SpeechSynthesis \& { _voices: SpeechSynthesisVoice[] })/g' frontend/src/services/browserTTS.test.ts
sed -i 's/(window\.speechSynthesis as any)/(window.speechSynthesis as unknown as SpeechSynthesis \& { _voices: SpeechSynthesisVoice[] })/g' frontend/src/services/browserTTS.test.ts

# Fix contextAPI
sed -i 's/getMonthlyTrend: async (_month?: number)/getMonthlyTrend: async ()/g' frontend/src/services/contextAPI.ts

# Fix appDataManager test
sed -i 's/} catch (error) {/} catch {/g' frontend/src/services/storage/appDataManager.test.ts
sed -i 's/async (data: any)/async (data: unknown)/g' frontend/src/services/storage/appDataManager.test.ts
sed -i 's/async (callback: (data: any)/async (callback: (data: unknown)/g' frontend/src/services/storage/appDataManager.test.ts

# Fix historyStorage test
sed -i 's/(localStorage\.getItem as any)/(localStorage.getItem as jest.Mock)/g' frontend/src/services/storage/historyStorage.test.ts

# Fix metrics.ts
sed -i 's/recordWebVitals(event: Event)/recordWebVitals()/g' frontend/src/utils/metrics.ts

# Fix tests/setup.ts
cat > frontend/tests/setup.ts << 'EOF'
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock HTMLMediaElement
window.HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve());
window.HTMLMediaElement.prototype.pause = vi.fn();
window.HTMLMediaElement.prototype.load = vi.fn();

// Mock Audio constructor
global.Audio = vi.fn().mockImplementation(() => ({
  play: vi.fn(() => Promise.resolve()),
  pause: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  load: vi.fn(),
  currentTime: 0,
  duration: 0,
  paused: true,
  ended: false,
  error: null,
  src: '',
  volume: 1,
  playbackRate: 1,
}));

// Mock Web Speech API
global.speechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: vi.fn(() => []),
  pending: false,
  speaking: false,
  paused: false,
  onvoiceschanged: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
};

global.SpeechSynthesisUtterance = vi.fn().mockImplementation(() => ({
  text: '',
  lang: '',
  voice: null,
  volume: 1,
  rate: 1,
  pitch: 1,
  onstart: null,
  onend: null,
  onerror: null,
  onpause: null,
  onresume: null,
  onmark: null,
  onboundary: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
  takeRecords: vi.fn(() => []),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock performance.mark and performance.measure
global.performance.mark = vi.fn();
global.performance.measure = vi.fn();

// Mock crypto.randomUUID
global.crypto.randomUUID = vi.fn(() => 'test-uuid-' + Math.random().toString(36).substr(2, 9));

// Setup environment variables
process.env.VITE_API_URL = 'http://localhost:3004';
process.env.VITE_API_TIMEOUT = '10000';
process.env.VITE_DEFAULT_DURATION = '5';
process.env.VITE_DURATION_OPTIONS = '[5, 15, 30]';
EOF

# Fix vite.config.ts
cat > frontend/vite.config.ts << 'EOF'
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
EOF

# Fix SuggestionDetail hook deps
sed -i '65s/\[\]/\[completeHistory, currentHistoryId, duration\]/g' frontend/src/features/suggestion/SuggestionDetail.tsx

# Fix useAudioPlayer hook deps
sed -i '109s/\[isPlaying, audioContext, playerState\]/\[audioContext, playerState\]/g' frontend/src/hooks/useAudioPlayer.ts

echo "Fixes applied. Running lint check..."
cd frontend && npm run lint