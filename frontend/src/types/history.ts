/**
 * 履歴データの型定義
 * 
 * 設計思想：
 * - ユーザーが実行した気晴らしの記録を保持
 * - 完了状態や実行時間を記録し、振り返りを可能にする
 * - 統計機能の基礎データとしても活用
 */

import { SituationId } from './situation';

export interface HistoryItem {
  id: string;
  suggestionId: string;
  title: string;
  description: string;
  category: '認知的' | '行動的';
  duration: number; // 設定時間（分）
  actualDuration?: number; // 実際の実行時間（秒）
  situation: SituationId;
  startedAt: string; // ISO 8601形式
  completedAt?: string; // ISO 8601形式
  completed: boolean;
  rating?: 1 | 2 | 3 | 4 | 5; // 満足度評価
  note?: string; // メモ
}

export interface HistoryData {
  history: HistoryItem[];
  lastUpdated: string;
}

export interface HistoryStats {
  totalCount: number;
  completedCount: number;
  totalDuration: number; // 秒
  averageRating?: number;
  categoryCounts: {
    認知的: number;
    行動的: number;
  };
  situationCounts: Record<SituationId, number>;
  // 時間帯別の利用パターン（0-23時）
  hourlyPattern: {
    [hour: number]: number;
  };
  // 曜日別の利用パターン（0:日曜日 - 6:土曜日）
  weeklyPattern: {
    [day: number]: number;
  };
  // 月別トレンド（最近12ヶ月）
  monthlyTrend: {
    month: string; // YYYY-MM形式
    count: number;
    completed: number;
  }[];
}