import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHistory } from './useHistory';
import { Suggestion } from '../services/api/types';

/**
 * useHistoryフックのテスト
 * 
 * 設計思想：
 * - モックを使用せず、実際のlocalStorageを使用
 * - 履歴の追加・更新・削除機能を検証
 * - データの永続化と統計計算を確認
 */
describe('useHistory', () => {
  const mockSuggestion: Suggestion = {
    id: 'test-1',
    title: 'テスト提案',
    description: 'これはテスト用の提案です',
    category: '認知的',
    duration: 5,
    steps: ['ステップ1', 'ステップ2']
  };

  // console.errorをスパイ化
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // localStorageをクリア
    localStorage.clear();
    // console.errorをスパイ化
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // console.errorスパイを復元
    if (consoleSpy) {
      consoleSpy.mockRestore();
    }
  });

  describe('初期状態のテスト', () => {
    it('初期状態では空の履歴が返される', () => {
      const { result } = renderHook(() => useHistory());
      
      expect(result.current.history).toEqual([]);
      expect(result.current.stats.totalCount).toBe(0);
      expect(result.current.stats.completedCount).toBe(0);
    });
  });

  describe('履歴の開始', () => {
    it('新しい履歴を開始できる', () => {
      const { result } = renderHook(() => useHistory());
      
      let historyId = '';
      act(() => {
        historyId = result.current.startHistory(mockSuggestion, 'workplace');
      });
      
      expect(historyId).toBeTruthy();
      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].title).toBe('テスト提案');
      expect(result.current.history[0].situation).toBe('workplace');
      expect(result.current.history[0].completed).toBe(false);
    });

    it('複数の履歴を追加できる', () => {
      const { result } = renderHook(() => useHistory());
      
      act(() => {
        result.current.startHistory(mockSuggestion, 'workplace');
        result.current.startHistory(
          { ...mockSuggestion, id: 'test-2', title: 'テスト提案2' },
          'home'
        );
      });
      
      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[0].title).toBe('テスト提案2'); // 新しいものが先頭
      expect(result.current.history[1].title).toBe('テスト提案');
    });
  });

  describe('履歴の完了', () => {
    it('履歴を完了として更新できる', () => {
      const { result } = renderHook(() => useHistory());
      
      let historyId = '';
      act(() => {
        historyId = result.current.startHistory(mockSuggestion, 'workplace');
      });
      
      act(() => {
        const success = result.current.completeHistory(historyId, 298, 5, '気分がすっきりした');
        expect(success).toBe(true);
      });
      
      expect(result.current.history[0].completed).toBe(true);
      expect(result.current.history[0].actualDuration).toBe(298);
      expect(result.current.history[0].rating).toBe(5);
      expect(result.current.history[0].note).toBe('気分がすっきりした');
      expect(result.current.history[0].completedAt).toBeTruthy();
    });

    it('存在しないIDの更新は失敗する', () => {
      const { result } = renderHook(() => useHistory());
      
      act(() => {
        const success = result.current.completeHistory('non-existent', 300);
        expect(success).toBe(false);
      });
    });
  });

  describe('履歴の削除', () => {
    it('特定の履歴を削除できる', () => {
      const { result } = renderHook(() => useHistory());
      
      let historyId = '';
      act(() => {
        historyId = result.current.startHistory(mockSuggestion, 'workplace');
      });
      
      act(() => {
        const success = result.current.deleteHistoryItem(historyId);
        expect(success).toBe(true);
      });
      
      expect(result.current.history).toHaveLength(0);
    });

    it('すべての履歴をクリアできる', () => {
      const { result } = renderHook(() => useHistory());
      
      act(() => {
        result.current.startHistory(mockSuggestion, 'workplace');
        result.current.startHistory(mockSuggestion, 'home');
      });
      
      expect(result.current.history).toHaveLength(2);
      
      act(() => {
        const success = result.current.clearHistory();
        expect(success).toBe(true);
      });
      
      expect(result.current.history).toHaveLength(0);
    });
  });

  describe('評価とメモの更新', () => {
    it('評価を更新できる', () => {
      const { result } = renderHook(() => useHistory());
      
      let historyId = '';
      act(() => {
        historyId = result.current.startHistory(mockSuggestion, 'workplace');
      });
      
      act(() => {
        const success = result.current.updateRating(historyId, 4);
        expect(success).toBe(true);
      });
      
      expect(result.current.history[0].rating).toBe(4);
    });

    it('メモを更新できる', () => {
      const { result } = renderHook(() => useHistory());
      
      let historyId = '';
      act(() => {
        historyId = result.current.startHistory(mockSuggestion, 'workplace');
      });
      
      act(() => {
        const success = result.current.updateNote(historyId, '後で振り返るメモ');
        expect(success).toBe(true);
      });
      
      expect(result.current.history[0].note).toBe('後で振り返るメモ');
    });
  });

  describe('統計情報の計算', () => {
    it('統計情報が正しく計算される', () => {
      const { result } = renderHook(() => useHistory());
      
      act(() => {
        const id1 = result.current.startHistory(mockSuggestion, 'workplace');
        result.current.completeHistory(id1, 300, 5);
        
        const id2 = result.current.startHistory(
          { ...mockSuggestion, category: '行動的' },
          'home'
        );
        result.current.completeHistory(id2, 900, 4);
        
        // 未完了の履歴
        result.current.startHistory(mockSuggestion, 'outside');
      });
      
      expect(result.current.stats.totalCount).toBe(3);
      expect(result.current.stats.completedCount).toBe(2);
      expect(result.current.stats.totalDuration).toBe(1200); // 300 + 900
      expect(result.current.stats.averageRating).toBe(4.5); // (5 + 4) / 2
      expect(result.current.stats.categoryCounts.認知的).toBe(2);
      expect(result.current.stats.categoryCounts.行動的).toBe(1);
      expect(result.current.stats.situationCounts.workplace).toBe(1);
      expect(result.current.stats.situationCounts.home).toBe(1);
      expect(result.current.stats.situationCounts.outside).toBe(1);
    });
  });

  describe('エクスポート/インポート', () => {
    it('履歴をエクスポートできる', () => {
      const { result } = renderHook(() => useHistory());
      
      act(() => {
        result.current.startHistory(mockSuggestion, 'workplace');
      });
      
      const exported = result.current.exportHistory();
      const data = JSON.parse(exported);
      
      expect(data.history).toHaveLength(1);
      expect(data.history[0].title).toBe('テスト提案');
    });

    it('履歴をインポートできる', () => {
      const { result } = renderHook(() => useHistory());
      
      const importData = JSON.stringify({
        history: [{
          id: 'imported-1',
          suggestionId: 'test-imported',
          title: 'インポートされた履歴',
          description: 'インポートテスト',
          category: '行動的' as const,
          duration: 15,
          situation: 'home' as const,
          startedAt: new Date().toISOString(),
          completed: false
        }],
        lastUpdated: new Date().toISOString()
      });
      
      act(() => {
        const success = result.current.importHistory(importData);
        expect(success).toBe(true);
      });
      
      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].title).toBe('インポートされた履歴');
    });

    it('無効なデータのインポートは失敗する', () => {
      const { result } = renderHook(() => useHistory());
      
      act(() => {
        const success = result.current.importHistory('invalid json');
        expect(success).toBe(false);
      });
      
      expect(result.current.history).toHaveLength(0);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('フィルタリング機能', () => {
    it('日付範囲で履歴をフィルタリングできる', () => {
      const { result } = renderHook(() => useHistory());
      
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      
      // テスト用データを追加
      act(() => {
        // 今日の履歴
        result.current.startHistory(mockSuggestion, 'workplace');
        
        // 昨日の履歴をlocalStorageに直接追加
        const yesterdayHistory = {
          id: 'yesterday-1',
          suggestionId: 'test-1',
          title: '昨日の履歴',
          description: 'テスト',
          category: '行動的' as const,
          duration: 5,
          situation: 'home' as const,
          startedAt: yesterday.toISOString(),
          completed: true
        };
        
        const currentData = JSON.parse(localStorage.getItem('kibarashi_history') || '{"history":[]}');
        currentData.history.push(yesterdayHistory);
        localStorage.setItem('kibarashi_history', JSON.stringify(currentData));
        
        // storageイベントを発火してデータを再読み込み
        window.dispatchEvent(new Event('storage'));
      });
      
      const filtered = result.current.getHistoryByDateRange(threeDaysAgo, tomorrow);
      
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.length).toBe(2); // 今日と昨日の2件
    });

    it('状況で履歴をフィルタリングできる', () => {
      const { result } = renderHook(() => useHistory());
      
      act(() => {
        result.current.startHistory(mockSuggestion, 'workplace');
        result.current.startHistory(mockSuggestion, 'home');
        result.current.startHistory(mockSuggestion, 'workplace');
      });
      
      const workplaceHistory = result.current.getHistoryBySituation('workplace');
      const homeHistory = result.current.getHistoryBySituation('home');
      const outsideHistory = result.current.getHistoryBySituation('outside');
      
      expect(workplaceHistory).toHaveLength(2);
      expect(homeHistory).toHaveLength(1);
      expect(outsideHistory).toHaveLength(0);
    });

    it('カテゴリーで履歴をフィルタリングできる', () => {
      const { result } = renderHook(() => useHistory());
      
      act(() => {
        result.current.startHistory(mockSuggestion, 'workplace');
        result.current.startHistory(
          { ...mockSuggestion, category: '行動的' },
          'home'
        );
      });
      
      const cognitiveHistory = result.current.getHistoryByCategory('認知的');
      const behavioralHistory = result.current.getHistoryByCategory('行動的');
      
      expect(cognitiveHistory).toHaveLength(1);
      expect(behavioralHistory).toHaveLength(1);
    });
  });

  describe('storage イベントのテスト', () => {
    it('他のタブでの変更を検知する', () => {
      const { result } = renderHook(() => useHistory());
      
      // 初期状態
      expect(result.current.history).toHaveLength(0);
      
      // 他のタブでの変更をシミュレート
      const newData = {
        history: [{
          id: 'other-tab-1',
          suggestionId: 'test-1',
          title: '他のタブで追加',
          description: 'テスト',
          category: '認知的' as const,
          duration: 5,
          situation: 'workplace' as const,
          startedAt: new Date().toISOString(),
          completed: false
        }],
        lastUpdated: new Date().toISOString()
      };
      
      act(() => {
        localStorage.setItem('kibarashi_history', JSON.stringify(newData));
        window.dispatchEvent(new Event('storage'));
      });
      
      // 変更が反映されることを確認
      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].title).toBe('他のタブで追加');
    });
  });
});