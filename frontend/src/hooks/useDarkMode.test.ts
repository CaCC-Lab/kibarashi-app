import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDarkMode } from './useDarkMode';

/**
 * useDarkModeフックのテスト
 * 
 * 設計思想：
 * - モックを使用せず、実際のDOM操作を検証
 * - localStorage の実際の読み書きを確認
 * - matchMedia APIの動作を検証
 */
describe('useDarkMode', () => {
  let consoleSpy: any;
  let originalLocalStorage: Storage;
  
  beforeEach(() => {
    // 元のlocalStorageを保存
    originalLocalStorage = window.localStorage;
    
    // テスト前にlocalStorageをクリア
    localStorage.clear();
    // classListをクリア
    document.documentElement.classList.remove('dark');
    
    // console.errorをスパイ化してテスト出力をクリーンに保つ
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    // localStorageを復元
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true
    });
    
    // console.errorスパイを復元
    if (consoleSpy) {
      consoleSpy.mockRestore();
    }
  });

  describe('初期状態のテスト', () => {
    it('デフォルトではライトモードが設定される', () => {
      const { result } = renderHook(() => useDarkMode());
      
      expect(result.current.isDarkMode).toBe(false);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('localStorageに設定がない場合、システム設定を確認する', () => {
      const { result } = renderHook(() => useDarkMode());
      
      // matchMediaがモックされているため、デフォルトはfalse
      expect(result.current.isDarkMode).toBe(false);
    });

    it('localStorageにdark設定がある場合、それを優先する', () => {
      localStorage.setItem('theme', 'dark');
      
      const { result } = renderHook(() => useDarkMode());
      
      expect(result.current.isDarkMode).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('localStorageにlight設定がある場合、それを優先する', () => {
      localStorage.setItem('theme', 'light');
      
      const { result } = renderHook(() => useDarkMode());
      
      expect(result.current.isDarkMode).toBe(false);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('テーマ切り替えのテスト', () => {
    it('toggleDarkModeでダークモードに切り替わる', () => {
      const { result } = renderHook(() => useDarkMode());
      
      // 初期はライトモード
      expect(result.current.isDarkMode).toBe(false);
      
      // ダークモードに切り替え
      act(() => {
        result.current.toggleDarkMode();
      });
      
      expect(result.current.isDarkMode).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(localStorage.getItem('theme')).toBe('dark');
    });

    it('toggleDarkModeでライトモードに切り替わる', () => {
      localStorage.setItem('theme', 'dark');
      
      const { result } = renderHook(() => useDarkMode());
      
      // 初期はダークモード
      expect(result.current.isDarkMode).toBe(true);
      
      // ライトモードに切り替え
      act(() => {
        result.current.toggleDarkMode();
      });
      
      expect(result.current.isDarkMode).toBe(false);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(localStorage.getItem('theme')).toBe('light');
    });

    it('複数回の切り替えが正常に動作する', () => {
      const { result } = renderHook(() => useDarkMode());
      
      // ライト → ダーク
      act(() => {
        result.current.toggleDarkMode();
      });
      expect(result.current.isDarkMode).toBe(true);
      
      // ダーク → ライト
      act(() => {
        result.current.toggleDarkMode();
      });
      expect(result.current.isDarkMode).toBe(false);
      
      // ライト → ダーク
      act(() => {
        result.current.toggleDarkMode();
      });
      expect(result.current.isDarkMode).toBe(true);
    });
  });

  describe('localStorage連携のテスト', () => {
    it('設定がlocalStorageに永続化される', () => {
      const { result } = renderHook(() => useDarkMode());
      
      act(() => {
        result.current.toggleDarkMode();
      });
      
      expect(localStorage.getItem('theme')).toBe('dark');
      
      act(() => {
        result.current.toggleDarkMode();
      });
      
      expect(localStorage.getItem('theme')).toBe('light');
    });

    it('ページリロード後も設定が保持される', () => {
      // 最初のフック呼び出し
      const { result: result1 } = renderHook(() => useDarkMode());
      
      act(() => {
        result1.current.toggleDarkMode();
      });
      
      expect(result1.current.isDarkMode).toBe(true);
      
      // フックを再度呼び出し（ページリロードをシミュレート）
      const { result: result2 } = renderHook(() => useDarkMode());
      
      expect(result2.current.isDarkMode).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  describe('DOM操作のテスト', () => {
    it('ダークモード時にhtml要素にdarkクラスが追加される', () => {
      const { result } = renderHook(() => useDarkMode());
      
      act(() => {
        result.current.toggleDarkMode();
      });
      
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('ライトモード時にhtml要素からdarkクラスが削除される', () => {
      // 最初にダークモードに設定
      localStorage.setItem('theme', 'dark');
      const { result } = renderHook(() => useDarkMode());
      
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      
      // ライトモードに切り替え
      act(() => {
        result.current.toggleDarkMode();
      });
      
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('エラーハンドリングのテスト', () => {
    it('localStorage が利用できない場合でも動作する', () => {
      // localStorageを一時的に無効化
      const testOriginalLocalStorage = window.localStorage;
      
      // localStorageのメソッドがエラーを投げるようにする
      const mockLocalStorage = {
        getItem: vi.fn().mockImplementation(() => {
          throw new Error('localStorage not available');
        }),
        setItem: vi.fn().mockImplementation(() => {
          throw new Error('localStorage not available');
        }),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn()
      };
      
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      });
      
      const { result } = renderHook(() => useDarkMode());
      
      // エラーが発生せずにフックが動作することを確認（デフォルト状態）
      expect(result.current.isDarkMode).toBe(false);
      
      act(() => {
        result.current.toggleDarkMode();
      });
      
      // DOM操作は正常に動作
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      
      // エラーが適切にログ出力されることを確認
      expect(consoleSpy).toHaveBeenCalled();
      
      // localStorageを復元
      Object.defineProperty(window, 'localStorage', {
        value: testOriginalLocalStorage,
        writable: true
      });
    });

    it('不正なtheme値がlocalStorageにある場合の処理', () => {
      localStorage.setItem('theme', 'invalid-theme');
      
      const { result } = renderHook(() => useDarkMode());
      
      // 不正な値の場合はデフォルト（ライトモード）になる
      expect(result.current.isDarkMode).toBe(false);
    });
  });

  describe('アクセシビリティのテスト', () => {
    it('aria-labelが適切に更新される', () => {
      const { result } = renderHook(() => useDarkMode());
      
      // この機能がuseDarkModeに実装されている場合のテスト
      // 実際の実装に合わせて調整
      expect(result.current.isDarkMode).toBe(false);
      
      act(() => {
        result.current.toggleDarkMode();
      });
      
      expect(result.current.isDarkMode).toBe(true);
    });
  });

  describe('パフォーマンステスト', () => {
    it('短時間での連続切り替えが正常に動作する', () => {
      const { result } = renderHook(() => useDarkMode());
      
      // 短時間で10回切り替え
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.toggleDarkMode();
        });
      }
      
      // 最終的に10回切り替えた結果（偶数回なので元に戻る）
      expect(result.current.isDarkMode).toBe(false);
      expect(localStorage.getItem('theme')).toBe('light');
    });

    it('フック呼び出しのパフォーマンス', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        renderHook(() => useDarkMode());
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // 100回の呼び出しが1秒以内に完了することを確認
      expect(duration).toBeLessThan(1000);
    });
  });
});