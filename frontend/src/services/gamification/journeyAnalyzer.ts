import {
  CategoryAnalysisResult,
  CategoryEffectiveness,
  DurationRange,
  JourneySummary,
  TimePatternResult,
  TimeSlot,
} from '../../types/journey';
import { HistoryStorage } from '../storage/historyStorage';
import { HistoryItem } from '../../types/history';

function startOfWeekMonday(d: Date): Date {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const start = new Date(d);
  start.setDate(d.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

function inRange(iso: string, start: Date, end: Date): boolean {
  const t = new Date(iso).getTime();
  return t >= start.getTime() && t <= end.getTime();
}

function toTimeSlot(hour: number): TimeSlot {
  if (hour >= 5 && hour < 12) return '朝';
  if (hour >= 12 && hour < 17) return '昼';
  if (hour >= 17 && hour < 21) return '夕方';
  return '夜';
}

function toDurationRange(durationMinutes: number): DurationRange {
  if (durationMinutes <= 5) return '5分以内';
  if (durationMinutes <= 15) return '5〜15分';
  return '15分以上';
}

const DATA_SHORT_MSG = 'もう少しデータが集まると傾向が見えてきます';

export class JourneyAnalyzer {
  private static getRecentCompleted(days: number = 14): HistoryItem[] {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);

    return HistoryStorage.getHistory().history.filter(
      (h) => h.completed && inRange(h.startedAt, start, now),
    );
  }

  static getWeeklySummary(): JourneySummary {
    const now = new Date();
    const periodStart = startOfWeekMonday(now);
    const periodEnd = now;
    const hist = HistoryStorage.getHistory().history;
    const inWeek = hist.filter((h) => inRange(h.startedAt, periodStart, periodEnd));

    const executionCount = inWeek.length;
    const completedItems = inWeek.filter((h) => h.completed);
    const completionCount = completedItems.length;
    const totalDurationSeconds = completedItems.reduce((sum, h) => {
      const sec = h.actualDuration ?? h.duration * 60;
      return sum + (typeof sec === 'number' ? sec : 0);
    }, 0);

    const insightMessage = this.buildWeeklyInsight(inWeek, {
      executionCount,
      completionCount,
      totalDurationSeconds,
    });

    return {
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      executionCount,
      completionCount,
      totalDurationSeconds,
      insightMessage,
    };
  }

  private static buildWeeklyInsight(
    inWeek: HistoryItem[],
    sums: { executionCount: number; completionCount: number; totalDurationSeconds: number },
  ): string {
    if (sums.executionCount === 0) {
      return 'まだ記録がありません';
    }
    const done = inWeek.filter((h) => h.completed);
    let cog = 0;
    let act = 0;
    for (const h of done) {
      if (h.category === '認知的') cog++;
      if (h.category === '行動的') act++;
    }
    if (act > cog) {
      return '今週は行動的な気晴らしを多く試しています';
    }
    if (cog > act) {
      return '今週は認知的な気晴らしを多く試しています';
    }
    return '今週の自分のペースで、気晴らしを続けています';
  }

  static generateInsightMessage(summary: JourneySummary): string {
    if (summary.executionCount === 0) {
      return 'まだ記録がありません';
    }
    return summary.insightMessage;
  }

  static getEffectiveCategories(): CategoryAnalysisResult {
    const recent = this.getRecentCompleted(14).filter((h) => h.rating != null);

    if (recent.length < 3) {
      return {
        hasEnoughData: false,
        categories: [],
        message: DATA_SHORT_MSG,
      };
    }

    const buckets: Record<'認知的' | '行動的', { sum: number; n: number }> = {
      認知的: { sum: 0, n: 0 },
      行動的: { sum: 0, n: 0 },
    };
    for (const h of recent) {
      if (h.category !== '認知的' && h.category !== '行動的') continue;
      buckets[h.category].sum += h.rating!;
      buckets[h.category].n += 1;
    }

    const eff: CategoryEffectiveness[] = (['認知的', '行動的'] as const)
      .filter((c) => buckets[c].n > 0)
      .map((c) => ({
        category: c,
        averageRating: buckets[c].sum / buckets[c].n,
        count: buckets[c].n,
      }));

    if (eff.length === 0) {
      return { hasEnoughData: false, categories: [], message: DATA_SHORT_MSG };
    }

    const maxAvg = Math.max(...eff.map((e) => e.averageRating));
    const top = eff.filter((e) => Math.abs(e.averageRating - maxAvg) < 1e-9);

    const names = top.map((t) => t.category).join('・');
    return {
      hasEnoughData: true,
      categories: top,
      message: `最近効いているカテゴリは${names}です`,
    };
  }

  static getTimePatterns(): TimePatternResult {
    const recent = this.getRecentCompleted(14);

    if (recent.length < 3) {
      return {
        hasEnoughData: false,
        frequentTimeSlot: null,
        effectiveDurationRange: null,
        message: DATA_SHORT_MSG,
      };
    }

    const slotCounts: Record<TimeSlot, number> = {
      朝: 0,
      昼: 0,
      夕方: 0,
      夜: 0,
    };
    const durCounts: Record<DurationRange, number> = {
      '5分以内': 0,
      '5〜15分': 0,
      '15分以上': 0,
    };

    for (const h of recent) {
      const hour = new Date(h.startedAt).getHours();
      const slot = toTimeSlot(hour);
      slotCounts[slot] += 1;
      const dr = toDurationRange(h.duration);
      durCounts[dr] += 1;
    }

    const frequentTimeSlot = (Object.keys(slotCounts) as TimeSlot[]).reduce((a, b) =>
      slotCounts[a] >= slotCounts[b] ? a : b,
    );

    const effectiveDurationRange = (Object.keys(durCounts) as DurationRange[]).reduce((a, b) =>
      durCounts[a] >= durCounts[b] ? a : b,
    );

    return {
      hasEnoughData: true,
      frequentTimeSlot,
      effectiveDurationRange,
      message: `よく使う時間帯は${frequentTimeSlot}、続けやすい所要時間は${effectiveDurationRange}です`,
    };
  }
}
