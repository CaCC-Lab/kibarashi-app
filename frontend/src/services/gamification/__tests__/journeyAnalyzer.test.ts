/**
 * ## テスト観点表（JourneyAnalyzer）
 *
 * | Case ID | Input / Precondition | Perspective | Expected Result | Notes |
 * |---------|----------------------|-------------|-------------------|-------|
 * | TC-N-01 | 今週に履歴あり | Equivalence | 集計値・インサイト | 要件5 |
 * | TC-B-01 | 今週0件 | Boundary | 責めないメッセージ | 要件5.3 |
 * | TC-B-02 | 2週間で2件評価 | Boundary | データ不足メッセージ | 要件6.2 |
 * | TC-N-02 | 3件以上評価 | Equivalence | カテゴリメッセージ、非ランキング | 要件6.3 |
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JourneyAnalyzer } from '../journeyAnalyzer';
import type { HistoryItem } from '../../../types/history';

describe('JourneyAnalyzer', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const saveHistory = (items: HistoryItem[]) => {
    localStorage.setItem(
      'kibarashi_history',
      JSON.stringify({ history: items, lastUpdated: new Date().toISOString() }),
    );
  };

  it('今週0件の場合は責めない表現のインサイト', () => {
    // Given: 2026-04-06 月曜午前（週の開始基準で今週にデータなし）
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-06T10:00:00')); // Mon
    saveHistory([]);
    // When: getWeeklySummary
    // Then: 実行0、メッセージは「まだ記録がありません」
    const s = JourneyAnalyzer.getWeeklySummary();
    expect(s.executionCount).toBe(0);
    expect(s.insightMessage).toContain('まだ記録がありません');
  });

  it('今週の実行回数・完了・時間を集計する', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-08T12:00:00')); // Wed same week as Apr 6 Mon
    const items: HistoryItem[] = [
      {
        id: '1',
        suggestionId: 's',
        title: 'a',
        description: 'd',
        category: '行動的',
        duration: 5,
        situation: 'workplace',
        startedAt: '2026-04-07T10:00:00.000Z',
        completed: true,
        completedAt: '2026-04-07T10:05:00.000Z',
        actualDuration: 300,
      },
    ];
    saveHistory(items);
    const s = JourneyAnalyzer.getWeeklySummary();
    expect(s.executionCount).toBe(1);
    expect(s.completionCount).toBe(1);
    expect(s.totalDurationSeconds).toBe(300);
  });

  it('generateInsightMessage は0件サマリーで責めない文言', () => {
    const s = JourneyAnalyzer.getWeeklySummary();
    if (s.executionCount === 0) {
      expect(JourneyAnalyzer.generateInsightMessage(s)).toContain('まだ記録がありません');
    }
  });

  it('直近2週間で評価付き完了が3件未満ならカテゴリ分析はデータ不足', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-10T12:00:00'));
    saveHistory([
      {
        id: '1',
        suggestionId: 's',
        title: 'a',
        description: 'd',
        category: '認知的',
        duration: 5,
        situation: 'home',
        startedAt: '2026-04-09T10:00:00.000Z',
        completed: true,
        rating: 5,
      },
      {
        id: '2',
        suggestionId: 's2',
        title: 'b',
        description: 'd',
        category: '行動的',
        duration: 5,
        situation: 'home',
        startedAt: '2026-04-09T11:00:00.000Z',
        completed: true,
        rating: 4,
      },
    ]);
    const r = JourneyAnalyzer.getEffectiveCategories();
    expect(r.hasEnoughData).toBe(false);
    expect(r.message).toContain('もう少しデータが集まると傾向が見えてきます');
  });

  it('直近2週間に評価付き3件以上で効いているカテゴリを返しランキング表現を使わない', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-10T12:00:00'));
    const mk = (id: string, cat: '認知的' | '行動的', rating: 1 | 2 | 3 | 4 | 5, day: string): HistoryItem => ({
      id,
      suggestionId: `s-${id}`,
      title: 't',
      description: 'd',
      category: cat,
      duration: 5,
      situation: 'home',
      startedAt: `${day}T10:00:00.000Z`,
      completed: true,
      rating,
    });
    saveHistory([
      mk('1', '認知的', 5, '2026-04-09'),
      mk('2', '認知的', 5, '2026-04-09'),
      mk('3', '行動的', 2, '2026-04-09'),
    ]);
    const r = JourneyAnalyzer.getEffectiveCategories();
    expect(r.hasEnoughData).toBe(true);
    expect(r.message).not.toMatch(/1位|2位|ランキング/);
    expect(r.message).toContain('最近効いているカテゴリ');
  });

  it('時間帯分析も3件未満はデータ不足メッセージ', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-10T12:00:00'));
    saveHistory([
      {
        id: '1',
        suggestionId: 's',
        title: 'a',
        description: 'd',
        category: '認知的',
        duration: 5,
        situation: 'home',
        startedAt: '2026-04-09T08:00:00.000Z',
        completed: true,
      },
    ]);
    const r = JourneyAnalyzer.getTimePatterns();
    expect(r.hasEnoughData).toBe(false);
    expect(r.message).toContain('もう少しデータが集まると傾向が見えてきます');
  });

  it('3件以上で時間帯と所要時間区分を返す', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-10T12:00:00'));
    const row = (id: string, hour: number, duration: number): HistoryItem => ({
      id,
      suggestionId: `s-${id}`,
      title: 't',
      description: 'd',
      category: '認知的',
      duration,
      situation: 'home',
      startedAt: `2026-04-09T${String(hour).padStart(2, '0')}:00:00.000Z`,
      completed: true,
    });
    saveHistory([row('1', 8, 5), row('2', 9, 5), row('3', 10, 15)]);
    const r = JourneyAnalyzer.getTimePatterns();
    expect(r.hasEnoughData).toBe(true);
    expect(r.frequentTimeSlot).toBeTruthy();
    expect(r.effectiveDurationRange).toBeTruthy();
  });

  it('不正な履歴JSONは空扱いでサマリー0件', () => {
    localStorage.setItem('kibarashi_history', '{');
    const s = JourneyAnalyzer.getWeeklySummary();
    expect(s.executionCount).toBe(0);
  });
});
