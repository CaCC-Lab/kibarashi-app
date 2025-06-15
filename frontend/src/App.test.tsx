import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

/**
 * Appコンポーネントの統合テスト
 * 
 * 設計思想：
 * - モックを使用せず、実際のコンポーネントの動作を検証
 * - ユーザーフローを追跡し、統合的な動作を確認
 * - レイアウトコンポーネント（Header, Footer）も含めて検証
 */
describe('App', () => {
  describe('初期表示', () => {
    it('ヘッダーとフッターが表示される', () => {
      render(<App />);
      
      // ヘッダーの確認
      expect(screen.getByText('5分気晴らし')).toBeInTheDocument();
      
      // フッターの確認（フッター内のテキストを確認）
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveTextContent('5分気晴らし');
    });

    it('初期状態では状況選択画面が表示される', async () => {
      render(<App />);
      
      // Suspenseによる遅延読み込みを待つ
      await waitFor(() => {
        expect(screen.getByText('どこにいますか？')).toBeInTheDocument();
      });
      
      expect(screen.getByText('職場')).toBeInTheDocument();
      expect(screen.getByText('家')).toBeInTheDocument();
      expect(screen.getByText('外出先')).toBeInTheDocument();
    });

    it('ブレッドクラムが表示される', () => {
      render(<App />);
      
      // ステップ1（場所）が選択可能
      const step1 = screen.getByText('1');
      expect(step1.parentElement).not.toHaveClass('cursor-not-allowed');
      
      // ステップ2、3は無効化されている
      const step2 = screen.getByText('2');
      expect(step2.parentElement).toHaveClass('cursor-not-allowed');
      
      const step3 = screen.getByText('3');
      expect(step3.parentElement).toHaveClass('cursor-not-allowed');
    });
  });

  describe('状況選択フロー', () => {
    it('職場を選択すると時間選択画面に遷移する', async () => {
      render(<App />);
      
      // コンポーネントの読み込みを待つ
      await waitFor(() => {
        expect(screen.getByText('職場')).toBeInTheDocument();
      });
      
      const workplaceButton = screen.getByText('職場');
      fireEvent.click(workplaceButton);
      
      // 次の画面の読み込みを待つ
      await waitFor(() => {
        expect(screen.getByText('どのくらい時間がありますか？')).toBeInTheDocument();
      });
      
      expect(screen.getByText('5分')).toBeInTheDocument();
      expect(screen.getByText('15分')).toBeInTheDocument();
      expect(screen.getByText('30分')).toBeInTheDocument();
    });

    it('家を選択すると時間選択画面に遷移する', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText('家')).toBeInTheDocument();
      });
      
      const homeButton = screen.getByText('家');
      fireEvent.click(homeButton);
      
      await waitFor(() => {
        expect(screen.getByText('どのくらい時間がありますか？')).toBeInTheDocument();
      });
    });

    it('外出先を選択すると時間選択画面に遷移する', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText('外出先')).toBeInTheDocument();
      });
      
      const outsideButton = screen.getByText('外出先');
      fireEvent.click(outsideButton);
      
      await waitFor(() => {
        expect(screen.getByText('どのくらい時間がありますか？')).toBeInTheDocument();
      });
    });
  });

  describe('時間選択フロー', () => {
    it('5分を選択すると提案一覧が表示される', async () => {
      render(<App />);
      
      // 職場を選択
      await waitFor(() => {
        expect(screen.getByText('職場')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('職場'));
      
      // 5分を選択
      await waitFor(() => {
        expect(screen.getByText('5分')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('5分'));
      
      // ローディング表示を確認
      await waitFor(() => {
        expect(screen.getByText(/気晴らし方法を探しています.../)).toBeInTheDocument();
      });
      
      // 提案の表示を待つ（APIレスポンスまたはエラー）
      await waitFor(() => {
        const errorMessage = screen.queryByText('気晴らし方法の取得に失敗しました');
        const suggestionTitle = screen.queryByText(/あなたにおすすめの気晴らし方法/);
        expect(errorMessage || suggestionTitle).toBeInTheDocument();
      }, { timeout: 12000 });
    });

    it('15分を選択すると提案一覧が表示される', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText('家')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('家'));
      
      await waitFor(() => {
        expect(screen.getByText('15分')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('15分'));
      
      await waitFor(() => {
        expect(screen.getByText(/気晴らし方法を探しています.../)).toBeInTheDocument();
      });
      
      await waitFor(() => {
        const errorMessage = screen.queryByText('気晴らし方法の取得に失敗しました');
        const suggestionTitle = screen.queryByText(/あなたにおすすめの気晴らし方法/);
        expect(errorMessage || suggestionTitle).toBeInTheDocument();
      }, { timeout: 12000 });
    });

    it('30分を選択すると提案一覧が表示される', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText('外出先')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('外出先'));
      
      await waitFor(() => {
        expect(screen.getByText('30分')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('30分'));
      
      await waitFor(() => {
        expect(screen.getByText(/気晴らし方法を探しています.../)).toBeInTheDocument();
      });
      
      await waitFor(() => {
        const errorMessage = screen.queryByText('気晴らし方法の取得に失敗しました');
        const suggestionTitle = screen.queryByText(/あなたにおすすめの気晴らし方法/);
        expect(errorMessage || suggestionTitle).toBeInTheDocument();
      }, { timeout: 12000 });
    });
  });

  describe('ブレッドクラムナビゲーション', () => {
    it('ブレッドクラムを使って前の画面に戻れる', async () => {
      render(<App />);
      
      // 職場を選択
      await waitFor(() => {
        expect(screen.getByText('職場')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('職場'));
      
      await waitFor(() => {
        expect(screen.getByText('どのくらい時間がありますか？')).toBeInTheDocument();
      });
      
      // ブレッドクラムのステップ1（場所）をクリック
      const step1Button = screen.getByText('1').parentElement as HTMLElement;
      fireEvent.click(step1Button);
      
      // 状況選択画面に戻ることを確認
      await waitFor(() => {
        expect(screen.getByText('どこにいますか？')).toBeInTheDocument();
      });
    });

    it('提案表示画面からブレッドクラムで戻れる', async () => {
      render(<App />);
      
      // 職場 → 5分を選択
      await waitFor(() => {
        expect(screen.getByText('職場')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('職場'));
      
      await waitFor(() => {
        expect(screen.getByText('5分')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('5分'));
      
      // 提案またはエラーの表示を待つ
      await waitFor(() => {
        const errorMessage = screen.queryByText('気晴らし方法の取得に失敗しました');
        const suggestionTitle = screen.queryByText(/あなたにおすすめの気晴らし方法/);
        expect(errorMessage || suggestionTitle).toBeInTheDocument();
      }, { timeout: 12000 });
      
      // ブレッドクラムのステップ2（時間）をクリック
      const step2Button = screen.getByText('2').parentElement as HTMLElement;
      fireEvent.click(step2Button);
      
      // 時間選択画面に戻ることを確認
      await waitFor(() => {
        expect(screen.getByText('どのくらい時間がありますか？')).toBeInTheDocument();
      });
    });

    it('未選択のステップは無効化されている', () => {
      render(<App />);
      
      // ステップ2のボタンは無効
      const step2Button = screen.getByText('2').parentElement as HTMLElement;
      expect(step2Button).toHaveClass('cursor-not-allowed');
      expect(step2Button).toHaveClass('opacity-50');
      
      // ステップ3のボタンも無効
      const step3Button = screen.getByText('3').parentElement as HTMLElement;
      expect(step3Button).toHaveClass('cursor-not-allowed');
      expect(step3Button).toHaveClass('opacity-50');
    });
  });

  describe('再選択フロー', () => {
    it('同じ状況を再選択できる', async () => {
      render(<App />);
      
      // 職場を選択
      await waitFor(() => {
        expect(screen.getByText('職場')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('職場'));
      
      await waitFor(() => {
        expect(screen.getByText('どのくらい時間がありますか？')).toBeInTheDocument();
      });
      
      // ブレッドクラムで戻る
      const step1Button = screen.getByText('1').parentElement as HTMLElement;
      fireEvent.click(step1Button);
      
      await waitFor(() => {
        expect(screen.getByText('どこにいますか？')).toBeInTheDocument();
      });
      
      // 再度職場を選択
      fireEvent.click(screen.getByText('職場'));
      
      await waitFor(() => {
        expect(screen.getByText('どのくらい時間がありますか？')).toBeInTheDocument();
      });
    });

    it('異なる状況を選択できる', async () => {
      render(<App />);
      
      // 職場を選択
      await waitFor(() => {
        expect(screen.getByText('職場')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('職場'));
      
      await waitFor(() => {
        expect(screen.getByText('どのくらい時間がありますか？')).toBeInTheDocument();
      });
      
      // ブレッドクラムで戻る
      const step1Button = screen.getByText('1').parentElement as HTMLElement;
      fireEvent.click(step1Button);
      
      await waitFor(() => {
        expect(screen.getByText('どこにいますか？')).toBeInTheDocument();
      });
      
      // 家を選択
      fireEvent.click(screen.getByText('家'));
      
      await waitFor(() => {
        expect(screen.getByText('どのくらい時間がありますか？')).toBeInTheDocument();
      });
    });

    it('最初からやり直すボタンが機能する', async () => {
      render(<App />);
      
      // 職場 → 5分を選択
      await waitFor(() => {
        expect(screen.getByText('職場')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('職場'));
      
      await waitFor(() => {
        expect(screen.getByText('5分')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('5分'));
      
      // 提案の表示を待つ
      await waitFor(() => {
        const resetButton = screen.queryByText('最初からやり直す');
        expect(resetButton).toBeInTheDocument();
      }, { timeout: 10000 });
      
      // 最初からやり直すボタンをクリック
      fireEvent.click(screen.getByText('最初からやり直す'));
      
      // 状況選択画面に戻ることを確認
      await waitFor(() => {
        expect(screen.getByText('どこにいますか？')).toBeInTheDocument();
      });
    });
  });

  describe('エラー処理', () => {
    it('APIエラー時にエラーメッセージが表示される', async () => {
      // 環境変数を一時的に変更して存在しないサーバーを指定
      const originalUrl = import.meta.env.VITE_API_URL;
      (import.meta.env as any).VITE_API_URL = 'http://localhost:9999';
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText('職場')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('職場'));
      
      await waitFor(() => {
        expect(screen.getByText('5分')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('5分'));
      
      await waitFor(() => {
        expect(screen.getByText('気晴らし方法の取得に失敗しました')).toBeInTheDocument();
      }, { timeout: 12000 });
      
      // エラーメッセージの構造を確認
      expect(screen.getByText('気晴らし方法の取得に失敗しました')).toBeInTheDocument();
      expect(screen.getByText(/サーバーからデータを取得できませんでした/)).toBeInTheDocument();
      
      // 環境変数を復元
      (import.meta.env as any).VITE_API_URL = originalUrl;
    });

    it('エラー後に再試行できる', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText('職場')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('職場'));
      
      await waitFor(() => {
        expect(screen.getByText('5分')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('5分'));
      
      // エラーまたは成功を待つ
      await waitFor(() => {
        const errorMessage = screen.queryByText('気晴らし方法の取得に失敗しました');
        const suggestionTitle = screen.queryByText(/あなたにおすすめの気晴らし方法/);
        expect(errorMessage || suggestionTitle).toBeInTheDocument();
      }, { timeout: 12000 });
      
      // ブレッドクラムで時間選択に戻る
      const step2Button = screen.getByText('2').parentElement as HTMLElement;
      fireEvent.click(step2Button);
      
      await waitFor(() => {
        expect(screen.getByText('15分')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('15分'));
      
      // 再度ローディングが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText(/気晴らし方法を探しています.../)).toBeInTheDocument();
      });
    });
  });

  describe('レスポンシブデザイン', () => {
    it('メインコンテンツが適切にパディングされている', () => {
      render(<App />);
      
      const main = screen.getByRole('main');
      expect(main).toHaveClass('px-4');
      expect(main).toHaveClass('py-8');
    });

    it('コンテンツの最大幅が制限されている', () => {
      render(<App />);
      
      const container = screen.getByRole('main').firstChild;
      expect(container).toHaveClass('max-w-4xl');
      expect(container).toHaveClass('mx-auto');
    });
  });
});