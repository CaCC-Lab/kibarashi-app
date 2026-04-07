/**
 * ## テスト観点表（BadgeEngine）
 *
 * | Case ID | Input / Precondition | Perspective | Expected Result | Notes |
 * |---------|----------------------|-------------|-------------------|-------|
 * | TC-N-01 | 完了1件 | first_try 解除 | 要件2.1 |
 * | TC-N-02 | 完了3件 | three_completed | 要件2.2 |
 * | TC-N-03 | 両カテゴリ完了 | both_categories_used | 要件2.3 |
 * | TC-B-01 | 履歴空 | 解除なし | 境界 |
 * | TC-B-02 | 一度解除済み | 取り消されない | 要件2.7 |
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadgeEngine } from '../badgeEngine';
import { BadgeStorage } from '../../storage/badgeStorage';
import type { HistoryData, HistoryItem } from '../../../types/history';
import type { FavoriteData } from '../../../types/favorites';
import type { CustomSuggestionData } from '../../../types/custom';

vi.mock('../../storage/historyStorage', () => ({
  HistoryStorage: { getHistory: vi.fn() },
}));
vi.mock('../../storage/favoritesStorage', () => ({
  FavoritesStorage: { getFavorites: vi.fn() },
}));
vi.mock('../../storage/customStorage', () => ({
  CustomStorage: { getCustomSuggestions: vi.fn() },
}));

import { HistoryStorage } from '../../storage/historyStorage';
import { FavoritesStorage } from '../../storage/favoritesStorage';
import { CustomStorage } from '../../storage/customStorage';

const mockHistory = (data: HistoryData) => {
  vi.mocked(HistoryStorage.getHistory).mockReturnValue(data);
};
const mockFav = (data: FavoriteData) => {
  vi.mocked(FavoritesStorage.getFavorites).mockReturnValue(data);
};
const mockCustom = (data: CustomSuggestionData) => {
  vi.mocked(CustomStorage.getCustomSuggestions).mockReturnValue(data);
};

const baseItem = (over: Partial<HistoryItem> = {}): HistoryItem => ({
  id: 'h1',
  suggestionId: 's1',
  title: 't',
  description: 'd',
  category: '認知的',
  duration: 5,
  situation: 'workplace',
  startedAt: '2026-01-01T10:00:00.000Z',
  completed: true,
  completedAt: '2026-01-01T10:05:00.000Z',
  ...over,
});

describe('BadgeEngine', () => {
  beforeEach(() => {
    localStorage.clear();
    mockFav({ favorites: [], lastUpdated: 'x' });
    mockCustom({ customs: [], lastUpdated: 'x' });
    mockHistory({ history: [], lastUpdated: 'x' });
  });

  it('getBadgeDefinitions は6種の初期バッジを返す', () => {
    // Given: -
    // When: getBadgeDefinitions
    // Then: 6件、ID が要件に一致
    const defs = BadgeEngine.getBadgeDefinitions();
    expect(defs).toHaveLength(6);
    const ids = defs.map((d) => d.id).sort();
    expect(ids).toEqual(
      [
        'both_categories_used',
        'custom_created',
        'favorite_saved',
        'first_try',
        'note_written',
        'three_completed',
      ].sort(),
    );
  });

  it('完了1件で first_try が解除される', () => {
    mockHistory({
      history: [baseItem({ id: 'a' })],
      lastUpdated: 'x',
    });
    const r = BadgeEngine.evaluateBadges();
    expect(r.newlyUnlocked.some((d) => d.id === 'first_try')).toBe(true);
    expect(BadgeStorage.isUnlocked('first_try')).toBe(true);
  });

  it('完了3件で three_completed が解除される', () => {
    mockHistory({
      history: [baseItem({ id: '1' }), baseItem({ id: '2' }), baseItem({ id: '3' })],
      lastUpdated: 'x',
    });
    BadgeEngine.evaluateBadges();
    expect(BadgeStorage.isUnlocked('three_completed')).toBe(true);
  });

  it('認知的・行動的の両方を完了で both_categories_used', () => {
    mockHistory({
      history: [
        baseItem({ id: '1', category: '認知的' }),
        baseItem({ id: '2', category: '行動的' }),
      ],
      lastUpdated: 'x',
    });
    BadgeEngine.evaluateBadges();
    expect(BadgeStorage.isUnlocked('both_categories_used')).toBe(true);
  });

  it('お気に入り1件で favorite_saved', () => {
    mockHistory({ history: [], lastUpdated: 'x' });
    mockFav({
      favorites: [
        {
          id: 'f1',
          suggestionId: 'x',
          title: 't',
          description: 'd',
          category: '認知的',
          duration: 5,
          addedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      lastUpdated: 'x',
    });
    BadgeEngine.evaluateBadges();
    expect(BadgeStorage.isUnlocked('favorite_saved')).toBe(true);
  });

  it('メモ付き完了で note_written', () => {
    mockHistory({
      history: [baseItem({ note: 'ありがとう' })],
      lastUpdated: 'x',
    });
    BadgeEngine.evaluateBadges();
    expect(BadgeStorage.isUnlocked('note_written')).toBe(true);
  });

  it('カスタム1件で custom_created', () => {
    mockHistory({ history: [], lastUpdated: 'x' });
    mockCustom({
      customs: [
        {
          id: 'c1',
          title: 't',
          description: 'd',
          category: '認知的',
          duration: 5,
          createdAt: '2026-01-01T00:00:00.000Z',
          isCustom: true,
        },
      ],
      lastUpdated: 'x',
    });
    BadgeEngine.evaluateBadges();
    expect(BadgeStorage.isUnlocked('custom_created')).toBe(true);
  });

  it('一度解除されたバッジは evaluate で取り消されない', () => {
    mockHistory({ history: [baseItem()], lastUpdated: 'x' });
    BadgeEngine.evaluateBadges();
    mockHistory({ history: [], lastUpdated: 'x' });
    const r = BadgeEngine.evaluateBadges();
    expect(r.unlocked.some((u) => u.badgeId === 'first_try')).toBe(true);
  });

  it('checkNewUnlocks は新規に追加された解除行のみ返す', () => {
    mockHistory({ history: [baseItem()], lastUpdated: 'x' });
    const nu = BadgeEngine.checkNewUnlocks();
    expect(nu.some((u) => u.badgeId === 'first_try')).toBe(true);
    const nu2 = BadgeEngine.checkNewUnlocks();
    expect(nu2.filter((u) => u.badgeId === 'first_try')).toHaveLength(0);
  });

  it('完了0件では first_try にならない', () => {
    mockHistory({ history: [], lastUpdated: 'x' });
    const r = BadgeEngine.evaluateBadges();
    expect(r.newlyUnlocked.map((d) => d.id)).not.toContain('first_try');
  });
});
