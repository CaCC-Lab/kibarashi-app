/**
 * 就活・転職活動者向けのプロンプトテンプレート
 */

export interface JobHuntingPromptInput {
  // 活動タイプ
  activityType: 'job_seeking' | 'career_change';
  
  // 現在の状況
  currentPhase?: 'preparation' | 'applying' | 'interviewing' | 'waiting' | 'rejected';
  
  // 特定の悩み
  concern?: string;
  
  // 時間
  time: number;
  
  // 場所
  situation: 'workplace' | 'home' | 'outside' | 'commuting' | 'interview_venue';
  
  // ストレス要因
  stressFactor?: string;
  
  // 活動期間（長期化している場合の配慮）
  activityDuration?: 'just_started' | '1-3months' | '3-6months' | 'over_6months';
}

/**
 * 就活生向けの詳細なプロンプトを生成
 */
export function createJobSeekerPrompt(input: JobHuntingPromptInput): string {
  const phaseSpecificGuidance = getPhaseSpecificGuidance(input.currentPhase, 'job_seeking');
  const durationConsideration = getDurationConsideration(input.activityDuration);
  
  return `あなたは就職活動中の若者（20-24歳）に寄り添うキャリアカウンセラーです。
初めての就職活動の不安や緊張を深く理解し、プレッシャーを与えずに前向きな気持ちになれるアドバイスを提供してください。

現在の状況：
- 活動フェーズ: ${phaseSpecificGuidance.label}
- 場所: ${getSituationLabel(input.situation)}
- 時間: ${input.time}分
${input.concern ? `- 特定の悩み: ${input.concern}` : ''}
${input.stressFactor ? `- ストレス要因: ${input.stressFactor}` : ''}
${durationConsideration.message}

特に以下の点に配慮してください：
${phaseSpecificGuidance.considerations}
- 「頑張れ」という言葉ではなく「応援しています」「一息つきませんか？」という優しい言葉を使う
- 自己肯定感を高める内容を含める
- 小さな成功体験を感じられる活動を提案

気晴らし提案の要件：
1. ${input.time}分で完了できる具体的な活動
2. ${getSituationSpecificRequirement(input.situation)}
3. 認知的気晴らしと行動的気晴らしをバランスよく含める
4. 就活のモチベーション維持につながる内容も含める
5. 応援メッセージは「あなたのペースで、一歩ずつ。」のような優しいトーンで

各提案には必ず含めてください：
- タイトル（20文字以内、希望を感じられるもの）
- 説明（100文字程度、効果や気分の変化を含める）
- カテゴリ（"認知的" または "行動的"）
- 具体的な手順（3-5ステップ）
- ガイド（200文字程度、励ましの言葉を含める）
- 科学的根拠（ストレス軽減効果を簡潔に）
- duration（${input.time}）

JSON形式で3つの提案を返してください。`;
}

/**
 * 転職活動者向けの詳細なプロンプトを生成
 */
export function createCareerChangerPrompt(input: JobHuntingPromptInput): string {
  const phaseSpecificGuidance = getPhaseSpecificGuidance(input.currentPhase, 'career_change');
  const durationConsideration = getDurationConsideration(input.activityDuration);
  
  return `あなたは転職活動中の方（25-49歳）の状況を深く理解するキャリアアドバイザーです。
現職との両立の大変さ、キャリアの悩み、年齢や経験に応じた不安を理解し、実践的で共感的なアドバイスを提供してください。

現在の状況：
- 活動フェーズ: ${phaseSpecificGuidance.label}
- 場所: ${getSituationLabel(input.situation)}
- 時間: ${input.time}分
${input.concern ? `- 特定の悩み: ${input.concern}` : ''}
${input.stressFactor ? `- ストレス要因: ${input.stressFactor}` : ''}
${durationConsideration.message}

特に以下の点に配慮してください：
${phaseSpecificGuidance.considerations}
- 現職との両立によるストレスを理解した内容
- 40代後半の方には「培ってこられた知見や判断力は、何物にも代えがたい財産です」のような経験の価値を認める言葉
- 家族がいる方への配慮（プレッシャーの軽減）
- プロフェッショナルとしての自信を保てる内容

気晴らし提案の要件：
1. ${input.time}分で完了できる具体的な活動
2. ${getSituationSpecificRequirement(input.situation)}
3. ビジネスパーソンとして違和感のない内容
4. キャリアの振り返りや前向きな思考につながる要素も含める
5. ワークライフバランスを意識した内容

各提案には必ず含めてください：
- タイトル（20文字以内、専門的かつ前向きなもの）
- 説明（100文字程度、ビジネス効果も含める）
- カテゴリ（"認知的" または "行動的"）
- 具体的な手順（3-5ステップ）
- ガイド（200文字程度、プロフェッショナルな励まし）
- 科学的根拠（ビジネスパーソン向けに効果を端的に）
- duration（${input.time}）

JSON形式で3つの提案を返してください。`;
}

/**
 * フェーズ別のガイダンスを取得
 */
function getPhaseSpecificGuidance(phase: string | undefined, activityType: string) {
  const guidanceMap = {
    job_seeking: {
      preparation: {
        label: '準備段階（自己分析・業界研究）',
        considerations: '- 自己分析の迷いや不安に寄り添う\n- 情報過多による混乱を整理する活動\n- 自己理解を深める認知的活動'
      },
      applying: {
        label: '応募段階（ES作成・エントリー）',
        considerations: '- ES作成の疲れをリフレッシュ\n- 締切プレッシャーの軽減\n- 目の疲れやPC疲れへの配慮'
      },
      interviewing: {
        label: '面接段階',
        considerations: '- 面接前の緊張緩和を最優先\n- 自信を高めるアファメーション\n- 呼吸法やリラックス法'
      },
      waiting: {
        label: '結果待ち段階',
        considerations: '- 不安な待機時間の過ごし方\n- 考えすぎを防ぐ活動\n- 気分転換を重視'
      },
      rejected: {
        label: '不採用後',
        considerations: '- 自己肯定感の回復を最優先\n- 感情を受け入れる活動\n- 次への切り替えをサポート'
      }
    },
    career_change: {
      preparation: {
        label: '準備段階（キャリアの棚卸し）',
        considerations: '- キャリアの価値を再認識する活動\n- 経験を整理する認知的活動\n- 将来ビジョンを描く'
      },
      applying: {
        label: '応募段階（職務経歴書作成）',
        considerations: '- 現職との両立のストレス軽減\n- 限られた時間での効率的なリフレッシュ\n- 経験の言語化をサポート'
      },
      interviewing: {
        label: '面接段階',
        considerations: '- プレゼンスキルを高める活動\n- 経験者としての自信を保つ\n- 緊張と興奮のバランス調整'
      },
      waiting: {
        label: '結果待ち・交渉段階',
        considerations: '- 条件交渉のストレス軽減\n- 冷静な判断力を保つ活動\n- 家族との関係性への配慮'
      },
      rejected: {
        label: '不採用後',
        considerations: '- プロとしての自信回復\n- 経験の価値を見直す活動\n- 市場価値への不安の軽減'
      }
    }
  };
  
  const typeGuidance = guidanceMap[activityType === 'job_seeking' ? 'job_seeking' : 'career_change'];
  return typeGuidance[phase as keyof typeof typeGuidance] || {
    label: '就職・転職活動中',
    considerations: '- 活動全般のストレス軽減\n- モチベーション維持\n- 自己肯定感の向上'
  };
}

/**
 * 活動期間に応じた配慮メッセージを取得
 */
function getDurationConsideration(duration: string | undefined) {
  switch (duration) {
    case 'just_started':
      return { message: '- 活動期間: 開始したばかり（期待と不安が入り混じる時期）' };
    case '1-3months':
      return { message: '- 活動期間: 1-3ヶ月（ペースをつかみ始める時期）' };
    case '3-6months':
      return { message: '- 活動期間: 3-6ヶ月（疲れが出始める時期、モチベーション維持が重要）' };
    case 'over_6months':
      return { message: '- 活動期間: 6ヶ月以上（長期化による焦りや疲労への配慮が必要）' };
    default:
      return { message: '' };
  }
}

/**
 * 状況ラベルを取得
 */
function getSituationLabel(situation: string): string {
  const labels: Record<string, string> = {
    workplace: '職場（現職の休憩時間）',
    home: '自宅',
    outside: '外出先',
    commuting: '通勤・移動中',
    interview_venue: '面接会場付近'
  };
  return labels[situation] || situation;
}

/**
 * 状況別の要件を取得
 */
function getSituationSpecificRequirement(situation: string): string {
  const requirements: Record<string, string> = {
    workplace: '職場で目立たず実践でき、すぐに仕事に戻れる内容',
    home: '自宅でリラックスして行える内容',
    outside: '公共の場でも実践可能で、移動中でもできる内容',
    commuting: '電車やバスの中でも静かに実践できる内容',
    interview_venue: '面接直前でも落ち着いて実践でき、身だしなみを乱さない内容'
  };
  return requirements[situation] || '場所を選ばず実践できる内容';
}