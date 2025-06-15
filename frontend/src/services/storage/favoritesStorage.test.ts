import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FavoritesStorage } from './favoritesStorage';
import { Suggestion } from '../api/types';

/**
 * FavoritesStorageクラスのテスト
 * 
 * 設計思想：
 * - モックを使用せず、実際のlocalStorageを使用
 * - データの永続化とエラーハンドリングを重視
 * - 実際の制限事項（最大保存数など）を検証
 */
describe('FavoritesStorage', () => {
  const mockSuggestion: Suggestion = {
    id: 'test-1',
    title: 'テスト提案',
    description: 'これはテスト用の提案です',
    category: '認知的',
    duration: 5,
    steps: ['ステップ1', 'ステップ2']
  };

  // console.errorをスパイ化してテスト中のエラー出力を抑制
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    // localStorageをクリア
    localStorage.clear();
    // 各テスト前にスパイをリセット
    consoleErrorSpy.mockClear();
  });

  afterEach(() => {
    // テスト後にスパイをリセット
    consoleErrorSpy.mockClear();
  });

  describe('getFavoritesのテスト', () => {
    it('初期状態では空の配列を返す', () => {
      const result = FavoritesStorage.getFavorites();
      
      expect(result.favorites).toEqual([]);
      expect(result.lastUpdated).toBeTruthy();
    });

    it('保存されたデータを正しく取得できる', () => {
      const data = {
        favorites: [{
          id: 'fav-1',
          suggestionId: 'test-1',
          title: 'テスト',
          description: '説明',
          category: '認知的' as const,
          duration: 5,
          addedAt: new Date().toISOString()
        }],
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem('kibarashi-favorites', JSON.stringify(data));
      
      const result = FavoritesStorage.getFavorites();
      expect(result.favorites).toHaveLength(1);
      expect(result.favorites[0].title).toBe('テスト');
    });

    it('不正なデータの場合は空の配列を返す', () => {
      localStorage.setItem('kibarashi-favorites', 'invalid json');
      
      const result = FavoritesStorage.getFavorites();
      expect(result.favorites).toEqual([]);
      // console.errorが呼ばれたことを確認
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load favorites:', expect.any(Error));
    });

    it('favorites配列がない場合は空の配列を返す', () => {
      localStorage.setItem('kibarashi-favorites', JSON.stringify({ data: 'test' }));
      
      const result = FavoritesStorage.getFavorites();
      expect(result.favorites).toEqual([]);
      // console.errorが呼ばれたことを確認
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load favorites:', expect.any(Error));
    });
  });

  describe('addFavoriteのテスト', () => {
    it('お気に入りを追加できる', () => {
      const success = FavoritesStorage.addFavorite(mockSuggestion);
      
      expect(success).toBe(true);
      
      const data = FavoritesStorage.getFavorites();
      expect(data.favorites).toHaveLength(1);
      expect(data.favorites[0].title).toBe('テスト提案');
      expect(data.favorites[0].suggestionId).toBe('test-1');
    });

    it('同じ提案を重複して追加できない', () => {
      FavoritesStorage.addFavorite(mockSuggestion);
      const success = FavoritesStorage.addFavorite(mockSuggestion);
      
      expect(success).toBe(false);
      
      const data = FavoritesStorage.getFavorites();
      expect(data.favorites).toHaveLength(1);
    });

    it('最大数を超えた場合は最も古いものを削除', () => {
      // 50個追加
      for (let i = 0; i < 50; i++) {
        const suggestion: Suggestion = {
          ...mockSuggestion,
          id: `test-${i}`,
          title: `提案${i}`
        };
        FavoritesStorage.addFavorite(suggestion);
      }
      
      // 51個目を追加
      const newSuggestion: Suggestion = {
        ...mockSuggestion,
        id: 'test-new',
        title: '新しい提案'
      };
      const success = FavoritesStorage.addFavorite(newSuggestion);
      
      expect(success).toBe(true);
      
      const data = FavoritesStorage.getFavorites();
      expect(data.favorites).toHaveLength(50);
      expect(data.favorites[0].title).toBe('提案1'); // 最初のものが削除された
      expect(data.favorites[49].title).toBe('新しい提案');
    });

    it('localStorageエラー時はfalseを返す', () => {
      // localStorage.setItemを一時的に置き換え
      const originalSetItem = localStorage.setItem;
      Object.defineProperty(localStorage, 'setItem', {
        value: function() {
          throw new Error('QuotaExceededError');
        },
        configurable: true
      });
      
      const success = FavoritesStorage.addFavorite(mockSuggestion);
      expect(success).toBe(false);
      // console.errorが呼ばれたことを確認
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to add favorite:', expect.any(Error));
      
      // 復元
      Object.defineProperty(localStorage, 'setItem', {
        value: originalSetItem,
        configurable: true
      });
    });
  });

  describe('removeFavoriteのテスト', () => {
    it('お気に入りを削除できる', () => {
      FavoritesStorage.addFavorite(mockSuggestion);
      
      const success = FavoritesStorage.removeFavorite('test-1');
      expect(success).toBe(true);
      
      const data = FavoritesStorage.getFavorites();
      expect(data.favorites).toHaveLength(0);
    });

    it('存在しないIDの削除はfalseを返す', () => {
      FavoritesStorage.addFavorite(mockSuggestion);
      
      const success = FavoritesStorage.removeFavorite('non-existent');
      expect(success).toBe(false);
      
      const data = FavoritesStorage.getFavorites();
      expect(data.favorites).toHaveLength(1);
    });

    it('複数の中から特定のものを削除できる', () => {
      const suggestion1: Suggestion = { ...mockSuggestion, id: 'test-1' };
      const suggestion2: Suggestion = { ...mockSuggestion, id: 'test-2', title: '提案2' };
      const suggestion3: Suggestion = { ...mockSuggestion, id: 'test-3', title: '提案3' };
      
      FavoritesStorage.addFavorite(suggestion1);
      FavoritesStorage.addFavorite(suggestion2);
      FavoritesStorage.addFavorite(suggestion3);
      
      const success = FavoritesStorage.removeFavorite('test-2');
      expect(success).toBe(true);
      
      const data = FavoritesStorage.getFavorites();
      expect(data.favorites).toHaveLength(2);
      expect(data.favorites.map(f => f.suggestionId)).toEqual(['test-1', 'test-3']);
    });
  });

  describe('isFavoriteのテスト', () => {
    it('お気に入りに存在する場合はtrueを返す', () => {
      FavoritesStorage.addFavorite(mockSuggestion);
      
      expect(FavoritesStorage.isFavorite('test-1')).toBe(true);
    });

    it('お気に入りに存在しない場合はfalseを返す', () => {
      expect(FavoritesStorage.isFavorite('test-1')).toBe(false);
    });
  });

  describe('clearFavoritesのテスト', () => {
    it('すべてのお気に入りをクリアできる', () => {
      FavoritesStorage.addFavorite(mockSuggestion);
      FavoritesStorage.addFavorite({ ...mockSuggestion, id: 'test-2' });
      
      FavoritesStorage.clearFavorites();
      
      const data = FavoritesStorage.getFavorites();
      expect(data.favorites).toHaveLength(0);
      
      // localStorageから削除されている
      expect(localStorage.getItem('kibarashi-favorites')).toBeNull();
    });

    it('エラーが発生してもクラッシュしない', () => {
      // localStorage.removeItemを一時的に置き換え
      const originalRemoveItem = localStorage.removeItem;
      Object.defineProperty(localStorage, 'removeItem', {
        value: function() {
          throw new Error('Storage error');
        },
        configurable: true
      });
      
      expect(() => FavoritesStorage.clearFavorites()).not.toThrow();
      // console.errorが呼ばれたことを確認
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to clear favorites:', expect.any(Error));
      
      // 復元
      Object.defineProperty(localStorage, 'removeItem', {
        value: originalRemoveItem,
        configurable: true
      });
    });
  });

  describe('exportFavoritesのテスト', () => {
    it('JSON形式でエクスポートできる', () => {
      FavoritesStorage.addFavorite(mockSuggestion);
      FavoritesStorage.addFavorite({ ...mockSuggestion, id: 'test-2', title: '提案2' });
      
      const exported = FavoritesStorage.exportFavorites();
      const data = JSON.parse(exported);
      
      expect(data.favorites).toHaveLength(2);
      expect(data.favorites[0].title).toBe('テスト提案');
      expect(data.favorites[1].title).toBe('提案2');
    });

    it('整形されたJSONを出力する', () => {
      FavoritesStorage.addFavorite(mockSuggestion);
      
      const exported = FavoritesStorage.exportFavorites();
      
      // インデントされているか確認
      expect(exported).toContain('\n');
      expect(exported).toContain('  ');
    });
  });

  describe('importFavoritesのテスト', () => {
    it('有効なJSONをインポートできる', () => {
      const importData = {
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
      };
      
      const success = FavoritesStorage.importFavorites(JSON.stringify(importData));
      expect(success).toBe(true);
      
      const data = FavoritesStorage.getFavorites();
      expect(data.favorites).toHaveLength(1);
      expect(data.favorites[0].title).toBe('インポートされた提案');
    });

    it('無効なJSONは失敗する', () => {
      const success = FavoritesStorage.importFavorites('invalid json');
      expect(success).toBe(false);
      // console.errorが呼ばれたことを確認
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to import favorites:', expect.any(Error));
    });

    it('favorites配列がない場合は失敗する', () => {
      const success = FavoritesStorage.importFavorites(JSON.stringify({ data: 'test' }));
      expect(success).toBe(false);
      // console.errorが呼ばれたことを確認
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to import favorites:', expect.any(Error));
    });

    it('必須フィールドがない場合は失敗する', () => {
      const importData = {
        favorites: [{
          // idがない
          suggestionId: 'test',
          title: 'テスト'
        }]
      };
      
      const success = FavoritesStorage.importFavorites(JSON.stringify(importData));
      expect(success).toBe(false);
      // console.errorが呼ばれたことを確認
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to import favorites:', expect.any(Error));
    });

    it('最大数を超える場合は最新のものだけ保持', () => {
      const favorites = [];
      for (let i = 0; i < 60; i++) {
        favorites.push({
          id: `imported-${i}`,
          suggestionId: `test-${i}`,
          title: `提案${i}`,
          description: 'テスト',
          category: '認知的' as const,
          duration: 5,
          addedAt: new Date().toISOString()
        });
      }
      
      const importData = { favorites, lastUpdated: new Date().toISOString() };
      
      const success = FavoritesStorage.importFavorites(JSON.stringify(importData));
      expect(success).toBe(true);
      
      const data = FavoritesStorage.getFavorites();
      expect(data.favorites).toHaveLength(50);
      expect(data.favorites[0].title).toBe('提案10'); // 最初の10個が削除された
      expect(data.favorites[49].title).toBe('提案59');
    });

    it('既存のデータを上書きする', () => {
      FavoritesStorage.addFavorite(mockSuggestion);
      
      const importData = {
        favorites: [{
          id: 'imported-1',
          suggestionId: 'new-test',
          title: '新しい提案',
          description: '上書きテスト',
          category: '行動的' as const,
          duration: 10,
          addedAt: new Date().toISOString()
        }],
        lastUpdated: new Date().toISOString()
      };
      
      const success = FavoritesStorage.importFavorites(JSON.stringify(importData));
      expect(success).toBe(true);
      
      const data = FavoritesStorage.getFavorites();
      expect(data.favorites).toHaveLength(1);
      expect(data.favorites[0].title).toBe('新しい提案');
    });
  });
});