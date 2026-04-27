// 当日アクティブな seasonal_events を取得するフック
// アプリ起動時に1回だけ取得し、ページ間で共有する。
// 取得に失敗した場合はキャッシュせず、次のマウント時に再試行する。
import { useEffect, useState } from 'react';
import { fetchActiveSeasonalEvents, SeasonalEvent } from '../services/api/seasonalEvents';

let cachedEvents: SeasonalEvent[] | null = null;
let cachedDate: string | null = null;
const subscribers = new Set<(events: SeasonalEvent[]) => void>();
let inflight: Promise<SeasonalEvent[]> | null = null;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

async function refresh(force = false): Promise<SeasonalEvent[]> {
  const today = todayIso();
  if (!force && cachedDate === today && cachedEvents) return cachedEvents;
  if (inflight) return inflight;
  inflight = fetchActiveSeasonalEvents(today)
    .then((result) => {
      // 失敗時はキャッシュせず、次回呼出で再試行可能にする
      if (result.ok) {
        cachedEvents = result.events;
        cachedDate = today;
      }
      subscribers.forEach((cb) => cb(result.events));
      return result.events;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function useSeasonalEvents() {
  const [events, setEvents] = useState<SeasonalEvent[]>(cachedEvents ?? []);

  useEffect(() => {
    let mounted = true;
    refresh().then((next) => {
      if (mounted) setEvents(next);
    });
    const onUpdate = (next: SeasonalEvent[]) => {
      if (mounted) setEvents(next);
    };
    subscribers.add(onUpdate);
    return () => {
      mounted = false;
      subscribers.delete(onUpdate);
    };
  }, []);

  return { events };
}
