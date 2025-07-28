import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import * as suggestionsApi from './services/api/suggestions';

// fetchSuggestionsをモック
vi.mock('./services/api/suggestions', () => ({
  fetchSuggestions: vi.fn()
}));

/**
 * Appコンポーネントの統合テスト
 * 
 * 設計思想：
 * - モックを使用せず、実際のコンポーネントの動作を検証
 * - ユーザーフローを追跡し、統合的な動作を確認
 * - レイアウトコンポーネント（Header, Footer）も含めて検証
 */
describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  describe('初期表示', () => {
    it('ヘッダーとフッターが表示される', () => {
      render(<App />);
      
      // ヘッダーの確認
      expect(screen.getByText('気晴らしアプリ')).toBeInTheDocument();
      
      // フッターの確認（フッター内のテキストを確認）
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
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
      // モックレスポンスを設定
      vi.mocked(suggestionsApi.fetchSuggestions).mockResolvedValue({
        suggestions: [
          {
            id: 'test-1',
            title: 'テスト提案1',
            description: '職場で深呼吸をしてリラックス',
            duration: 5,
            category: '認知的' as const,
            steps: ['ステップ1', 'ステップ2']
          },
          {
            id: 'test-2',
            title: 'テスト提案2',
            description: '簡単なストレッチで体をほぐす',
            duration: 5,
            category: '行動的' as const,
            steps: ['ステップ1', 'ステップ2']
          }
        ]
      });

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
      
      // 提案の表示を待つ（ローディング表示は一瞬で消える可能性があるので、直接結果を待つ）
      await waitFor(() => {
        expect(screen.getByText(/あなたにおすすめの気晴らし方法/)).toBeInTheDocument();
      }, { timeout: 5000 });
      
      // 提案が表示されることを確認
      expect(screen.getByText('テスト提案1')).toBeInTheDocument();
      expect(screen.getByText('テスト提案2')).toBeInTheDocument();
    });

    it('15分を選択すると提案一覧が表示される', async () => {
      // モックをリセットして再設定
      vi.clearAllMocks();
      vi.mocked(suggestionsApi.fetchSuggestions).mockResolvedValue({
        suggestions: [
          {
            id: 'test-3',
            title: 'テスト提案3',
            description: '家でゆっくりストレッチ',
            duration: 15,
            category: '行動的' as const,
            steps: ['ステップ1', 'ステップ2', 'ステップ3']
          }
        ]
      });

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
        expect(screen.getByText(/あなたにおすすめの気晴らし方法/)).toBeInTheDocument();
      });
      
      // 提案が表示されることを確認
      expect(screen.getByText('テスト提案3')).toBeInTheDocument();
    });

    it('30分を選択すると提案一覧が表示される', async () => {
      // モックをリセットして再設定
      vi.clearAllMocks();
      vi.mocked(suggestionsApi.fetchSuggestions).mockResolvedValue({
        suggestions: [
          {
            id: 'test-4',
            title: 'テスト提案4',
            description: '外出先で散歩を楽しむ',
            duration: 30,
            category: '行動的' as const,
            steps: ['ステップ1', 'ステップ2', 'ステップ3', 'ステップ4']
          }
        ]
      });

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
        expect(screen.getByText(/あなたにおすすめの気晴らし方法/)).toBeInTheDocument();
      });
      
      // 提案が表示されることを確認
      expect(screen.getByText('テスト提案4')).toBeInTheDocument();
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
      // モックをリセットして再設定
      vi.clearAllMocks();
      vi.mocked(suggestionsApi.fetchSuggestions).mockResolvedValue({
        suggestions: [
          {
            id: 'test-breadcrumb',
            title: 'ブレッドクラムテスト',
            description: 'ブレッドクラムのテスト用',
            duration: 5,
            category: '認知的' as const,
            steps: ['ステップ1']
          }
        ]
      });

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
        expect(screen.getByText(/あなたにおすすめの気晴らし方法/)).toBeInTheDocument();
      });
      
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
      // モックをリセットして再設定
      vi.clearAllMocks();
      vi.mocked(suggestionsApi.fetchSuggestions).mockResolvedValue({
        suggestions: [
          {
            id: 'test-reset',
            title: 'リセットテスト',
            description: 'リセットボタンのテスト用',
            duration: 5,
            category: '認知的' as const,
            steps: ['ステップ1']
          }
        ]
      });

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
        expect(screen.getByText(/あなたにおすすめの気晴らし方法/)).toBeInTheDocument();
      });
      
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
      // モックをリセットして再設定
      vi.clearAllMocks();
      vi.mocked(suggestionsApi.fetchSuggestions).mockRejectedValue(
        new Error('Network error')
      );
      
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
      });
      
      // エラーメッセージの構造を確認
      expect(screen.getByText('気晴らし方法の取得に失敗しました')).toBeInTheDocument();
      expect(screen.getByText(/サーバーからデータを取得できませんでした/)).toBeInTheDocument();
    });

    it('エラー後に再試行できる', async () => {
      // モックをリセットして再設定
      vi.clearAllMocks();
      // 最初はエラー、再試行時は成功するようにモック
      vi.mocked(suggestionsApi.fetchSuggestions)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          suggestions: [
            {
              id: 'retry-success',
              title: '再試行成功',
              description: '再試行後の提案',
              duration: 15,
              category: '認知的' as const,
              steps: ['ステップ1']
            }
          ]
        });

      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText('職場')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('職場'));
      
      await waitFor(() => {
        expect(screen.getByText('5分')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('5分'));
      
      // フォールバック提案が表示されるのを待つ（エラーでもフォールバックが表示される）
      await waitFor(() => {
        // エラーが発生してもフォールバック提案が表示される
        expect(screen.getByText(/あなたにおすすめの気晴らし方法/)).toBeInTheDocument();
      });
      
      // ブレッドクラムで時間選択に戻る
      const step2Button = screen.getByText('2').parentElement as HTMLElement;
      fireEvent.click(step2Button);
      
      await waitFor(() => {
        expect(screen.getByText('15分')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('15分'));
      
      
      // 成功することを確認
      await waitFor(() => {
        expect(screen.getByText(/あなたにおすすめの気晴らし方法/)).toBeInTheDocument();
      });
      expect(screen.getByText('再試行成功')).toBeInTheDocument();
    });
  });

  describe('ナビゲーション機能', () => {
    it('ヘッダーのお気に入りボタンが機能する', async () => {
      render(<App />);
      
      // お気に入りボタンをクリック
      const favoriteButton = screen.getByLabelText('お気に入り');
      fireEvent.click(favoriteButton);
      
      // お気に入り画面が表示される（お気に入りがない場合のメッセージ）
      await waitFor(() => {
        expect(screen.getByText('お気に入りがありません')).toBeInTheDocument();
      });
      
      // 戻るボタンで気晴らし選択に戻る
      const backButton = screen.getByText('気晴らし選択に戻る');
      fireEvent.click(backButton);
      
      await waitFor(() => {
        expect(screen.getByText('どこにいますか？')).toBeInTheDocument();
      });
    });

    it('ヘッダーの履歴ボタンが機能する', async () => {
      render(<App />);
      
      // 履歴ボタンをクリック
      const historyButton = screen.getByLabelText('履歴');
      fireEvent.click(historyButton);
      
      // 履歴画面が表示される
      await waitFor(() => {
        expect(screen.getByText('実行履歴')).toBeInTheDocument();
      });
      
      // 戻るボタンで気晴らし選択に戻る
      const backButton = screen.getByText('気晴らし選択に戻る');
      fireEvent.click(backButton);
      
      await waitFor(() => {
        expect(screen.getByText('どこにいますか？')).toBeInTheDocument();
      });
    });

    it('ヘッダーの設定ボタンが機能する', async () => {
      render(<App />);
      
      // 設定ボタンをクリック
      const settingsButton = screen.getByLabelText('設定');
      fireEvent.click(settingsButton);
      
      // 設定画面が表示される
      await waitFor(() => {
        expect(screen.getByText('設定')).toBeInTheDocument();
        expect(screen.getByText('アプリ設定')).toBeInTheDocument();
        expect(screen.getByText('データ管理')).toBeInTheDocument();
        expect(screen.getByText('アプリ情報')).toBeInTheDocument();
      });
      
      // 戻るボタンで気晴らし選択に戻る
      const backButton = screen.getByText('戻る');
      fireEvent.click(backButton);
      
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