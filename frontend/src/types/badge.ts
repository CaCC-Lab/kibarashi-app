export type BadgeCategory = 'first_step' | 'exploration' | 'engagement';

export type BadgeConditionKey = 'first_try' | 'three_completed' | 'both_categories_used' | 'favorite_saved' | 'note_written' | 'custom_created';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  conditionKey: BadgeConditionKey;
  hint: string;
}

export interface UnlockedBadge {
  badgeId: string;
  unlockedAt: string;
  notificationSeen: boolean;
}

export interface UnlockedBadgeData {
  badges: UnlockedBadge[];
  lastUpdated: string;
}

export interface BadgeEvaluationResult {
  unlocked: UnlockedBadge[];
  locked: BadgeDefinition[];
  newlyUnlocked: BadgeDefinition[];
}
