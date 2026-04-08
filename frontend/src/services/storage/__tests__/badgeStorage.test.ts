/**
 * ## テスト観点表（gentle-gamification / BadgeStorage）
 *
 * | Case ID | Input / Precondition | Perspective | Expected Result | Notes |
 * |---------|----------------------|-------------|-------------------|-------|
 * | TC-N-01 | 初期 localStorage | Equivalence | 空配列の UnlockedBadgeData | - |
 * | TC-N-02 | unlockBadge 新規 | Equivalence | true、1件追加 | - |
 * | TC-B-01 | unlockBadge 重複 | Boundary | false、件数増えない | 要件2.8 |
 * | TC-B-02 | 不正 JSON | Boundary | 空にフォールバック | - |
 * | TC-B-03 | badges が配列でない | Boundary | 空にフォールバック | - |
 * | TC-A-01 | markNotificationSeen 未解除ID | Abnormal | false | - |
 * | TC-A-02 | isUnlocked 未定義ID | Abnormal | false | - |
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadgeStorage } from '../badgeStorage';

describe('BadgeStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('初期状態では解除済みバッジが空', () => {
    // Given: ストレージが空
    // When: getUnlockedBadges を呼ぶ
    // Then: badges は空配列
    const data = BadgeStorage.getUnlockedBadges();
    expect(data.badges).toEqual([]);
    expect(data.lastUpdated).toBeTruthy();
  });

  it('unlockBadge で新規解除を追加できる', () => {
    // Given: 空のストレージ
    // When: first_try を解除
    // Then: true、isUnlocked が true
    expect(BadgeStorage.unlockBadge('first_try')).toBe(true);
    expect(BadgeStorage.isUnlocked('first_try')).toBe(true);
    const data = BadgeStorage.getUnlockedBadges();
    expect(data.badges).toHaveLength(1);
    expect(data.badges[0].badgeId).toBe('first_try');
    expect(data.badges[0].notificationSeen).toBe(false);
  });

  it('同一バッジを重複解除しない', () => {
    // Given: first_try 済み
    BadgeStorage.unlockBadge('first_try');
    // When: 再度 unlockBadge
    // Then: false、件数は 1
    expect(BadgeStorage.unlockBadge('first_try')).toBe(false);
    expect(BadgeStorage.getUnlockedBadges().badges).toHaveLength(1);
  });

  it('markNotificationSeen で通知済みにできる', () => {
    // Given: 解除済み
    BadgeStorage.unlockBadge('first_try');
    // When: markNotificationSeen
    // Then: true、notificationSeen が true
    expect(BadgeStorage.markNotificationSeen('first_try')).toBe(true);
    expect(BadgeStorage.getUnlockedBadges().badges[0].notificationSeen).toBe(true);
  });

  it('存在しないバッジIDの markNotificationSeen は false', () => {
    // Given: 空
    // When: 不明な ID
    // Then: false
    expect(BadgeStorage.markNotificationSeen('unknown')).toBe(false);
  });

  it('不正 JSON の場合は空配列にフォールバックする', () => {
    // Given: 壊れた JSON
    localStorage.setItem('kibarashi_badges', 'not-json');
    // When: getUnlockedBadges
    // Then: badges は空
    const data = BadgeStorage.getUnlockedBadges();
    expect(data.badges).toEqual([]);
  });

  it('badges が配列でない場合は空配列にフォールバックする', () => {
    // Given: 不正な構造
    localStorage.setItem('kibarashi_badges', JSON.stringify({ badges: {}, lastUpdated: 'x' }));
    const data = BadgeStorage.getUnlockedBadges();
    expect(data.badges).toEqual([]);
  });

  it('isUnlocked は未定義の ID で false', () => {
    // Given: 空
    // When: isUnlocked('x')
    // Then: false
    expect(BadgeStorage.isUnlocked('three_completed')).toBe(false);
  });
});
