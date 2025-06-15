import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HistoryStorage } from './historyStorage';
import { HistoryItem } from '../../types/history';

/**
 * HistoryStorageクラスのテスト
 * 
 * 設計思想：
 * - モックを使用せず、実際のlocalStorageを使用
 * - データの永続化とエラーハンドリングを重視
 * - 実際の制限事項（最大保存数など）を検証
 */
describe('HistoryStorage', () => {
  const mockHistoryItem: HistoryItem = {
    id: 'history-1',
    suggestionId: 'suggestion-1',
    title: 'デスクで深呼吸',
    description: '椅子に座ったまま深呼吸',
    category: '認知的',
    duration: 5,
    actualDuration: 300,
    situation: 'workplace',
    startedAt: '2025-01-15T10:00:00.000Z',
    completedAt: '2025-01-15T10:05:00.000Z',
    completed: true,
    rating: 4,
    note: '気分がすっきりした'
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

  describe('getHistoryのテスト', () => {
    it('初期状態では空の履歴を返す', () => {
      const result = HistoryStorage.getHistory();
      
      expect(result.history).toEqual([]);
      expect(result.lastUpdated).toBeTruthy();
    });

    it('保存された履歴を正しく取得できる', () => {
      const data = {
        history: [mockHistoryItem],
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem('kibarashi_history', JSON.stringify(data));
      
      const result = HistoryStorage.getHistory();
      
      expect(result.history).toHaveLength(1);
      expect(result.history[0].id).toBe('history-1');
    });

    it('不正なデータの場合は空の履歴を返す', () => {
      localStorage.setItem('kibarashi_history', 'invalid json');
      
      const result = HistoryStorage.getHistory();
      
      expect(result.history).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('history配列がない場合は空の履歴を返す', () => {
      localStorage.setItem('kibarashi_history', JSON.stringify({ notHistory: 'data' }));
      
      const result = HistoryStorage.getHistory();
      
      expect(result.history).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('addHistoryItemのテスト', () => {
    it('新しい履歴項目を追加できる', () => {
      const result = HistoryStorage.addHistoryItem(mockHistoryItem);
      
      expect(result).toBe(true);
      
      const data = HistoryStorage.getHistory();
      expect(data.history).toHaveLength(1);
      expect(data.history[0].id).toBe('history-1');
    });

    it('新しい項目は先頭に追加される', () => {
      const item1 = { ...mockHistoryItem, id: 'history-1' };
      const item2 = { ...mockHistoryItem, id: 'history-2' };
      
      HistoryStorage.addHistoryItem(item1);
      HistoryStorage.addHistoryItem(item2);
      
      const data = HistoryStorage.getHistory();
      expect(data.history[0].id).toBe('history-2');
      expect(data.history[1].id).toBe('history-1');
    });

    it('最大件数を超えた場合、古い項目から削除される', () => {
      // 100件追加
      for (let i = 0; i < 105; i++) {
        HistoryStorage.addHistoryItem({
          ...mockHistoryItem,
          id: `history-${i}`
        });
      }
      
      const data = HistoryStorage.getHistory();
      expect(data.history).toHaveLength(100);
      expect(data.history[0].id).toBe('history-104'); // 最新
      expect(data.history[99].id).toBe('history-5'); // 最古
    });

    it('storageイベントが発火される', () => {
      const eventSpy = vi.fn();
      window.addEventListener('storage', eventSpy);
      
      HistoryStorage.addHistoryItem(mockHistoryItem);
      
      expect(eventSpy).toHaveBeenCalled();
      
      window.removeEventListener('storage', eventSpy);
    });
  });

  describe('updateHistoryItemのテスト', () => {
    it('既存の履歴項目を更新できる', () => {
      HistoryStorage.addHistoryItem(mockHistoryItem);
      
      const result = HistoryStorage.updateHistoryItem('history-1', {
        completed: true,
        completedAt: '2025-01-15T10:05:00.000Z',
        actualDuration: 298,
        rating: 5,
        note: 'とても良かった'
      });
      
      expect(result).toBe(true);
      
      const data = HistoryStorage.getHistory();
      expect(data.history[0].rating).toBe(5);
      expect(data.history[0].note).toBe('とても良かった');
      expect(data.history[0].id).toBe('history-1'); // IDは変更されない
    });

    it('存在しない項目の更新は失敗する', () => {
      const result = HistoryStorage.updateHistoryItem('non-existent', {
        completed: true
      });
      
      expect(result).toBe(false);
    });

    it('IDは更新できない', () => {
      HistoryStorage.addHistoryItem(mockHistoryItem);
      
      HistoryStorage.updateHistoryItem('history-1', {
        id: 'new-id' as any,
        title: '新しいタイトル'
      });
      
      const data = HistoryStorage.getHistory();
      expect(data.history[0].id).toBe('history-1');
      expect(data.history[0].title).toBe('新しいタイトル');
    });
  });

  describe('deleteHistoryItemのテスト', () => {
    it('特定の履歴項目を削除できる', () => {
      HistoryStorage.addHistoryItem(mockHistoryItem);
      
      const result = HistoryStorage.deleteHistoryItem('history-1');
      
      expect(result).toBe(true);
      
      const data = HistoryStorage.getHistory();
      expect(data.history).toHaveLength(0);
    });

    it('存在しない項目の削除は失敗する', () => {
      const result = HistoryStorage.deleteHistoryItem('non-existent');
      
      expect(result).toBe(false);
    });
  });

  describe('clearHistoryのテスト', () => {
    it('すべての履歴をクリアできる', () => {
      HistoryStorage.addHistoryItem(mockHistoryItem);
      
      const result = HistoryStorage.clearHistory();
      
      expect(result).toBe(true);
      
      const data = HistoryStorage.getHistory();
      expect(data.history).toHaveLength(0);
    });
  });

  describe('getStatsのテスト', () => {
    it('履歴の統計情報を正しく計算する', () => {
      const items: HistoryItem[] = [
        { ...mockHistoryItem, id: '1', completed: true, rating: 5, actualDuration: 300, category: '認知的', situation: 'workplace' },
        { ...mockHistoryItem, id: '2', completed: true, rating: 4, actualDuration: 900, category: '行動的', situation: 'home' },
        { ...mockHistoryItem, id: '3', completed: false, category: '認知的', situation: 'outside' },
        { ...mockHistoryItem, id: '4', completed: true, rating: 3, actualDuration: 600, category: '行動的', situation: 'workplace' },
      ];
      
      items.forEach(item => HistoryStorage.addHistoryItem(item));
      
      const stats = HistoryStorage.getStats();
      
      expect(stats.totalCount).toBe(4);
      expect(stats.completedCount).toBe(3);
      expect(stats.totalDuration).toBe(1800); // 300 + 900 + 600
      expect(stats.averageRating).toBe(4); // (5 + 4 + 3) / 3
      expect(stats.categoryCounts.認知的).toBe(2);
      expect(stats.categoryCounts.行動的).toBe(2);
      expect(stats.situationCounts.workplace).toBe(2);
      expect(stats.situationCounts.home).toBe(1);
      expect(stats.situationCounts.outside).toBe(1);
    });

    it('評価がない場合はaverageRatingがundefined', () => {
      const item = { ...mockHistoryItem, rating: undefined };
      HistoryStorage.addHistoryItem(item);
      
      const stats = HistoryStorage.getStats();
      
      expect(stats.averageRating).toBeUndefined();
    });
  });

  describe('エクスポート/インポートのテスト', () => {
    it('履歴をエクスポートできる', () => {
      HistoryStorage.addHistoryItem(mockHistoryItem);
      
      const exported = HistoryStorage.exportHistory();
      const data = JSON.parse(exported);
      
      expect(data.history).toHaveLength(1);
      expect(data.history[0].id).toBe('history-1');
    });

    it('履歴をインポートできる（置き換え）', () => {
      const importData = JSON.stringify({
        history: [{
          ...mockHistoryItem,
          id: 'imported-1',
          title: 'インポートされた履歴'
        }],
        lastUpdated: new Date().toISOString()
      });
      
      const result = HistoryStorage.importHistory(importData, false);
      
      expect(result).toBe(true);
      
      const data = HistoryStorage.getHistory();
      expect(data.history).toHaveLength(1);
      expect(data.history[0].title).toBe('インポートされた履歴');
    });

    it('履歴をインポートできる（マージ）', () => {
      HistoryStorage.addHistoryItem(mockHistoryItem);
      
      const importData = JSON.stringify({
        history: [{
          ...mockHistoryItem,
          id: 'imported-1',
          title: 'インポートされた履歴'
        }],
        lastUpdated: new Date().toISOString()
      });
      
      const result = HistoryStorage.importHistory(importData, true);
      
      expect(result).toBe(true);
      
      const data = HistoryStorage.getHistory();
      expect(data.history).toHaveLength(2);
    });

    it('重複するIDはマージ時に除去される', () => {
      HistoryStorage.addHistoryItem(mockHistoryItem);
      
      const importData = JSON.stringify({
        history: [mockHistoryItem], // 同じID
        lastUpdated: new Date().toISOString()
      });
      
      HistoryStorage.importHistory(importData, true);
      
      const data = HistoryStorage.getHistory();
      expect(data.history).toHaveLength(1);
    });

    it('無効なデータのインポートは失敗する', () => {
      const result = HistoryStorage.importHistory('invalid json');
      
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('history配列がない場合はインポートは失敗する', () => {
      const result = HistoryStorage.importHistory(JSON.stringify({ notHistory: 'data' }));
      
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('エラーハンドリングのテスト', () => {
    it('localStorageが使用できない場合でもエラーにならない', () => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn().mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      
      const result = HistoryStorage.addHistoryItem(mockHistoryItem);
      
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      Storage.prototype.setItem = originalSetItem;
    });
  });
});