/**
 * ## テスト観点表（MissionGenerator）
 *
 * | Case ID | Input / Precondition | Perspective | Expected Result | Notes |
 * |---------|----------------------|-------------|-------------------|-------|
 * | TC-N-01 | 当日未生成 | Equivalence | ミッション生成・保存 | 要件11.1 |
 * | TC-B-01 | 同日再取得 | Boundary | 同一ミッション | 要件11.1 |
 * | TC-N-02 | 説明文 | Equivalence | 提案的語調のキーワード | 要件11.4 |
 * | TC-N-03 | try_suggestion 達成 | Equivalence | check true | 要件12.2 |
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MissionGenerator } from '../missionGenerator';
import { DailyMissionStorage } from '../../storage/dailyMissionStorage';
import type { DailyMission } from '../../../types/dailyMission';

describe('MissionGenerator', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-06T12:00:00'));
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('getTodayMission は1日1つを生成し保存する', () => {
    // Given: 空
    // When: getTodayMission
    const m = MissionGenerator.getTodayMission();
    // Then: 日付一致、ストレージに載る
    expect(m.date).toBe('2026-04-06');
    expect(DailyMissionStorage.getTodayMission()?.mission.id).toBe(m.id);
  });

  it('同日に再度呼んでも同一ミッションを返す', () => {
    const a = MissionGenerator.getTodayMission();
    const b = MissionGenerator.getTodayMission();
    expect(b.id).toBe(a.id);
  });

  it('ミッション文言は提案的な語調を含む', () => {
    const m = MissionGenerator.getTodayMission();
    const soft =
      m.description.includes('？') ||
      m.description.includes('みませんか') ||
      m.description.includes('おすすめ') ||
      m.description.includes('です');
    expect(soft).toBe(true);
  });

  it('checkMissionCompletion は write_note 型でメモ付き完了を検出', () => {
    const mission: DailyMission = {
      id: 'm1',
      date: '2026-04-06',
      type: 'write_note',
      title: 'メモ',
      description: 'メモを書いてみませんか。',
      completed: false,
    };
    localStorage.setItem(
      'kibarashi_history',
      JSON.stringify({
        history: [
          {
            id: 'h',
            suggestionId: 's',
            title: 't',
            description: 'd',
            category: '認知的',
            duration: 5,
            situation: 'home',
            startedAt: '2026-04-06T10:00:00.000Z',
            completed: true,
            note: 'メモ',
          },
        ],
        lastUpdated: 'x',
      }),
    );
    expect(MissionGenerator.checkMissionCompletion(mission)).toBe(true);
  });

  it('try_suggestion は対象 suggestion の完了で true', () => {
    localStorage.setItem(
      'kibarashi_history',
      JSON.stringify({
        history: [
          {
            id: 'h',
            suggestionId: 'target-s',
            title: 't',
            description: 'd',
            category: '認知的',
            duration: 5,
            situation: 'home',
            startedAt: '2026-04-06T10:00:00.000Z',
            completed: true,
          },
        ],
        lastUpdated: 'x',
      }),
    );
    const mission: DailyMission = {
      id: 'm1',
      date: '2026-04-06',
      type: 'try_suggestion',
      title: 't',
      description: 'd',
      targetSuggestionId: 'target-s',
      completed: false,
    };
    expect(MissionGenerator.checkMissionCompletion(mission)).toBe(true);
  });

  it('条件を満たさない場合は checkMissionCompletion が false', () => {
    localStorage.setItem(
      'kibarashi_history',
      JSON.stringify({ history: [], lastUpdated: 'x' }),
    );
    const mission: DailyMission = {
      id: 'm1',
      date: '2026-04-06',
      type: 'write_note',
      title: 'メモ',
      description: 'メモを書いてみませんか。',
      completed: false,
    };
    expect(MissionGenerator.checkMissionCompletion(mission)).toBe(false);
  });
});
