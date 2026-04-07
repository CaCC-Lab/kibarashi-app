/** バッジカテゴリ */
export type BadgeCategory = 'first_step' | 'exploration' | 'engagement';

/** バッジ定義 */
export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  conditionKey: string;
  hint: string;
}

/** 解除済みバッジ */
export interface UnlockedBadge {
  badgeId: string;
  unlockedAt: string;
  notificationSeen: boolean;
}

/** バッジストレージデータ */
export interface UnlockedBadgeData {
  badges: UnlockedBadge[];
  lastUpdated: string;
}

/** バッジ評価結果 */
export interface BadgeEvaluationResult {
  unlocked: UnlockedBadge[];
  locked: BadgeDefinition[];
  newlyUnlocked: BadgeDefinition[];
}
