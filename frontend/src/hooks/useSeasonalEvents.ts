// 当日アクティブな seasonal_events を取得するフック
// アプリ起動時に1回だけ取得し、ページ間で共有する。
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
    .then((events) => {
      cachedEvents = events;
      cachedDate = today;
      subscribers.forEach((cb) => cb(events));
      return events;
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
