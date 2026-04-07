/** ミッション種別 */
export type MissionType = 'try_suggestion' | 'try_category' | 'write_note' | 'try_new';

/** デイリーミッション */
export interface DailyMission {
  id: string;
  date: string;
  type: MissionType;
  title: string;
  description: string;
  targetSuggestionId?: string;
  targetCategory?: '認知的' | '行動的';
  completed: boolean;
  completedAt?: string;
}

/** ミッションストレージデータ */
export interface StoredMission {
  mission: DailyMission;
  lastUpdated: string;
}
