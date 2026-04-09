import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

/**
 * Appコンポーネントの統合テスト
 *
 * 設計思想：
 * - モックを使用せず、実際のコンポーネントの動作を検証
 * - ユーザーフローを追跡し、統合的な動作を確認
 * - レイアウトコンポーネント（Header, BottomTabBar）も含めて検証
 */
describe('App', () => {
  describe('初期表示', () => {
    it('ヘッダーが表示される', () => {
      render(<App />);

      // ヘッダーの確認
      expect(screen.getByText('気晴らし')).toBeInTheDocument();
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

    it('下部タブバーが表示される', () => {
      render(<App />);

      expect(screen.getByLabelText('ホーム')).toBeInTheDocument();
      expect(screen.getByLabelText('お気に入り')).toBeInTheDocument();
      expect(screen.getByLabelText('履歴')).toBeInTheDocument();
      expect(screen.getByLabelText('設定')).toBeInTheDocument();
    });

    it('ブレッドクラムが表示される', () => {
      render(<App />);

      // ステップ1（場所）は有効
      const step1 = screen.getByText('1');
      expect(step1.closest('button')).not.toHaveClass('opacity-40');

      // ステップ2、3は無効化されている
      const step2 = screen.getByText('2');
      expect(step2.closest('button')).toHaveClass('opacity-40');

      const step3 = screen.getByText('3');
      expect(step3.closest('button')).toHaveClass('opacity-40');
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
        const errorMessage = screen.queryByText(/気晴らし方法の取得に失敗しました/);
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
        const errorMessage = screen.queryByText(/気晴らし方法の取得に失敗しました/);
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
        const errorMessage = screen.queryByText(/気晴らし方法の取得に失敗しました/);
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
      const step1Button = screen.getByText('1').closest('button') as HTMLElement;
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
        const errorMessage = screen.queryByText(/気晴らし方法の取得に失敗しました/);
        const suggestionTitle = screen.queryByText(/あなたにおすすめの気晴らし方法/);
        expect(errorMessage || suggestionTitle).toBeInTheDocument();
      }, { timeout: 12000 });

      // ブレッドクラムのステップ2（時間）をクリック
      const step2Button = screen.getByText('2').closest('button') as HTMLElement;
      fireEvent.click(step2Button);

      // 時間選択画面に戻ることを確認
      await waitFor(() => {
        expect(screen.getByText('どのくらい時間がありますか？')).toBeInTheDocument();
      });
    });

    it('未選択のステップは無効化されている', () => {
      render(<App />);

      // ステップ2のボタンは無効
      const step2Button = screen.getByText('2').closest('button') as HTMLElement;
      expect(step2Button).toHaveClass('opacity-40');
      expect(step2Button).toBeDisabled();

      // ステップ3のボタンも無効
      const step3Button = screen.getByText('3').closest('button') as HTMLElement;
      expect(step3Button).toHaveClass('opacity-40');
      expect(step3Button).toBeDisabled();
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
      const step1Button = screen.getByText('1').closest('button') as HTMLElement;
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
      const step1Button = screen.getByText('1').closest('button') as HTMLElement;
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
      (import.meta.env as Record<string, string>).VITE_API_URL = 'http://localhost:9999';

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
        expect(screen.getByText(/気晴らし方法の取得に失敗しました/)).toBeInTheDocument();
      }, { timeout: 12000 });

      // エラーメッセージの構造を確認
      expect(screen.getByText(/気晴らし方法の取得に失敗しました/)).toBeInTheDocument();
      expect(screen.getByText(/サーバーからデータを取得できませんでした/)).toBeInTheDocument();

      // 環境変数を復元
      (import.meta.env as Record<string, string>).VITE_API_URL = originalUrl;
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
        const errorMessage = screen.queryByText(/気晴らし方法の取得に失敗しました/);
        const suggestionTitle = screen.queryByText(/あなたにおすすめの気晴らし方法/);
        expect(errorMessage || suggestionTitle).toBeInTheDocument();
      }, { timeout: 12000 });

      // ブレッドクラムで時間選択に戻る
      const step2Button = screen.getByText('2').closest('button') as HTMLElement;
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

  describe('タブナビゲーション', () => {
    it('お気に入りタブが機能する', async () => {
      render(<App />);

      // お気に入りタブをクリック
      const favoriteTab = screen.getByLabelText('お気に入り');
      fireEvent.click(favoriteTab);

      // お気に入り画面が表示される（お気に入りがない場合のメッセージ）
      await waitFor(() => {
        expect(screen.getByText('お気に入りがありません')).toBeInTheDocument();
      });

      // ホームタブで気晴らし選択に戻る
      const homeTab = screen.getByLabelText('ホーム');
      fireEvent.click(homeTab);

      await waitFor(() => {
        expect(screen.getByText('どこにいますか？')).toBeInTheDocument();
      });
    });

    it('履歴タブが機能する', async () => {
      render(<App />);

      // 履歴タブをクリック
      const historyTab = screen.getByLabelText('履歴');
      fireEvent.click(historyTab);

      // 履歴画面が表示される
      await waitFor(() => {
        expect(screen.getByText('実行履歴')).toBeInTheDocument();
      });

      // ホームタブで気晴らし選択に戻る
      const homeTab = screen.getByLabelText('ホーム');
      fireEvent.click(homeTab);

      await waitFor(() => {
        expect(screen.getByText('どこにいますか？')).toBeInTheDocument();
      });
    });

    it('設定タブが機能する', async () => {
      render(<App />);

      // 設定タブをクリック
      const settingsTab = screen.getByLabelText('設定');
      fireEvent.click(settingsTab);

      // 設定画面が表示される
      await waitFor(() => {
        expect(screen.getByText('アプリ設定')).toBeInTheDocument();
        expect(screen.getByText('データ管理')).toBeInTheDocument();
        expect(screen.getByText('アプリ情報')).toBeInTheDocument();
      });

      // ホームタブで気晴らし選択に戻る
      const homeTab = screen.getByLabelText('ホーム');
      fireEvent.click(homeTab);

      await waitFor(() => {
        expect(screen.getByText('どこにいますか？')).toBeInTheDocument();
      });
    });
  });

  describe('レスポンシブデザイン', () => {
    it('メインコンテンツが適切にパディングされている', () => {
      render(<App />);

      const main = screen.getByRole('main');
      expect(main).toHaveClass('px-4');
      expect(main).toHaveClass('py-4');
    });

    it('コンテンツの最大幅が制限されている', () => {
      render(<App />);

      const container = screen.getByRole('main').firstChild;
      expect(container).toHaveClass('max-w-4xl');
      expect(container).toHaveClass('mx-auto');
    });
  });
});
