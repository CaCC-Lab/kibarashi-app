export interface JourneySummary {
  periodStart: string;
  periodEnd: string;
  executionCount: number;
  completionCount: number;
  totalDurationSeconds: number;
  insightMessage: string;
}

export interface CategoryEffectiveness {
  category: '認知的' | '行動的';
  averageRating: number;
  count: number;
}

export interface CategoryAnalysisResult {
  hasEnoughData: boolean;
  categories: CategoryEffectiveness[];
  message: string;
}

export type TimeSlot = '朝' | '昼' | '夕方' | '夜';

export type DurationRange = '5分以内' | '5〜15分' | '15分以上';

export interface TimePatternResult {
  hasEnoughData: boolean;
  frequentTimeSlot: TimeSlot | null;
  effectiveDurationRange: DurationRange | null;
  message: string;
}
