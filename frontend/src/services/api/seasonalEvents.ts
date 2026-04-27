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

export interface SeasonalEventsFetchResult {
  events: SeasonalEvent[];
  ok: boolean; // false なら呼び出し側でキャッシュせず再試行可能
}

export async function fetchActiveSeasonalEvents(date?: string): Promise<SeasonalEventsFetchResult> {
  const url = date ? `/api/v1/seasonal-events?date=${encodeURIComponent(date)}` : '/api/v1/seasonal-events';
  try {
    const res = await apiClient.get<SeasonalEventsResponse>(url);
    return { events: res?.activeEvents ?? [], ok: true };
  } catch (err) {
    // ネットワーク失敗時は空配列を返しつつ ok=false で失敗を通知
    console.warn('[seasonalEvents] fetch failed:', err);
    return { events: [], ok: false };
  }
}
