/**
 * 状況（シナリオ）関連の型定義
 * Phase A: 年齢層別展開戦略で拡張
 */

import { AgeGroup } from './ageGroup';

/**
 * 基本的な状況ID
 */
export type BaseSituationId = 'workplace' | 'home' | 'outside';

/**
 * 学生向けの状況ID
 */
export type StudentSituationId = 'studying' | 'school' | 'home' | 'commuting';

/**
 * 全ての状況IDの統合型
 */
export type SituationId = BaseSituationId | StudentSituationId;

/**
 * 状況の詳細情報
 */
export interface SituationOption {
  id: SituationId;
  label: string;
  description: string;
  icon: React.ReactNode;
  availableFor: AgeGroup[]; // この状況が利用可能な年齢層
}

/**
 * 年齢層別の状況設定
 */
export interface AgeGroupSituations {
  ageGroup: AgeGroup;
  situations: SituationId[];
  defaultSituation?: SituationId;
}

/**
 * 年齢層別の状況マッピング
 */
export const AGE_GROUP_SITUATIONS: Record<AgeGroup, AgeGroupSituations> = {
  office_worker: {
    ageGroup: 'office_worker',
    situations: ['workplace', 'home', 'outside'],
    defaultSituation: 'workplace'
  },
  student: {
    ageGroup: 'student',
    situations: ['studying', 'school', 'home', 'commuting'],
    defaultSituation: 'studying'
  },
  middle_school: {
    ageGroup: 'middle_school',
    situations: ['school', 'home', 'outside'],
    defaultSituation: 'school'
  },
  housewife: {
    ageGroup: 'housewife',
    situations: ['home', 'outside'],
    defaultSituation: 'home'
  },
  elderly: {
    ageGroup: 'elderly',
    situations: ['home', 'outside'],
    defaultSituation: 'home'
  }
};

/**
 * 状況のアイコンコンポーネント
 */
export const SITUATION_ICONS: Record<SituationId, React.ReactNode> = {
  // 既存の社会人向け
  workplace: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  home: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  outside: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  // 学生向け
  studying: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  school: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M12 14v7m0-7l-2-1m2 1l2-1" />
    </svg>
  ),
  commuting: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  )
};

/**
 * 全ての状況の定義
 */
export const ALL_SITUATIONS: Record<SituationId, Omit<SituationOption, 'icon'>> = {
  // 社会人向け
  workplace: {
    id: 'workplace',
    label: '職場',
    description: 'オフィスや仕事場で',
    availableFor: ['office_worker']
  },
  // 汎用（複数の年齢層で使用）
  home: {
    id: 'home',
    label: '家',
    description: '自宅でリラックス',
    availableFor: ['office_worker', 'student', 'middle_school', 'housewife', 'elderly']
  },
  outside: {
    id: 'outside',
    label: '外出先',
    description: '外出中や移動中に',
    availableFor: ['office_worker', 'middle_school', 'housewife', 'elderly']
  },
  // 学生向け
  studying: {
    id: 'studying',
    label: '勉強中',
    description: '勉強の合間に',
    availableFor: ['student']
  },
  school: {
    id: 'school',
    label: '学校',
    description: '学校や大学で',
    availableFor: ['student', 'middle_school']
  },
  commuting: {
    id: 'commuting',
    label: '通学中',
    description: '電車やバスで',
    availableFor: ['student']
  }
};

/**
 * 年齢層に応じた状況オプションを取得
 */
export function getSituationsForAgeGroup(ageGroup: AgeGroup): SituationOption[] {
  const config = AGE_GROUP_SITUATIONS[ageGroup];
  
  return config.situations
    .map(id => {
      const situation = ALL_SITUATIONS[id];
      return {
        ...situation,
        icon: SITUATION_ICONS[id]
      };
    })
    .filter(Boolean) as SituationOption[];
}

/**
 * 状況のラベルを取得
 */
export function getSituationLabel(situationId: SituationId): string {
  return ALL_SITUATIONS[situationId]?.label || situationId;
}

/**
 * 学生向けの状況説明を生成
 */
export function getStudentContextDescription(situation: StudentSituationId): string {
  switch (situation) {
    case 'studying':
      return '集中力が低下してきた時、レポートの締切に追われている時';
    case 'school':
      return '授業の合間、昼休み、放課後など';
    case 'home':
      return '宿題の休憩中、テスト勉強の合間など';
    case 'commuting':
      return '電車やバスでの通学中、混雑した車内でも';
    default:
      return '';
  }
}