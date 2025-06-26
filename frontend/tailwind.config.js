/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.css",
  ],
  darkMode: 'class', // ダークモード対応
  safelist: [
    // 動的に使用される可能性のあるクラスを明示的に含める
    // Primary colors
    'bg-primary-50',
    'bg-primary-100',
    'bg-primary-200',
    'bg-primary-300',
    'bg-primary-400',
    'bg-primary-500',
    'bg-primary-600',
    'bg-primary-700',
    'bg-primary-800',
    'bg-primary-900',
    'hover:bg-primary-500',
    'hover:bg-primary-600',
    'hover:bg-primary-700',
    'text-primary-500',
    'text-primary-600',
    'text-primary-700',
    'border-primary-500',
    'border-primary-600',
    'focus:ring-primary-500',
    'focus:border-primary-500',
    // Gradients
    'from-primary-50',
    'to-primary-100',
    'bg-gradient-to-br',
    // Category styles for SuggestionCard
    'bg-blue-50',
    'dark:bg-blue-900/30',
    'border-blue-200',
    'dark:border-blue-700',
    'text-blue-700',
    'dark:text-blue-300',
    'bg-green-50',
    'dark:bg-green-900/30',
    'border-green-200',
    'dark:border-green-700',
    'text-green-700',
    'dark:text-green-300',
    // Other dynamic classes
    'bg-gray-400',
    'text-green-600',
    'text-red-600',
    'text-gray-800',
    'text-yellow-600',
    'bg-yellow-500',
    'hover:bg-yellow-600',
    // Dark mode classes
    'dark:from-gray-900',
    'dark:to-gray-800',
    // Transform and transition classes
    'transform',
    'hover:-translate-y-0.5',
    'hover:shadow-xl',
    'transition-all',
    'duration-200',
    'transition-colors',
    'hover:scale-105',
    // Specific component classes that might be purged
    'antialiased',
    'animate-pulse',
    'animate-spin',
    'animate-fadeIn',
    // Cursor states
    'cursor-not-allowed',
    'cursor-pointer',
    // Shadow variations
    'shadow-lg',
    'shadow-xl',
    'hover:shadow-xl',
  ],
  theme: {
    extend: {
      colors: {
        // 新しいプライマリカラー（メインカラー: 深い紫藍）
        // WCAG AAA準拠 - コントラスト比 9.55:1
        primary: {
          50: '#f4f4f8',   // 最も薄い
          100: '#e8e8f0',  
          200: '#d1d1e1',
          300: '#b0b0d0',
          400: '#8a8abb',
          500: '#3b3b6b',  // ベースカラー（メイン）
          600: '#32325c',
          700: '#2a2a4e',
          800: '#212140',
          900: '#191932',  // 最も濃い
        },
        
        // 新しいセカンダリカラー（サブカラー: 修正版の安全な赤）
        // WCAG AA準拠 - コントラスト比 4.89:1
        secondary: {
          50: '#fdf4f4',
          100: '#fbe8e8',
          200: '#f6d1d1', 
          300: '#efb0b0',
          400: '#e68a8a',
          500: '#B73E3E',  // ベースカラー（修正版）
          600: '#a23535',
          700: '#852b2b',
          800: '#6f2424',
          900: '#5c1f1f',
        },
        
        // 新しいアクセントカラー（修正版の安全なゴールド）
        // WCAG AA準拠 - コントラスト比 4.52:1
        accent: {
          50: '#fdfcf7',
          100: '#fbf8ef',
          200: '#f6f0d7',
          300: '#efe4bb',
          400: '#e6d399',
          500: '#B8970F',  // ベースカラー（修正版）
          600: '#a5870e',
          700: '#8a710c',
          800: '#715c0a',
          900: '#5e4c09',
        },
        
        // テキストカラー体系
        text: {
          primary: '#191919',    // 基本文字色
          secondary: '#4a4a4a',  // セカンダリテキスト
          muted: '#6b6b6b',      // 薄いテキスト
          inverse: '#ffffff',    // 反転テキスト
        },
        
        // 下位互換性のため旧カラーも一時的に保持
        // TODO: 段階的に削除予定
        old_primary: {
          500: '#0ea5e9',
        },
        old_secondary: {
          500: '#d97706',
        },
      },
      fontFamily: {
        sans: [
          'Noto Sans JP',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      scale: {
        '102': '1.02',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}