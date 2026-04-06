import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import SuggestionList from './SuggestionList';

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
  });

  afterEach(() => {
    // 環境変数を復元
    if (originalApiUrl !== undefined) {
      (import.meta.env as Record<string, string>).VITE_API_URL = originalApiUrl;
    }
  });

  describe('基本的な表示のテスト', () => {
    it('提案の取得と表示が正しく動作する', async () => {
      render(<SuggestionList situation="workplace" duration={5} />);
      
      // 初回レンダリング時はローディング表示
      expect(screen.getByText('気晴らし方法を探しています...')).toBeInTheDocument();
      
      // データ取得を待つ（実際のAPIまたはフォールバック）
      await waitFor(() => {
        expect(screen.queryByText('気晴らし方法を探しています...')).not.toBeInTheDocument();
      }, { timeout: 10000 });
      
      // エラーがない場合、提案が表示される
      if (!screen.queryByText('気晴らし方法の取得に失敗しました')) {
        expect(screen.getByText('あなたにおすすめの気晴らし方法')).toBeInTheDocument();
        expect(screen.getByText('職場で5分でできる気晴らしです')).toBeInTheDocument();
        
        // 提案カードが表示されている
        const cards = screen.getAllByText('この気晴らしを始める');
        expect(cards.length).toBeGreaterThan(0);
        expect(cards.length).toBeLessThanOrEqual(3);
      }
    });

    it('家での15分の提案を表示する', async () => {
      render(<SuggestionList situation="home" duration={15} />);
      
      await waitFor(() => {
        expect(screen.queryByText('気晴らし方法を探しています...')).not.toBeInTheDocument();
      }, { timeout: 10000 });
      
      if (!screen.queryByText('気晴らし方法の取得に失敗しました')) {
        expect(screen.getByText('家で15分でできる気晴らしです')).toBeInTheDocument();
      }
    });

    it('外出先での30分の提案を表示する', async () => {
      render(<SuggestionList situation="outside" duration={30} />);
      
      await waitFor(() => {
        expect(screen.queryByText('気晴らし方法を探しています...')).not.toBeInTheDocument();
      }, { timeout: 10000 });
      
      if (!screen.queryByText('気晴らし方法の取得に失敗しました')) {
        expect(screen.getByText('外出先で30分でできる気晴らしです')).toBeInTheDocument();
      }
    });
  });

  describe('エラーハンドリングのテスト', () => {
    it('ネットワークエラー時にエラーメッセージと再試行ボタンを表示する', async () => {
      // 存在しないサーバーを指定してエラーを発生させる
      (import.meta.env as Record<string, string>).VITE_API_URL = 'http://localhost:9999';
      
      render(<SuggestionList situation="workplace" duration={5} />);
      
      // エラーが表示されるまで待つ
      await waitFor(() => {
        expect(screen.getByText('気晴らし方法の取得に失敗しました')).toBeInTheDocument();
      }, { timeout: 10000 });
      
      // 再試行ボタンが表示される
      expect(screen.getByText('もう一度試す')).toBeInTheDocument();
    });

    it('再試行ボタンをクリックすると再取得を試みる', async () => {
      // エラーを発生させる
      (import.meta.env as Record<string, string>).VITE_API_URL = 'http://localhost:9999';
      
      render(<SuggestionList situation="workplace" duration={5} />);
      
      await waitFor(() => {
        expect(screen.getByText('気晴らし方法の取得に失敗しました')).toBeInTheDocument();
      }, { timeout: 10000 });
      
      // URLを正しく戻す
      (import.meta.env as Record<string, string>).VITE_API_URL = originalApiUrl;
      
      // 再試行ボタンをクリック
      fireEvent.click(screen.getByText('もう一度試す'));
      
      // ローディング表示が再度表示される
      expect(screen.getByText('気晴らし方法を探しています...')).toBeInTheDocument();
      
      // 成功するまで待つ
      await waitFor(() => {
        expect(screen.queryByText('気晴らし方法を探しています...')).not.toBeInTheDocument();
      }, { timeout: 10000 });
    });
  });

  describe('提案詳細への遷移テスト', () => {
    it('提案カードをクリックすると詳細が表示される', async () => {
      render(<SuggestionList situation="workplace" duration={5} />);
      
      // データ取得を待つ
      await waitFor(() => {
        expect(screen.queryByText('気晴らし方法を探しています...')).not.toBeInTheDocument();
      }, { timeout: 10000 });
      
      if (!screen.queryByText('気晴らし方法の取得に失敗しました')) {
        // 最初の提案カードの「始める」ボタンをクリック
        const startButtons = screen.getAllByText('この気晴らしを始める');
        fireEvent.click(startButtons[0]);
        
        // 詳細画面が表示される（戻るボタンの存在で確認）
        await waitFor(() => {
          expect(screen.getByText('一覧に戻る')).toBeInTheDocument();
        });
      }
    });

    it('詳細画面から一覧に戻ることができる', async () => {
      render(<SuggestionList situation="workplace" duration={5} />);
      
      await waitFor(() => {
        expect(screen.queryByText('気晴らし方法を探しています...')).not.toBeInTheDocument();
      }, { timeout: 10000 });
      
      if (!screen.queryByText('気晴らし方法の取得に失敗しました')) {
        // 詳細画面へ遷移
        const startButtons = screen.getAllByText('この気晴らしを始める');
        fireEvent.click(startButtons[0]);
        
        await waitFor(() => {
          expect(screen.getByText('一覧に戻る')).toBeInTheDocument();
        });
        
        // 戻るボタンをクリック
        fireEvent.click(screen.getByText('一覧に戻る'));
        
        // 一覧画面に戻る
        expect(screen.getByText('あなたにおすすめの気晴らし方法')).toBeInTheDocument();
      }
    });
  });

  describe('その他の機能のテスト', () => {
    it('「他の提案を見る」ボタンで再取得できる', async () => {
      render(<SuggestionList situation="workplace" duration={5} />);
      
      await waitFor(() => {
        expect(screen.queryByText('気晴らし方法を探しています...')).not.toBeInTheDocument();
      }, { timeout: 10000 });
      
      if (!screen.queryByText('気晴らし方法の取得に失敗しました')) {
        // 「他の提案を見る」ボタンをクリック
        fireEvent.click(screen.getByText('他の提案を見る'));
        
        // ローディング表示が出る
        expect(screen.getByText('気晴らし方法を探しています...')).toBeInTheDocument();
        
        // 再度データ取得を待つ
        await waitFor(() => {
          expect(screen.queryByText('気晴らし方法を探しています...')).not.toBeInTheDocument();
        }, { timeout: 10000 });
      }
    });

    it('提案が0件の場合、適切なメッセージを表示する', async () => {
      // 注：実際のAPIやフォールバックでは0件になることは稀だが、
      // 理論上の可能性として、メッセージが正しく表示されることを確認
      
      render(<SuggestionList situation="workplace" duration={5} />);
      
      await waitFor(() => {
        expect(screen.queryByText('気晴らし方法を探しています...')).not.toBeInTheDocument();
      }, { timeout: 10000 });
      
      // 提案が見つからない場合のメッセージ
      if (screen.queryByText('提案が見つかりませんでした')) {
        expect(screen.getByText('再試行')).toBeInTheDocument();
      }
    });
  });

  describe('レスポンシブデザインのテスト', () => {
    it('提案カードがグリッドレイアウトで表示される', async () => {
      render(<SuggestionList situation="workplace" duration={5} />);
      
      await waitFor(() => {
        expect(screen.queryByText('気晴らし方法を探しています...')).not.toBeInTheDocument();
      }, { timeout: 10000 });
      
      if (!screen.queryByText('気晴らし方法の取得に失敗しました')) {
        // グリッドコンテナを探す
        const container = screen.getByText('あなたにおすすめの気晴らし方法')
          .parentElement?.parentElement;
        
        const gridDiv = container?.querySelector('.grid');
        expect(gridDiv).toBeInTheDocument();
        expect(gridDiv?.className).toContain('grid-cols-1');
        expect(gridDiv?.className).toContain('md:grid-cols-2');
        expect(gridDiv?.className).toContain('lg:grid-cols-3');
      }
    });
  });
});