/**
 * 年齢層別対応のための型定義
 * Phase A: 年齢層別展開戦略
 */

/**
 * 対応する年齢層
 */
export type AgeGroup = 
  | 'student'        // 高校生・大学生（16-22歳）
  | 'office_worker'  // 社会人（20-40代）※現在のデフォルト
  | 'middle_school'  // 中学生（13-15歳）
  | 'housewife'      // 主婦（25-45歳）
  | 'elderly';       // 高齢者（65歳以上）

/**
 * 年齢層の詳細情報
 */
export interface AgeGroupInfo {
  id: AgeGroup;
  label: string;
  emoji: string;
  description: string;
  ageRange: string;
  isAvailable: boolean;  // 現在利用可能かどうか
  releasePhase?: string; // リリース予定フェーズ
}

/**
 * ユーザープロフィール
 */
export interface UserProfile {
  userId: string; // ユニークなユーザーID
  ageGroup: AgeGroup;
  selectedAt: string; // ISO 8601形式の日時
  isFirstTimeUser: boolean;
  createdAt: string; // プロフィール作成日時
  lastUpdated: string; // 最終更新日時
  preferences?: {
    defaultDuration?: number; // デフォルトの時間（分）
    favoriteCategories?: string[]; // よく使うカテゴリー
  };
}

/**
 * 年齢層別のプロンプト設定
 */
export interface AgeGroupPromptConfig {
  ageGroup: AgeGroup;
  tone: string; // 話し方のトーン
  emojiUsage: 'none' | 'minimal' | 'moderate' | 'frequent';
  scientificExplanationLevel: 'simple' | 'moderate' | 'detailed';
  safetyLevel: 'standard' | 'high' | 'maximum';
  culturalContext?: string[]; // 文化的な配慮事項
}

/**
 * 年齢層別の制約事項
 */
export interface AgeGroupConstraints {
  ageGroup: AgeGroup;
  timeConstraints?: {
    minDuration: number;
    maxDuration: number;
    recommendedDurations: number[];
  };
  environmentConstraints?: string[]; // 実行環境の制約
  contentRestrictions?: string[]; // コンテンツの制限
  parentalConsiderationRequired?: boolean;
}

/**
 * 年齢層の定義データ
 */
export const AGE_GROUPS: Record<AgeGroup, AgeGroupInfo> = {
  student: {
    id: 'student',
    label: '高校生・大学生',
    emoji: '🎓',
    description: '勉強や将来の不安を抱える学生向け',
    ageRange: '16-22歳',
    isAvailable: true,
    releasePhase: 'Phase A-1'
  },
  office_worker: {
    id: 'office_worker',
    label: '社会人',
    emoji: '💼',
    description: '職場のストレスを抱える社会人向け',
    ageRange: '20-40代',
    isAvailable: true
  },
  middle_school: {
    id: 'middle_school',
    label: '中学生',
    emoji: '🎒',
    description: '思春期の悩みを持つ中学生向け',
    ageRange: '13-15歳',
    isAvailable: false,
    releasePhase: 'Phase B'
  },
  housewife: {
    id: 'housewife',
    label: '主婦・主夫',
    emoji: '🏠',
    description: '家事や育児のストレスを抱える方向け',
    ageRange: '25-45歳',
    isAvailable: false,
    releasePhase: 'Phase A-2'
  },
  elderly: {
    id: 'elderly',
    label: '高齢者',
    emoji: '🌸',
    description: '健康や生活の不安を持つ高齢者向け',
    ageRange: '65歳以上',
    isAvailable: false,
    releasePhase: 'Phase B'
  }
};

/**
 * デフォルトの年齢層
 */
export const DEFAULT_AGE_GROUP: AgeGroup = 'office_worker';

/**
 * 年齢層別のプロンプト設定
 */
export const AGE_GROUP_PROMPT_CONFIGS: Record<AgeGroup, AgeGroupPromptConfig> = {
  student: {
    ageGroup: 'student',
    tone: '親しみやすく励ます感じで、でも軽薄すぎないように',
    emojiUsage: 'moderate',
    scientificExplanationLevel: 'simple',
    safetyLevel: 'high',
    culturalContext: ['SNS文化', '受験・就活プレッシャー', '友人関係の悩み']
  },
  office_worker: {
    ageGroup: 'office_worker',
    tone: '丁寧で実践的、プロフェッショナル',
    emojiUsage: 'minimal',
    scientificExplanationLevel: 'moderate',
    safetyLevel: 'standard',
    culturalContext: ['職場の人間関係', '残業文化', 'キャリアの悩み']
  },
  middle_school: {
    ageGroup: 'middle_school',
    tone: '優しく寄り添う感じで、押し付けがましくない',
    emojiUsage: 'moderate',
    scientificExplanationLevel: 'simple',
    safetyLevel: 'maximum',
    culturalContext: ['思春期の悩み', '学校生活', '親との関係']
  },
  housewife: {
    ageGroup: 'housewife',
    tone: '共感的で温かく、実用的',
    emojiUsage: 'minimal',
    scientificExplanationLevel: 'simple',
    safetyLevel: 'high',
    culturalContext: ['育児の悩み', '家事負担', '自分時間の確保']
  },
  elderly: {
    ageGroup: 'elderly',
    tone: '丁寧な敬語で、ゆっくりと分かりやすく',
    emojiUsage: 'none',
    scientificExplanationLevel: 'simple',
    safetyLevel: 'high',
    culturalContext: ['健康への不安', '孤独感', '昭和・平成の文化']
  }
};

/**
 * 年齢層別の制約
 */
export const AGE_GROUP_CONSTRAINTS: Record<AgeGroup, AgeGroupConstraints> = {
  student: {
    ageGroup: 'student',
    timeConstraints: {
      minDuration: 5,
      maxDuration: 30,
      recommendedDurations: [5, 10, 15]
    },
    environmentConstraints: ['図書館', '電車内', '自室', '学校'],
    contentRestrictions: [],
    parentalConsiderationRequired: false
  },
  office_worker: {
    ageGroup: 'office_worker',
    timeConstraints: {
      minDuration: 5,
      maxDuration: 30,
      recommendedDurations: [5, 15, 30]
    },
    environmentConstraints: ['職場', '家', '外出先'],
    contentRestrictions: [],
    parentalConsiderationRequired: false
  },
  middle_school: {
    ageGroup: 'middle_school',
    timeConstraints: {
      minDuration: 5,
      maxDuration: 15,
      recommendedDurations: [5, 10]
    },
    environmentConstraints: ['学校', '自宅', '塾'],
    contentRestrictions: ['恋愛関係', '進路プレッシャー', '危険な活動'],
    parentalConsiderationRequired: true
  },
  housewife: {
    ageGroup: 'housewife',
    timeConstraints: {
      minDuration: 5,
      maxDuration: 15,
      recommendedDurations: [5, 10, 15]
    },
    environmentConstraints: ['家庭内', '近所', '買い物先'],
    contentRestrictions: [],
    parentalConsiderationRequired: false
  },
  elderly: {
    ageGroup: 'elderly',
    timeConstraints: {
      minDuration: 10,
      maxDuration: 30,
      recommendedDurations: [10, 15, 20]
    },
    environmentConstraints: ['自宅', '公園', '公民館'],
    contentRestrictions: ['激しい運動', '複雑なデジタル操作'],
    parentalConsiderationRequired: false
  }
};