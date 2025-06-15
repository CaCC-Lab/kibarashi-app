/**
 * 履歴データのローカルストレージ管理サービス
 * 
 * 設計思想：
 * - モックを使用せず、実際のlocalStorageを操作
 * - エラーハンドリングを適切に実装し、データ損失を防ぐ
 * - 最大保存件数を設定し、古いデータから自動削除
 */

import { HistoryItem, HistoryData, HistoryStats } from '../../types/history';

const STORAGE_KEY = 'kibarashi_history';
const MAX_HISTORY_ITEMS = 100; // 最大保存件数

export class HistoryStorage {
  /**
   * 履歴データを取得
   * 
   * なぜこの実装か：
   * - localStorageが利用できない環境でも動作を継続
   * - 不正なデータが保存されていても、空の履歴として扱う
   */
  static getHistory(): HistoryData {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return { history: [], lastUpdated: new Date().toISOString() };
      }
      
      const parsed = JSON.parse(data) as HistoryData;
      if (!Array.isArray(parsed.history)) {
        throw new Error('Invalid history data');
      }
      
      return parsed;
    } catch (error) {
      console.error('Failed to load history:', error);
      return { history: [], lastUpdated: new Date().toISOString() };
    }
  }

  /**
   * 新しい履歴項目を追加
   * 
   * なぜこの実装か：
   * - 最新の履歴を先頭に追加（時系列順）
   * - 最大件数を超えたら古いものから削除
   * - エラー時は false を返し、呼び出し側で適切に処理
   */
  static addHistoryItem(item: HistoryItem): boolean {
    try {
      const data = this.getHistory();
      
      // 新しい項目を先頭に追加
      data.history.unshift(item);
      
      // 最大件数を超えたら古いものから削除
      if (data.history.length > MAX_HISTORY_ITEMS) {
        data.history = data.history.slice(0, MAX_HISTORY_ITEMS);
      }
      
      data.lastUpdated = new Date().toISOString();
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      
      // storage イベントを発火（他のタブと同期）
      window.dispatchEvent(new Event('storage'));
      
      return true;
    } catch (error) {
      console.error('Failed to add history item:', error);
      return false;
    }
  }

  /**
   * 履歴項目を更新（実行完了時など）
   * 
   * なぜこの実装か：
   * - 実行開始後に完了時刻や評価を追加更新
   * - IDで特定の項目を更新
   */
  static updateHistoryItem(id: string, updates: Partial<HistoryItem>): boolean {
    try {
      const data = this.getHistory();
      const index = data.history.findIndex(item => item.id === id);
      
      if (index === -1) {
        return false;
      }
      
      data.history[index] = {
        ...data.history[index],
        ...updates,
        id: data.history[index].id // IDは変更不可
      };
      
      data.lastUpdated = new Date().toISOString();
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      
      // storage イベントを発火
      window.dispatchEvent(new Event('storage'));
      
      return true;
    } catch (error) {
      console.error('Failed to update history item:', error);
      return false;
    }
  }

  /**
   * 特定の履歴項目を削除
   */
  static deleteHistoryItem(id: string): boolean {
    try {
      const data = this.getHistory();
      const filteredHistory = data.history.filter(item => item.id !== id);
      
      if (filteredHistory.length === data.history.length) {
        return false; // 項目が見つからなかった
      }
      
      data.history = filteredHistory;
      data.lastUpdated = new Date().toISOString();
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      
      // storage イベントを発火
      window.dispatchEvent(new Event('storage'));
      
      return true;
    } catch (error) {
      console.error('Failed to delete history item:', error);
      return false;
    }
  }

  /**
   * すべての履歴をクリア
   */
  static clearHistory(): boolean {
    try {
      localStorage.removeItem(STORAGE_KEY);
      
      // storage イベントを発火
      window.dispatchEvent(new Event('storage'));
      
      return true;
    } catch (error) {
      console.error('Failed to clear history:', error);
      return false;
    }
  }

  /**
   * 履歴の統計情報を計算
   * 
   * なぜこの実装か：
   * - 統計機能の基礎データを提供
   * - 履歴から有用な情報を抽出
   */
  static getStats(): HistoryStats {
    const data = this.getHistory();
    const history = data.history;
    
    const completedItems = history.filter(item => item.completed);
    const ratings = completedItems
      .filter(item => item.rating !== undefined)
      .map(item => item.rating!);
    
    const totalDuration = completedItems.reduce((sum, item) => {
      return sum + (item.actualDuration || 0);
    }, 0);
    
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      : undefined;
    
    const categoryCounts = {
      認知的: history.filter(item => item.category === '認知的').length,
      行動的: history.filter(item => item.category === '行動的').length,
    };
    
    const situationCounts = {
      workplace: history.filter(item => item.situation === 'workplace').length,
      home: history.filter(item => item.situation === 'home').length,
      outside: history.filter(item => item.situation === 'outside').length,
    };
    
    return {
      totalCount: history.length,
      completedCount: completedItems.length,
      totalDuration,
      averageRating,
      categoryCounts,
      situationCounts,
    };
  }

  /**
   * 履歴データのエクスポート
   */
  static exportHistory(): string {
    const data = this.getHistory();
    return JSON.stringify(data, null, 2);
  }

  /**
   * 履歴データのインポート
   */
  static importHistory(jsonData: string, merge: boolean = false): boolean {
    try {
      const importedData = JSON.parse(jsonData) as HistoryData;
      
      if (!Array.isArray(importedData.history)) {
        throw new Error('Invalid history data format');
      }
      
      if (merge) {
        // 既存のデータとマージ
        const currentData = this.getHistory();
        const mergedHistory = [...importedData.history, ...currentData.history];
        
        // 重複を除去（IDベース）
        const uniqueHistory = mergedHistory.filter((item, index, self) =>
          index === self.findIndex(i => i.id === item.id)
        );
        
        // 最大件数制限
        const limitedHistory = uniqueHistory.slice(0, MAX_HISTORY_ITEMS);
        
        const mergedData: HistoryData = {
          history: limitedHistory,
          lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedData));
      } else {
        // 既存のデータを置き換え
        localStorage.setItem(STORAGE_KEY, JSON.stringify(importedData));
      }
      
      // storage イベントを発火
      window.dispatchEvent(new Event('storage'));
      
      return true;
    } catch (error) {
      console.error('Failed to import history:', error);
      return false;
    }
  }
}