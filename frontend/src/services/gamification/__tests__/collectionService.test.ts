/**
 * ## テスト観点表（CollectionService）
 *
 * | Case ID | Input / Precondition | Perspective | Expected Result | Notes |
 * |---------|----------------------|-------------|-------------------|-------|
 * | TC-N-01 | 履歴に完了あり | Equivalence | tried true | 要件10.3 |
 * | TC-B-01 | 履歴空 | Boundary | 全未試行 | - |
 * | TC-N-02 | カスタムあり | Equivalence | エントリに含まれる | 要件10.1 |
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CollectionService } from '../collectionService';
import type { HistoryItem } from '../../../types/history';

describe('CollectionService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  const saveHistory = (items: HistoryItem[]) => {
    localStorage.setItem(
      'kibarashi_history',
      JSON.stringify({ history: items, lastUpdated: new Date().toISOString() }),
    );
  };

  it('全エントリにシステム提案とカスタムが含まれる', () => {
    // Given: カスタム1件
    localStorage.setItem(
      'kibarashi_custom_suggestions',
      JSON.stringify({
        customs: [
          {
            id: 'custom-1',
            title: 'カスタム',
            description: '説明',
            category: '認知的',
            duration: 5,
            createdAt: '2026-01-01T00:00:00.000Z',
            isCustom: true,
          },
        ],
        lastUpdated: 'x',
      }),
    );
    // When: getCollectionEntries
    const entries = CollectionService.getCollectionEntries();
    // Then: fallback 件数 + 1
    expect(entries.some((e) => e.suggestionId === 'custom-1')).toBe(true);
    expect(entries.length).toBeGreaterThanOrEqual(6);
  });

  it('完了履歴がある suggestionId は試行済み', () => {
    saveHistory([
      {
        id: 'h1',
        suggestionId: 'fallback-1',
        title: 't',
        description: 'd',
        category: '行動的',
        duration: 5,
        situation: 'workplace',
        startedAt: '2026-01-01T00:00:00.000Z',
        completed: true,
        completedAt: '2026-01-01T00:10:00.000Z',
      },
    ]);
    const entries = CollectionService.getCollectionEntries();
    const row = entries.find((e) => e.suggestionId === 'fallback-1');
    expect(row?.tried).toBe(true);
  });

  it('getCollectionStats は体験済み数と全体数を返す', () => {
    saveHistory([
      {
        id: 'h1',
        suggestionId: 'fallback-2',
        title: 't',
        description: 'd',
        category: '認知的',
        duration: 5,
        situation: 'workplace',
        startedAt: '2026-01-01T00:00:00.000Z',
        completed: true,
      },
    ]);
    const stats = CollectionService.getCollectionStats();
    expect(stats.totalCount).toBe(CollectionService.getCollectionEntries().length);
    expect(stats.triedCount).toBeGreaterThanOrEqual(1);
  });

  it('履歴が空でもエントリ一覧は取得できる', () => {
    saveHistory([]);
    expect(CollectionService.getCollectionEntries().length).toBeGreaterThan(0);
    expect(CollectionService.getCollectionStats().triedCount).toBe(0);
  });
});
