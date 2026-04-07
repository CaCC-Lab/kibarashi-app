import {
  BadgeDefinition,
  BadgeEvaluationResult,
  UnlockedBadge,
} from '../../types/badge';
import { BadgeStorage } from '../storage/badgeStorage';
import { HistoryStorage } from '../storage/historyStorage';
import { FavoritesStorage } from '../storage/favoritesStorage';
import { CustomStorage } from '../storage/customStorage';

const DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first_try',
    name: 'はじめの一歩',
    description: '初めての気晴らしを完了しました',
    category: 'first_step',
    conditionKey: 'first_try',
    hint: '気晴らしを1回完了してみましょう',
  },
  {
    id: 'three_completed',
    name: '3つの体験',
    description: '3回の気晴らしを完了しました',
    category: 'first_step',
    conditionKey: 'three_completed',
    hint: '気晴らしを3回完了してみましょう',
  },
  {
    id: 'both_categories_used',
    name: '両方の世界',
    description: '認知的・行動的の両カテゴリを体験しました',
    category: 'exploration',
    conditionKey: 'both_categories_used',
    hint: '認知的と行動的の両方を試してみましょう',
  },
  {
    id: 'favorite_saved',
    name: 'お気に入り発見',
    description: 'お気に入りを登録しました',
    category: 'engagement',
    conditionKey: 'favorite_saved',
    hint: '気に入った提案をお気に入りに追加してみましょう',
  },
  {
    id: 'note_written',
    name: '振り返りの記録',
    description: 'メモを記録しました',
    category: 'engagement',
    conditionKey: 'note_written',
    hint: '実行後にメモを残してみましょう',
  },
  {
    id: 'custom_created',
    name: '自分だけの気晴らし',
    description: 'カスタム気晴らしを作成しました',
    category: 'exploration',
    conditionKey: 'custom_created',
    hint: 'オリジナルの気晴らしを1つ作ってみましょう',
  },
];

function completedHistory() {
  return HistoryStorage.getHistory().history.filter((h) => h.completed);
}

function shouldUnlock(def: BadgeDefinition): boolean {
  const completed = completedHistory();
  const favs = FavoritesStorage.getFavorites().favorites;
  const customs = CustomStorage.getCustomSuggestions().customs;

  switch (def.conditionKey) {
    case 'first_try':
      return completed.length >= 1;
    case 'three_completed':
      return completed.length >= 3;
    case 'both_categories_used': {
      const cog = completed.some((h) => h.category === '認知的');
      const act = completed.some((h) => h.category === '行動的');
      return cog && act;
    }
    case 'favorite_saved':
      return favs.length >= 1;
    case 'note_written':
      return completed.some((h) => (h.note ?? '').trim().length > 0);
    case 'custom_created':
      return customs.length >= 1;
    default:
      return false;
  }
}

export class BadgeEngine {
  static getBadgeDefinitions(): BadgeDefinition[] {
    return [...DEFINITIONS];
  }

  static evaluateBadges(): BadgeEvaluationResult {
    const unlockedRows = BadgeStorage.getUnlockedBadges().badges;
    const unlockedIds = new Set(unlockedRows.map((u) => u.badgeId));
    const newlyUnlocked: BadgeDefinition[] = [];

    for (const def of DEFINITIONS) {
      if (unlockedIds.has(def.id)) continue;
      if (shouldUnlock(def)) {
        const ok = BadgeStorage.unlockBadge(def.id);
        if (ok) {
          newlyUnlocked.push(def);
          unlockedIds.add(def.id);
        }
      }
    }

    const refreshed = BadgeStorage.getUnlockedBadges().badges;
    const locked = DEFINITIONS.filter((d) => !refreshed.some((u) => u.badgeId === d.id));

    return {
      unlocked: refreshed,
      locked,
      newlyUnlocked,
    };
  }

  static checkNewUnlocks(): UnlockedBadge[] {
    const before = new Set(BadgeStorage.getUnlockedBadges().badges.map((b) => b.badgeId));
    this.evaluateBadges();
    const after = BadgeStorage.getUnlockedBadges().badges;
    return after.filter((b) => !before.has(b.badgeId));
  }
}
