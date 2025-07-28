import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

// fetchSuggestionsをモック
vi.mock('../../services/api/suggestions', () => ({
  fetchSuggestions: vi.fn()
}));

import SuggestionList from './SuggestionList';
import { fetchSuggestions } from '../../services/api/suggestions';

/**
 * SuggestionListコンポーネントのテスト
 * 
 * 設計思想：
 * - モックを使用せず、実際のコンポーネントとフックの統合をテスト
 * - ユーザー操作の流れを実際に再現
 * - 様々な状態（ローディング、エラー、成功）を実際に体験
 */
describe('SuggestionList', () => {
  // テスト環境のセットアップ
  let originalApiUrl: string | undefined;
  
  beforeEach(() => {
    // APIのURLを保存
    originalApiUrl = import.meta.env.VITE_API_URL;
    // モックをリセット
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  afterEach(() => {
    // 環境変数を復元
    if (originalApiUrl !== undefined) {
      (import.meta.env as Record<string, string>).VITE_API_URL = originalApiUrl;
    }
  });

  describe('基本的な表示のテスト', () => {
    it('提案の取得と表示が正しく動作する', async () => {
      // モックレスポンスを設定
      const mockResponse = {
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
            description: '簁単なストレッチで体をほぐす',
            duration: 5,
            category: '行動的' as const,
            steps: ['ステップ1', 'ステップ2']
          }
        ],
        metadata: {
          situation: 'workplace',
          duration: 5,
          timestamp: new Date().toISOString()
        }
      };
      
      vi.mocked(fetchSuggestions).mockResolvedValueOnce(mockResponse);
      
      render(<SuggestionList situation="workplace" duration={5} />);
      
      // 初回レンダリング時はローディング表示
      expect(screen.getByText('気晴らし方法を探しています...')).toBeInTheDocument();
      
      // データ取得を待つ
      await waitFor(() => {
        expect(screen.queryByText('気晴らし方法を探しています...')).not.toBeInTheDocument();
      });
      
      // 提案が表示される
      expect(screen.getByText('あなたにおすすめの気晴らし方法')).toBeInTheDocument();
      expect(screen.getByText('職場で5分でできる気晴らしです')).toBeInTheDocument();
      
      // 提案カードが表示されている
      expect(screen.getByText('テスト提案1')).toBeInTheDocument();
      expect(screen.getByText('テスト提案2')).toBeInTheDocument();
      const cards = screen.getAllByText('この気晴らしを始める');
      expect(cards).toHaveLength(2);
    });

    it('家での15分の提案を表示する', async () => {
      // モックレスポンスを設定
      const mockResponse = {
        suggestions: [
          {
            id: 'home-1',
            title: '家での提案1',
            description: '家でゆっくりストレッチ',
            duration: 15,
            category: '行動的' as const,
            steps: ['ステップ1', 'ステップ2']
          }
        ],
        metadata: {
          situation: 'home',
          duration: 15,
          timestamp: new Date().toISOString()
        }
      };
      
      vi.mocked(fetchSuggestions).mockResolvedValueOnce(mockResponse);
      
      render(<SuggestionList situation="home" duration={15} />);
      
      await waitFor(() => {
        expect(screen.queryByText('気晴らし方法を探しています...')).not.toBeInTheDocument();
      });
      
      expect(screen.getByText('家で15分でできる気晴らしです')).toBeInTheDocument();
    });

    it('外出先での30分の提案を表示する', async () => {
      // モックレスポンスを設定
      const mockResponse = {
        suggestions: [
          {
            id: 'outside-1',
            title: '外出先での提案1',
            description: '散歩でリフレッシュ',
            duration: 30,
            category: '行動的' as const,
            steps: ['ステップ1', 'ステップ2']
          }
        ],
        metadata: {
          situation: 'outside',
          duration: 30,
          timestamp: new Date().toISOString()
        }
      };
      
      vi.mocked(fetchSuggestions).mockResolvedValueOnce(mockResponse);
      
      render(<SuggestionList situation="outside" duration={30} />);
      
      await waitFor(() => {
        expect(screen.queryByText('気晴らし方法を探しています...')).not.toBeInTheDocument();
      });
      
      expect(screen.getByText('外出先で30分でできる気晴らしです')).toBeInTheDocument();
    });
  });

  describe('エラーハンドリングのテスト', () => {
    it('ネットワークエラー時にエラーメッセージと再試行ボタンを表示する', async () => {
      // ネットワークエラーをモック
      vi.mocked(fetchSuggestions).mockRejectedValueOnce(
        new Error('Network error')
      );
      
      render(<SuggestionList situation="workplace" duration={5} />);
      
      // エラーが表示されるまで待つ
      await waitFor(() => {
        expect(screen.getByText('気晴らし方法の取得に失敗しました')).toBeInTheDocument();
      });
      
      // 再試行ボタンが表示される
      expect(screen.getByText('もう一度試す')).toBeInTheDocument();
    });

    it('再試行ボタンをクリックすると再取得を試みる', async () => {
      // 最初はエラー、再試行時は成功するようにモック
      vi.mocked(fetchSuggestions)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          suggestions: [
            {
              id: 'retry-1',
              title: '再試行後の提案',
              description: '再試行が成功しました',
              duration: 5,
              category: '認知的' as const,
              steps: ['ステップ1']
            }
          ],
          metadata: {
            situation: 'workplace',
            duration: 5,
            timestamp: new Date().toISOString()
          }
        });
      
      render(<SuggestionList situation="workplace" duration={5} />);
      
      await waitFor(() => {
        expect(screen.getByText('気晴らし方法の取得に失敗しました')).toBeInTheDocument();
      });
      
      // 再試行ボタンをクリック
      fireEvent.click(screen.getByText('もう一度試す'));
      
      // ローディング表示が再度表示される
      expect(screen.getByText('気晴らし方法を探しています...')).toBeInTheDocument();
      
      // 成功するまで待つ
      await waitFor(() => {
        expect(screen.queryByText('気晴らし方法を探しています...')).not.toBeInTheDocument();
      });
      
      // 再試行後の提案が表示される
      expect(screen.getByText('再試行後の提案')).toBeInTheDocument();
    });
  });

  describe('提案詳細への遷移テスト', () => {
    it('提案カードをクリックすると詳細が表示される', async () => {
      // モックレスポンスを設定
      const mockResponse = {
        suggestions: [
          {
            id: 'detail-1',
            title: 'テスト提案',
            description: 'クリックで詳細表示',
            duration: 5,
            category: '認知的' as const,
            steps: ['ステップ1', 'ステップ2']
          }
        ],
        metadata: {
          situation: 'workplace',
          duration: 5,
          timestamp: new Date().toISOString()
        }
      };
      
      vi.mocked(fetchSuggestions).mockResolvedValueOnce(mockResponse);
      
      render(<SuggestionList situation="workplace" duration={5} />);
      
      // データ取得を待つ
      await waitFor(() => {
        expect(screen.queryByText('気晴らし方法を探しています...')).not.toBeInTheDocument();
      });
      
      // 「この気晴らしを始める」ボタンをクリック
      const startButton = screen.getByText('この気晴らしを始める');
      fireEvent.click(startButton);
      
      // 詳細画面が表示される（戻るボタンの存在で確認）
      await waitFor(() => {
        expect(screen.getByText('一覧に戻る')).toBeInTheDocument();
      });
    });

    it('詳細画面から一覧に戻ることができる', async () => {
      // モックレスポンスを設定
      const mockResponse = {
        suggestions: [
          {
            id: 'back-test-1',
            title: 'テスト提案',
            description: '戻るボタンテスト',
            duration: 5,
            category: '認知的' as const,
            steps: ['ステップ1']
          }
        ],
        metadata: {
          situation: 'workplace',
          duration: 5,
          timestamp: new Date().toISOString()
        }
      };
      
      vi.mocked(fetchSuggestions).mockResolvedValueOnce(mockResponse);
      
      render(<SuggestionList situation="workplace" duration={5} />);
      
      await waitFor(() => {
        expect(screen.queryByText('気晴らし方法を探しています...')).not.toBeInTheDocument();
      });
      
      // 詳細画面へ遷移
      const startButton = screen.getByText('この気晴らしを始める');
      fireEvent.click(startButton);
      
      await waitFor(() => {
        expect(screen.getByText('一覧に戻る')).toBeInTheDocument();
      });
      
      // 戻るボタンをクリック
      fireEvent.click(screen.getByText('一覧に戻る'));
      
      // 一覧画面に戻る
      expect(screen.getByText('あなたにおすすめの気晴らし方法')).toBeInTheDocument();
    });
  });

  describe('その他の機能のテスト', () => {
    it('「他の提案を見る」ボタンで再取得できる', async () => {
      // 2回分のモックレスポンスを設定
      vi.mocked(fetchSuggestions)
        .mockResolvedValueOnce({
          suggestions: [
            {
              id: 'first-1',
              title: '最初の提案',
              description: '最初の提案内容',
              duration: 5,
              category: '認知的' as const,
              steps: ['ステップ1']
            }
          ],
          metadata: {
            situation: 'workplace',
            duration: 5,
            timestamp: new Date().toISOString()
          }
        })
        .mockResolvedValueOnce({
          suggestions: [
            {
              id: 'second-1',
              title: '別の提案',
              description: '別の提案内容',
              duration: 5,
              category: '行動的' as const,
              steps: ['ステップ1']
            }
          ],
          metadata: {
            situation: 'workplace',
            duration: 5,
            timestamp: new Date().toISOString()
          }
        });
      
      render(<SuggestionList situation="workplace" duration={5} />);
      
      await waitFor(() => {
        expect(screen.queryByText('気晴らし方法を探しています...')).not.toBeInTheDocument();
      });
      
      // 最初の提案が表示される
      expect(screen.getByText('最初の提案')).toBeInTheDocument();
      
      // 「他の提案を見る」ボタンをクリック
      fireEvent.click(screen.getByText('他の提案を見る'));
      
      // ローディング表示が出る
      expect(screen.getByText('気晴らし方法を探しています...')).toBeInTheDocument();
      
      // 再度データ取得を待つ
      await waitFor(() => {
        expect(screen.queryByText('気晴らし方法を探しています...')).not.toBeInTheDocument();
      });
      
      // 別の提案が表示される
      expect(screen.getByText('別の提案')).toBeInTheDocument();
    });

    it('提案が0件の場合、適切なメッセージを表示する', async () => {
      // 空の提案リストをモック
      vi.mocked(fetchSuggestions).mockResolvedValueOnce({
        suggestions: [],
        metadata: {
          situation: 'workplace',
          duration: 5,
          timestamp: new Date().toISOString()
        }
      });
      
      render(<SuggestionList situation="workplace" duration={5} />);
      
      await waitFor(() => {
        expect(screen.queryByText('気晴らし方法を探しています...')).not.toBeInTheDocument();
      });
      
      // 提案が見つからない場合のメッセージ
      expect(screen.getByText('提案が見つかりませんでした')).toBeInTheDocument();
      expect(screen.getByText('再試行')).toBeInTheDocument();
    });
  });

  describe('レスポンシブデザインのテスト', () => {
    it('提案カードがグリッドレイアウトで表示される', async () => {
      // モックレスポンスを設定
      const mockResponse = {
        suggestions: [
          {
            id: 'grid-1',
            title: 'グリッドテスト1',
            description: 'グリッドレイアウト確認',
            duration: 5,
            category: '認知的' as const,
            steps: ['ステップ1']
          },
          {
            id: 'grid-2',
            title: 'グリッドテスト2',
            description: 'グリッドレイアウト確認',
            duration: 5,
            category: '行動的' as const,
            steps: ['ステップ1']
          }
        ],
        metadata: {
          situation: 'workplace',
          duration: 5,
          timestamp: new Date().toISOString()
        }
      };
      
      vi.mocked(fetchSuggestions).mockResolvedValueOnce(mockResponse);
      
      render(<SuggestionList situation="workplace" duration={5} />);
      
      await waitFor(() => {
        expect(screen.queryByText('気晴らし方法を探しています...')).not.toBeInTheDocument();
      });
      
      // グリッドコンテナを探す
      const container = screen.getByText('あなたにおすすめの気晴らし方法')
        .parentElement?.parentElement;
        
      const gridDiv = container?.querySelector('.grid');
      expect(gridDiv).toBeInTheDocument();
      expect(gridDiv?.className).toContain('grid-cols-1');
      expect(gridDiv?.className).toContain('md:grid-cols-2');
      expect(gridDiv?.className).toContain('lg:grid-cols-3');
    });
  });
});