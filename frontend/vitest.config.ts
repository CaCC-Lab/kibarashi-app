import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/main.tsx',
        'dist/',
        'dev-dist/**',
        'generate-icons.js',
        'src/utils/reportWebVitals.ts',
        '**/sw.js',
        '**/registerSW.js',
      ],
    },
  },
});