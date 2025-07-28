import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFavorites } from './useFavorites';
import { Suggestion } from '../services/api/types';

/**
 * useFavoritesフックのテスト
 * 
 * 設計思想：
 * - モックを使用せず、実際のlocalStorageを使用
 * - お気に入りの追加・削除・管理機能を検証
 * - データの永続化とエクスポート/インポート機能を確認
 */
describe('useFavorites', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  
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
    
    // console.errorをスパイ化してテスト出力をクリーンに保つ
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    // console.errorスパイを復元
    if (consoleSpy) {
      consoleSpy.mockRestore();
    }
  });

  describe('初期状態のテスト', () => {
    it('初期状態では空の配列が返される', () => {
      const { result } = renderHook(() => useFavorites());
      
      expect(result.current.favorites).toEqual([]);
    });

    it('お気に入りが存在しない場合はfalseを返す', () => {
      const { result } = renderHook(() => useFavorites());
      
      expect(result.current.isFavorite('test-1')).toBe(false);
    });
  });

  describe('お気に入り追加のテスト', () => {
    it('お気に入りに追加できる', () => {
      const { result } = renderHook(() => useFavorites());
      
      act(() => {
        result.current.addFavorite(mockSuggestion);
      });
      
      expect(result.current.favorites).toHaveLength(1);
      expect(result.current.favorites[0].suggestionId).toBe('test-1');
      expect(result.current.favorites[0].title).toBe('テスト提案');
      expect(result.current.isFavorite('test-1')).toBe(true);
    });

    it('同じ提案を重複して追加できない', () => {
      const { result } = renderHook(() => useFavorites());
      
      act(() => {
        result.current.addFavorite(mockSuggestion);
        result.current.addFavorite(mockSuggestion);
      });
      
      expect(result.current.favorites).toHaveLength(1);
    });

    it('複数の提案を追加できる', () => {
      const { result } = renderHook(() => useFavorites());
      
      const suggestion2: Suggestion = {
        ...mockSuggestion,
        id: 'test-2',
        title: 'テスト提案2'
      };
      
      act(() => {
        result.current.addFavorite(mockSuggestion);
        result.current.addFavorite(suggestion2);
      });
      
      expect(result.current.favorites).toHaveLength(2);
      expect(result.current.isFavorite('test-1')).toBe(true);
      expect(result.current.isFavorite('test-2')).toBe(true);
    });
  });

  describe('お気に入り削除のテスト', () => {
    it('お気に入りから削除できる', () => {
      const { result } = renderHook(() => useFavorites());
      
      act(() => {
        result.current.addFavorite(mockSuggestion);
      });
      
      expect(result.current.favorites).toHaveLength(1);
      
      act(() => {
        result.current.removeFavorite('test-1');
      });
      
      expect(result.current.favorites).toHaveLength(0);
      expect(result.current.isFavorite('test-1')).toBe(false);
    });

    it('存在しないIDを削除してもエラーにならない', () => {
      const { result } = renderHook(() => useFavorites());
      
      act(() => {
        result.current.removeFavorite('non-existent');
      });
      
      expect(result.current.favorites).toHaveLength(0);
    });
  });

  describe('トグル機能のテスト', () => {
    it('お気に入りをトグルできる', () => {
      const { result } = renderHook(() => useFavorites());
      
      // 追加
      act(() => {
        result.current.toggleFavorite(mockSuggestion);
      });
      
      expect(result.current.isFavorite('test-1')).toBe(true);
      
      // 削除
      act(() => {
        result.current.toggleFavorite(mockSuggestion);
      });
      
      expect(result.current.isFavorite('test-1')).toBe(false);
    });
  });

  describe('クリア機能のテスト', () => {
    it('すべてのお気に入りをクリアできる', () => {
      const { result } = renderHook(() => useFavorites());
      
      const suggestion2: Suggestion = {
        ...mockSuggestion,
        id: 'test-2',
        title: 'テスト提案2'
      };
      
      act(() => {
        result.current.addFavorite(mockSuggestion);
        result.current.addFavorite(suggestion2);
      });
      
      expect(result.current.favorites).toHaveLength(2);
      
      act(() => {
        result.current.clearFavorites();
      });
      
      expect(result.current.favorites).toHaveLength(0);
    });
  });

  describe('永続化のテスト', () => {
    it('localStorageに保存される', () => {
      const { result } = renderHook(() => useFavorites());
      
      act(() => {
        result.current.addFavorite(mockSuggestion);
      });
      
      const stored = localStorage.getItem('kibarashi-favorites');
      expect(stored).toBeTruthy();
      
      const data = JSON.parse(stored!);
      expect(data.favorites).toHaveLength(1);
      expect(data.favorites[0].suggestionId).toBe('test-1');
    });

    it('ページリロード後も保持される', () => {
      // 最初のフック
      const { result: result1 } = renderHook(() => useFavorites());
      
      act(() => {
        result1.current.addFavorite(mockSuggestion);
      });
      
      // 新しいフック（リロードをシミュレート）
      const { result: result2 } = renderHook(() => useFavorites());
      
      expect(result2.current.favorites).toHaveLength(1);
      expect(result2.current.isFavorite('test-1')).toBe(true);
    });
  });

  describe('エクスポート/インポートのテスト', () => {
    it('お気に入りをエクスポートできる', () => {
      const { result } = renderHook(() => useFavorites());
      
      act(() => {
        result.current.addFavorite(mockSuggestion);
      });
      
      const exported = result.current.exportFavorites();
      const data = JSON.parse(exported);
      
      expect(data.favorites).toHaveLength(1);
      expect(data.favorites[0].suggestionId).toBe('test-1');
    });

    it('お気に入りをインポートできる', () => {
      const { result } = renderHook(() => useFavorites());
      
      const importData = JSON.stringify({
        favorites: [{
          id: 'imported-1',
          suggestionId: 'test-imported',
          title: 'インポートされた提案',
          description: 'インポートテスト',
          category: '行動的' as const,
          duration: 15,
          addedAt: new Date().toISOString()
        }],
        lastUpdated: new Date().toISOString()
      });
      
      act(() => {
        const success = result.current.importFavorites(importData);
        expect(success).toBe(true);
      });
      
      expect(result.current.favorites).toHaveLength(1);
      expect(result.current.favorites[0].title).toBe('インポートされた提案');
    });

    it('無効なデータのインポートは失敗する', () => {
      const { result } = renderHook(() => useFavorites());
      
      // console.errorをスパイ化してテスト出力をクリーンに保つ
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      act(() => {
        const success = result.current.importFavorites('invalid json');
        expect(success).toBe(false);
      });
      
      expect(result.current.favorites).toHaveLength(0);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('storage イベントのテスト', () => {
    it('他のタブでの変更を検知する', () => {
      const { result } = renderHook(() => useFavorites());
      
      // 初期状態
      expect(result.current.favorites).toHaveLength(0);
      
      // 他のタブでの変更をシミュレート
      const newData = {
        favorites: [{
          id: 'other-tab-1',
          suggestionId: 'test-other',
          title: '他のタブから追加',
          description: 'テスト',
          category: '認知的' as const,
          duration: 5,
          addedAt: new Date().toISOString()
        }],
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem('kibarashi-favorites', JSON.stringify(newData));
      
      // storage イベントを発火
      act(() => {
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'kibarashi-favorites',
          newValue: JSON.stringify(newData)
        }));
      });
      
      expect(result.current.favorites).toHaveLength(1);
      expect(result.current.favorites[0].title).toBe('他のタブから追加');
    });
  });
});