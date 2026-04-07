/**
 * ## テスト観点表（DailyMissionStorage）
 *
 * | Case ID | Input / Precondition | Perspective | Expected Result | Notes |
 * |---------|----------------------|-------------|-------------------|-------|
 * | TC-N-01 | 当日ミッション保存 | Equivalence | getTodayMission で取得可 | - |
 * | TC-B-01 | 日付が変わった stored | Boundary | null 扱い | - |
 * | TC-N-02 | completed 更新 | Equivalence | completed true | 要件12.2 |
 * | TC-N-03 | expired | Equivalence | キー削除 | 要件12.4 |
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DailyMissionStorage } from '../dailyMissionStorage';
import type { DailyMission } from '../../../types/dailyMission';

describe('DailyMissionStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const sampleMission = (date: string): DailyMission => ({
    id: 'm1',
    date,
    type: 'write_note',
    title: 'メモ',
    description: 'メモを書いてみませんか。',
    completed: false,
  });

  it('saveMission 後 getTodayMission で当日分を取得できる', () => {
    // Given: 2026-04-06
    vi.setSystemTime(new Date('2026-04-06T10:00:00'));
    const m = sampleMission('2026-04-06');
    // When: saveMission
    expect(DailyMissionStorage.saveMission(m)).toBe(true);
    // Then: 取得できる
    const stored = DailyMissionStorage.getTodayMission();
    expect(stored?.mission.date).toBe('2026-04-06');
  });

  it('保存日付が今日でなければ getTodayMission は null', () => {
    vi.setSystemTime(new Date('2026-04-06T10:00:00'));
    DailyMissionStorage.saveMission(sampleMission('2026-04-05'));
    expect(DailyMissionStorage.getTodayMission()).toBeNull();
  });

  it('updateMissionStatus completed で達成になる', () => {
    vi.setSystemTime(new Date('2026-04-06T10:00:00'));
    DailyMissionStorage.saveMission(sampleMission('2026-04-06'));
    expect(DailyMissionStorage.updateMissionStatus('completed')).toBe(true);
    const s = DailyMissionStorage.getTodayMission();
    expect(s?.mission.completed).toBe(true);
    expect(s?.mission.completedAt).toBeTruthy();
  });

  it('updateMissionStatus expired はストレージを削除する', () => {
    vi.setSystemTime(new Date('2026-04-06T10:00:00'));
    DailyMissionStorage.saveMission(sampleMission('2026-04-06'));
    expect(DailyMissionStorage.updateMissionStatus('expired')).toBe(true);
    expect(localStorage.getItem('kibarashi_daily_mission')).toBeNull();
  });

  it('ミッションがない状態の updateMissionStatus は false', () => {
    expect(DailyMissionStorage.updateMissionStatus('completed')).toBe(false);
  });

  it('不正 JSON は getTodayMission が null', () => {
    localStorage.setItem('kibarashi_daily_mission', '{');
    expect(DailyMissionStorage.getTodayMission()).toBeNull();
  });
});
