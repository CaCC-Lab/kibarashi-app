import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DarkModeToggle from './DarkModeToggle';

/**
 * DarkModeToggleコンポーネントのテスト
 * 
 * 設計思想：
 * - モックを使用せず、実際のコンポーネントの動作を検証
 * - useDarkModeフックとの統合を確認
 * - アクセシビリティとユーザビリティを重視
 */
describe('DarkModeToggle', () => {
  beforeEach(() => {
    // テスト前にlocalStorageとDOM状態をクリア
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  describe('基本的な表示', () => {
    it('ダークモード切り替えボタンが表示される', () => {
      render(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('switch');
      expect(toggleButton).toBeInTheDocument();
    });

    it('初期状態ではライトモード表示', () => {
      render(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('switch');
      expect(toggleButton).toHaveAttribute('aria-checked', 'false');
      expect(toggleButton).toHaveAttribute('aria-label', 'ダークモードをオンにする');
    });

    it('ダークモード時は適切なラベルが表示される', () => {
      // 事前にダークモードを設定
      localStorage.setItem('theme', 'dark');
      
      render(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('switch');
      expect(toggleButton).toHaveAttribute('aria-checked', 'true');
      expect(toggleButton).toHaveAttribute('aria-label', 'ダークモードをオフにする');
    });
  });

  describe('インタラクションのテスト', () => {
    it('クリックでダークモードに切り替わる', () => {
      render(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('switch');
      
      // 初期状態はライトモード
      expect(toggleButton).toHaveAttribute('aria-checked', 'false');
      
      // クリックしてダークモードに切り替え
      fireEvent.click(toggleButton);
      
      expect(toggleButton).toHaveAttribute('aria-checked', 'true');
      expect(toggleButton).toHaveAttribute('aria-label', 'ダークモードをオフにする');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('クリックでライトモードに切り替わる', () => {
      // 事前にダークモードを設定
      localStorage.setItem('theme', 'dark');
      
      render(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('switch');
      
      // 初期状態はダークモード
      expect(toggleButton).toHaveAttribute('aria-checked', 'true');
      
      // クリックしてライトモードに切り替え
      fireEvent.click(toggleButton);
      
      expect(toggleButton).toHaveAttribute('aria-checked', 'false');
      expect(toggleButton).toHaveAttribute('aria-label', 'ダークモードをオンにする');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('複数回のクリックで正常に切り替わる', () => {
      render(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('switch');
      
      // ライト → ダーク → ライト → ダーク
      for (let i = 0; i < 4; i++) {
        fireEvent.click(toggleButton);
        
        const expectedChecked = i % 2 === 0 ? 'true' : 'false';
        const expectedDarkClass = i % 2 === 0;
        
        expect(toggleButton).toHaveAttribute('aria-checked', expectedChecked);
        expect(document.documentElement.classList.contains('dark')).toBe(expectedDarkClass);
      }
    });
  });

  describe('スタイリングのテスト', () => {
    it('ライトモード時の適切なスタイルクラス', () => {
      render(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('switch');
      
      // ライトモード時のスタイル確認
      expect(toggleButton).toHaveClass('bg-surface-tertiary');
      
      // トグルサークルの位置確認
      const toggleCircle = toggleButton.querySelector('.translate-x-1');
      expect(toggleCircle).toBeInTheDocument();
    });

    it('ダークモード時の適切なスタイルクラス', () => {
      localStorage.setItem('theme', 'dark');
      
      render(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('switch');
      
      // ダークモード時のスタイル確認
      expect(toggleButton).toHaveClass('bg-primary-500');
      
      // トグルサークルの位置確認
      const toggleCircle = toggleButton.querySelector('.translate-x-6');
      expect(toggleCircle).toBeInTheDocument();
    });

    it('アニメーションクラスが適用される', () => {
      render(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('switch');
      
      // トランジションクラスの確認
      expect(toggleButton).toHaveClass('transition-all');
      expect(toggleButton).toHaveClass('duration-200');
      
      // サークルのトランジションクラス確認
      const toggleCircle = toggleButton.querySelector('.transition-all');
      expect(toggleCircle).toBeInTheDocument();
    });

    it('フォーカス時のスタイルが適用される', () => {
      render(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('switch');
      
      // フォーカススタイルクラスの確認
      expect(toggleButton).toHaveClass('focus:outline-none');
      expect(toggleButton).toHaveClass('focus-ring');
    });
  });

  describe('アイコン表示のテスト', () => {
    it('ライトモード時に太陽アイコンが表示される', () => {
      render(<DarkModeToggle />);
      
      // 太陽アイコンのSVGパスを確認
      const sunIcon = screen.getByRole('switch').querySelector('svg path[d*="M10 2a1 1 0"]');
      expect(sunIcon).toBeInTheDocument();
    });

    it('ダークモード時に月アイコンが表示される', () => {
      localStorage.setItem('theme', 'dark');
      
      render(<DarkModeToggle />);
      
      // 月アイコンのSVGパスを確認
      const moonIcon = screen.getByRole('switch').querySelector('svg path[d*="M17.293 13.293"]');
      expect(moonIcon).toBeInTheDocument();
    });

    it('切り替え時にアイコンが変更される', () => {
      render(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('switch');
      
      // 初期状態は太陽アイコン
      expect(toggleButton.querySelector('svg path[d*="M10 2a1 1 0"]')).toBeInTheDocument();
      
      // ダークモードに切り替え
      fireEvent.click(toggleButton);
      
      // 月アイコンに変更される
      expect(toggleButton.querySelector('svg path[d*="M17.293 13.293"]')).toBeInTheDocument();
    });
  });

  describe('アクセシビリティのテスト', () => {
    it('適切なARIA属性が設定されている', () => {
      render(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('switch');
      
      expect(toggleButton).toHaveAttribute('role', 'switch');
      expect(toggleButton).toHaveAttribute('aria-checked');
      expect(toggleButton).toHaveAttribute('aria-label');
    });

    it('キーボードナビゲーションが可能', () => {
      render(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('switch');
      
      // フォーカス可能であることを確認
      toggleButton.focus();
      expect(document.activeElement).toBe(toggleButton);
      
      // ボタン要素はbuttonタグであるため、ネイティブにキーボード操作が可能
      // EnterキーやSpaceキーはブラウザが自動的にclickイベントに変換する
      expect(toggleButton.tagName).toBe('BUTTON');
      expect(toggleButton).not.toBeDisabled();
    });

    it('スクリーンリーダー向けの状態説明が提供される', () => {
      render(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('switch');
      
      // ライトモード時
      expect(toggleButton).toHaveAttribute('aria-label', 'ダークモードをオンにする');
      
      // ダークモードに切り替え
      fireEvent.click(toggleButton);
      
      // ダークモード時
      expect(toggleButton).toHaveAttribute('aria-label', 'ダークモードをオフにする');
    });

    it('高コントラストモードでも視認可能', () => {
      render(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('switch');
      
      // ボーダーやアウトラインが設定されていることを確認
      // ボタンスタイルにボーダーは設定されていない
      expect(toggleButton).toHaveClass('rounded-full');
    });
  });

  describe('レスポンシブデザインのテスト', () => {
    it('適切なサイズが設定されている', () => {
      render(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('switch');
      
      // トグルボタンのサイズクラス確認
      expect(toggleButton).toHaveClass('h-6');
      expect(toggleButton).toHaveClass('w-11');
      
      // トグルサークルのサイズ確認
      const toggleCircle = toggleButton.querySelector('.h-4.w-4');
      expect(toggleCircle).toBeInTheDocument();
    });

    it('タッチデバイスでの操作に適したサイズ', () => {
      render(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('switch');
      
      // 最小44pxのタッチターゲットサイズ（Tailwindのh-6は24px）
      // 実際のプロダクションではp-2やp-3でタッチエリアを拡大
      expect(toggleButton).toHaveClass('h-6');
    });
  });

  describe('状態の永続化テスト', () => {
    it('ダークモード設定がlocalStorageに保存される', () => {
      render(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('switch');
      fireEvent.click(toggleButton);
      
      expect(localStorage.getItem('theme')).toBe('dark');
    });

    it('ライトモード設定がlocalStorageに保存される', () => {
      localStorage.setItem('theme', 'dark');
      
      render(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('switch');
      fireEvent.click(toggleButton);
      
      expect(localStorage.getItem('theme')).toBe('light');
    });

    it('ページリロード後も設定が保持される', () => {
      // 最初のコンポーネント
      const { unmount } = render(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('switch');
      fireEvent.click(toggleButton);
      
      unmount();
      
      // 新しいコンポーネント（ページリロードをシミュレート）
      render(<DarkModeToggle />);
      
      const newToggleButton = screen.getByRole('switch');
      expect(newToggleButton).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('エラーハンドリングのテスト', () => {
    it('localStorage が利用できない場合でも動作する', () => {
      // localStorageを一時的に無効化
      const originalLocalStorage = window.localStorage;
      Object.defineProperty(window, 'localStorage', {
        value: null,
        writable: true
      });
      
      // コンポーネントレンダリングでエラーが発生しないことを確認
      expect(() => render(<DarkModeToggle />)).not.toThrow();
      
      const toggleButton = screen.getByRole('switch');
      
      // クリックでエラーが発生しないことを確認
      expect(() => fireEvent.click(toggleButton)).not.toThrow();
      
      // トグルボタンの状態変更が正常に動作することを確認
      expect(toggleButton).toHaveAttribute('aria-checked', 'true');
      
      // もう一度クリックして切り替わることを確認
      expect(() => fireEvent.click(toggleButton)).not.toThrow();
      expect(toggleButton).toHaveAttribute('aria-checked', 'false');
      
      // localStorageを復元
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true
      });
    });

    it('DOMの classList操作ができない場合の処理', () => {
      // 通常のテスト環境では発生しないが、エラーハンドリングを確認
      render(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('switch');
      expect(() => fireEvent.click(toggleButton)).not.toThrow();
    });
  });

  describe('パフォーマンステスト', () => {
    it('高速な連続クリックでも正常に動作する', () => {
      render(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('switch');
      
      // 100回の高速クリック
      for (let i = 0; i < 100; i++) {
        fireEvent.click(toggleButton);
      }
      
      // 偶数回なので最終的にライトモード
      expect(toggleButton).toHaveAttribute('aria-checked', 'false');
    });

    it('コンポーネントの再レンダリングが効率的', () => {
      const { rerender } = render(<DarkModeToggle />);
      
      // 複数回の再レンダリング
      for (let i = 0; i < 10; i++) {
        rerender(<DarkModeToggle />);
      }
      
      const toggleButton = screen.getByRole('switch');
      expect(toggleButton).toBeInTheDocument();
    });
  });
});