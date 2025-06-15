import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FavoriteButton from './FavoriteButton';
import { Suggestion } from '../../services/api/types';

/**
 * FavoriteButtonコンポーネントのテスト
 * 
 * 設計思想：
 * - モックを使用せず、実際のuseFavoritesフックを使用
 * - ボタンの状態変化とアクセシビリティを検証
 * - localStorageへの実際の保存を確認
 */
describe('FavoriteButton', () => {
  const mockSuggestion: Suggestion = {
    id: 'test-1',
    title: 'テスト提案',
    description: 'これはテスト用の提案です',
    category: '認知的',
    duration: 5,
    steps: ['ステップ1', 'ステップ2']
  };

  beforeEach(() => {
    // localStorageをクリア
    localStorage.clear();
  });

  describe('基本的な表示', () => {
    it('お気に入りボタンが表示される', () => {
      render(<FavoriteButton suggestion={mockSuggestion} />);
      
      const button = screen.getByRole('button', { name: 'お気に入りに追加' });
      expect(button).toBeInTheDocument();
    });

    it('初期状態では非選択状態のアイコンが表示される', () => {
      render(<FavoriteButton suggestion={mockSuggestion} />);
      
      const button = screen.getByRole('button');
      const svg = button.querySelector('svg');
      expect(svg).toHaveAttribute('fill', 'none');
    });

    it('お気に入り登録済みの場合は選択状態のアイコンが表示される', () => {
      // 事前にお気に入りに追加
      const data = {
        favorites: [{
          id: 'fav-1',
          suggestionId: 'test-1',
          title: 'テスト提案',
          description: 'これはテスト用の提案です',
          category: '認知的' as const,
          duration: 5,
          addedAt: new Date().toISOString()
        }],
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('kibarashi-favorites', JSON.stringify(data));
      
      render(<FavoriteButton suggestion={mockSuggestion} />);
      
      const button = screen.getByRole('button', { name: 'お気に入りから削除' });
      const svg = button.querySelector('svg');
      expect(svg).toHaveAttribute('fill', 'currentColor');
    });
  });

  describe('インタラクションのテスト', () => {
    it('クリックでお気に入りに追加される', () => {
      render(<FavoriteButton suggestion={mockSuggestion} />);
      
      const button = screen.getByRole('button', { name: 'お気に入りに追加' });
      fireEvent.click(button);
      
      // ボタンのラベルが変更される
      expect(screen.getByRole('button', { name: 'お気に入りから削除' })).toBeInTheDocument();
      
      // localStorageに保存される
      const stored = localStorage.getItem('kibarashi-favorites');
      expect(stored).toBeTruthy();
      const data = JSON.parse(stored!);
      expect(data.favorites).toHaveLength(1);
      expect(data.favorites[0].suggestionId).toBe('test-1');
    });

    it('クリックでお気に入りから削除される', () => {
      // 事前にお気に入りに追加
      const data = {
        favorites: [{
          id: 'fav-1',
          suggestionId: 'test-1',
          title: 'テスト提案',
          description: 'これはテスト用の提案です',
          category: '認知的' as const,
          duration: 5,
          addedAt: new Date().toISOString()
        }],
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('kibarashi-favorites', JSON.stringify(data));
      
      render(<FavoriteButton suggestion={mockSuggestion} />);
      
      const button = screen.getByRole('button', { name: 'お気に入りから削除' });
      fireEvent.click(button);
      
      // ボタンのラベルが変更される
      expect(screen.getByRole('button', { name: 'お気に入りに追加' })).toBeInTheDocument();
      
      // localStorageから削除される
      const stored = localStorage.getItem('kibarashi-favorites');
      expect(stored).toBeTruthy();
      const updatedData = JSON.parse(stored!);
      expect(updatedData.favorites).toHaveLength(0);
    });

    it('親要素のクリックイベントを停止する', () => {
      const handleParentClick = vi.fn();
      
      render(
        <div onClick={handleParentClick}>
          <FavoriteButton suggestion={mockSuggestion} />
        </div>
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // 親要素のクリックハンドラーが呼ばれない
      expect(handleParentClick).not.toHaveBeenCalled();
    });
  });

  describe('スタイリングのテスト', () => {
    it('非選択状態の適切なスタイルが適用される', () => {
      render(<FavoriteButton suggestion={mockSuggestion} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-gray-400');
    });

    it('選択状態の適切なスタイルが適用される', () => {
      // 事前にお気に入りに追加
      const data = {
        favorites: [{
          id: 'fav-1',
          suggestionId: 'test-1',
          title: 'テスト提案',
          description: 'これはテスト用の提案です',
          category: '認知的' as const,
          duration: 5,
          addedAt: new Date().toISOString()
        }],
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('kibarashi-favorites', JSON.stringify(data));
      
      render(<FavoriteButton suggestion={mockSuggestion} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-red-500');
    });

    it('カスタムクラスが適用される', () => {
      render(<FavoriteButton suggestion={mockSuggestion} className="custom-class" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('アクセシビリティのテスト', () => {
    it('適切なaria-labelが設定される', () => {
      render(<FavoriteButton suggestion={mockSuggestion} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'お気に入りに追加');
      expect(button).toHaveAttribute('title', 'お気に入りに追加');
    });

    it('状態に応じてaria-labelが変更される', () => {
      // 事前にお気に入りに追加
      const data = {
        favorites: [{
          id: 'fav-1',
          suggestionId: 'test-1',
          title: 'テスト提案',
          description: 'これはテスト用の提案です',
          category: '認知的' as const,
          duration: 5,
          addedAt: new Date().toISOString()
        }],
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('kibarashi-favorites', JSON.stringify(data));
      
      render(<FavoriteButton suggestion={mockSuggestion} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'お気に入りから削除');
      expect(button).toHaveAttribute('title', 'お気に入りから削除');
    });

    it('キーボードで操作可能', () => {
      render(<FavoriteButton suggestion={mockSuggestion} />);
      
      const button = screen.getByRole('button');
      button.focus();
      expect(document.activeElement).toBe(button);
      
      // Enterキーで動作（clickイベントとして処理される）
      fireEvent.click(button);
      
      // お気に入りに追加される
      const stored = localStorage.getItem('kibarashi-favorites');
      expect(stored).toBeTruthy();
      const data = JSON.parse(stored!);
      expect(data.favorites).toHaveLength(1);
    });
  });
});