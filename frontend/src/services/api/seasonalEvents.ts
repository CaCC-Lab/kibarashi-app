// 当日アクティブな seasonal_events を取得するクライアント
// 仕様: docs/specs/suggestion-axes-extension.md (Phase 4)

import { apiClient } from './client';

export interface SeasonalEvent {
  code: string;
  name_ja: string;
  start_date: string;
  end_date: string;
  description?: string | null;
}

interface SeasonalEventsResponse {
  activeEvents: SeasonalEvent[];
  date: string;
  source: 'database' | 'fallback';
}

export async function fetchActiveSeasonalEvents(date?: string): Promise<SeasonalEvent[]> {
  const url = date ? `/api/v1/seasonal-events?date=${encodeURIComponent(date)}` : '/api/v1/seasonal-events';
  try {
    const res = await apiClient.get<SeasonalEventsResponse>(url);
    return res?.activeEvents ?? [];
  } catch (err) {
    // ネットワーク失敗時は空配列で続行（Phase 4 機能はオプション扱い）
    console.warn('[seasonalEvents] fetch failed:', err);
    return [];
  }
}
