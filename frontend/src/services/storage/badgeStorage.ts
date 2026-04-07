import { UnlockedBadgeData, UnlockedBadge } from '../../types/badge';

const STORAGE_KEY = 'kibarashi_badges';

function safeParse(data: string | null): UnlockedBadgeData {
  if (!data) {
    return { badges: [], lastUpdated: new Date().toISOString() };
  }
  try {
    const parsed = JSON.parse(data) as UnlockedBadgeData;
    if (!Array.isArray(parsed.badges)) {
      throw new Error('Invalid badge data');
    }
    return {
      badges: parsed.badges,
      lastUpdated: parsed.lastUpdated ?? new Date().toISOString(),
    };
  } catch {
    console.error('Failed to parse badge storage');
    return { badges: [], lastUpdated: new Date().toISOString() };
  }
}

export class BadgeStorage {
  static getUnlockedBadges(): UnlockedBadgeData {
    return safeParse(localStorage.getItem(STORAGE_KEY));
  }

  /** 新規解除のみ true。重複は false（要件 2.8） */
  static unlockBadge(badgeId: string): boolean {
    const data = this.getUnlockedBadges();
    if (data.badges.some((b) => b.badgeId === badgeId)) {
      return false;
    }
    const row: UnlockedBadge = {
      badgeId,
      unlockedAt: new Date().toISOString(),
      notificationSeen: false,
    };
    data.badges.push(row);
    data.lastUpdated = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Failed to save badge:', e);
      return false;
    }
  }

  static isUnlocked(badgeId: string): boolean {
    return this.getUnlockedBadges().badges.some((b) => b.badgeId === badgeId);
  }

  static markNotificationSeen(badgeId: string): boolean {
    const data = this.getUnlockedBadges();
    const target = data.badges.find((b) => b.badgeId === badgeId);
    if (!target) return false;
    target.notificationSeen = true;
    data.lastUpdated = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Failed to update badge notification:', e);
      return false;
    }
  }
}
