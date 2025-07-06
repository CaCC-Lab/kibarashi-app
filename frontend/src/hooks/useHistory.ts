/**
 * 履歴管理のカスタムフック
 * 
 * 設計思想：
 * - 履歴の追加・更新・削除を簡単に行えるインターフェース
 * - storage イベントによる他タブとの同期
 * - 統計情報の提供
 */

import { useState, useEffect, useCallback } from 'react';
import { HistoryStorage } from '../services/storage/historyStorage';
import { HistoryItem, HistoryStats } from '../types/history';
import { Suggestion } from '../services/api/types';
import { SituationId } from '../types/situation';

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [stats, setStats] = useState<HistoryStats>({
    totalCount: 0,
    completedCount: 0,
    totalDuration: 0,
    averageRating: undefined,
    categoryCounts: {
      認知的: 0,
      行動的: 0,
    },
    situationCounts: {} as Record<SituationId, number>,
    hourlyPattern: {},
    weeklyPattern: {},
    monthlyTrend: [],
  });

  // 履歴データを読み込む
  const loadHistory = useCallback(() => {
    const data = HistoryStorage.getHistory();
    setHistory(data.history);
    setStats(HistoryStorage.getStats());
  }, []);

  // 初回読み込みとstorage イベントの監視
  useEffect(() => {
    loadHistory();

    // 他のタブでの変更を監視
    const handleStorageChange = () => {
      loadHistory();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadHistory]);

  /**
   * 新しい履歴を開始
   * 
   * なぜこの実装か：
   * - 気晴らしを開始した時点で履歴に記録
   * - 完了前でも履歴として残す（中断した場合の記録）
   */
  const startHistory = useCallback((
    suggestion: Suggestion,
    situation: SituationId
  ): string => {
    const historyItem: HistoryItem = {
      id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      suggestionId: suggestion.id,
      title: suggestion.title,
      description: suggestion.description,
      category: suggestion.category,
      duration: suggestion.duration,
      situation,
      startedAt: new Date().toISOString(),
      completed: false,
    };

    const success = HistoryStorage.addHistoryItem(historyItem);
    if (success) {
      loadHistory();
      return historyItem.id;
    }
    return '';
  }, [loadHistory]);

  /**
   * 履歴を完了として更新
   * 
   * なぜこの実装か：
   * - 実際の実行時間を記録
   * - 満足度評価やメモを追加可能
   */
  const completeHistory = useCallback((
    id: string,
    actualDuration: number,
    rating?: 1 | 2 | 3 | 4 | 5,
    note?: string
  ): boolean => {
    const updates: Partial<HistoryItem> = {
      completed: true,
      completedAt: new Date().toISOString(),
      actualDuration,
      rating,
      note,
    };

    const success = HistoryStorage.updateHistoryItem(id, updates);
    if (success) {
      loadHistory();
    }
    return success;
  }, [loadHistory]);

  /**
   * 履歴項目を削除
   */
  const deleteHistoryItem = useCallback((id: string): boolean => {
    const success = HistoryStorage.deleteHistoryItem(id);
    if (success) {
      loadHistory();
    }
    return success;
  }, [loadHistory]);

  /**
   * 履歴項目の評価を更新
   */
  const updateRating = useCallback((id: string, rating: 1 | 2 | 3 | 4 | 5): boolean => {
    const success = HistoryStorage.updateHistoryItem(id, { rating });
    if (success) {
      loadHistory();
    }
    return success;
  }, [loadHistory]);

  /**
   * 履歴項目のメモを更新
   */
  const updateNote = useCallback((id: string, note: string): boolean => {
    const success = HistoryStorage.updateHistoryItem(id, { note });
    if (success) {
      loadHistory();
    }
    return success;
  }, [loadHistory]);

  /**
   * すべての履歴をクリア
   */
  const clearHistory = useCallback((): boolean => {
    const success = HistoryStorage.clearHistory();
    if (success) {
      loadHistory();
    }
    return success;
  }, [loadHistory]);

  /**
   * 履歴のエクスポート
   */
  const exportHistory = useCallback((): string => {
    return HistoryStorage.exportHistory();
  }, []);

  /**
   * 履歴のインポート
   */
  const importHistory = useCallback((jsonData: string, merge: boolean = false): boolean => {
    const success = HistoryStorage.importHistory(jsonData, merge);
    if (success) {
      loadHistory();
    }
    return success;
  }, [loadHistory]);

  /**
   * 特定の期間の履歴を取得
   */
  const getHistoryByDateRange = useCallback((startDate: Date, endDate: Date): HistoryItem[] => {
    return history.filter(item => {
      const itemDate = new Date(item.startedAt);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }, [history]);

  /**
   * 特定の状況の履歴を取得
   */
  const getHistoryBySituation = useCallback((situation: 'workplace' | 'home' | 'outside'): HistoryItem[] => {
    return history.filter(item => item.situation === situation);
  }, [history]);

  /**
   * 特定のカテゴリーの履歴を取得
   */
  const getHistoryByCategory = useCallback((category: '認知的' | '行動的'): HistoryItem[] => {
    return history.filter(item => item.category === category);
  }, [history]);

  return {
    history,
    stats,
    startHistory,
    completeHistory,
    deleteHistoryItem,
    updateRating,
    updateNote,
    clearHistory,
    exportHistory,
    importHistory,
    getHistoryByDateRange,
    getHistoryBySituation,
    getHistoryByCategory,
  };
}