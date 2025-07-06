// CLAUDE-GENERATED: 学生向けプロンプトテンプレート実装
// TDD: Green Phase - テストをパスする最小限の実装

export interface StudentBenefit {
  immediate: string;      // 即時効果
  shortTerm: string;     // 短期効果
  motivation: string;    // モチベーション効果
}

export interface StudentSuggestionExample {
  title: string;
  description: string;
  category: '認知的' | '行動的';
  steps: string[];
  benefit: StudentBenefit;
  returnToStudyTip: string;
}

export interface StudentSituationTemplate {
  examples: StudentSuggestionExample[];
}

export const STUDENT_PROMPT_TEMPLATES: Record<string, StudentSituationTemplate> = {
  studying: {
    examples: [
      {
        title: "ポモドーロ・ブレイク瞑想",
        description: "25分勉強したご褒美に、5分間の特別な瞑想でリフレッシュ",
        category: "認知的",
        steps: [
          "スマホのタイマーを5分にセット",
          "目を閉じて、今学んだ内容を映画のワンシーンのように頭の中で再生",
          "深呼吸しながら、知識が脳に定着していくイメージを描く",
          "最後の30秒で、次の勉強への意気込みを3つ心の中で宣言"
        ],
        benefit: {
          immediate: "脳の情報処理がリセットされ、次の25分間の集中力が向上",
          shortTerm: "学習内容の定着率が15-20%アップ（エビングハウスの忘却曲線に基づく）",
          motivation: "達成感とともに次のセッションへの期待感が高まる"
        },
        returnToStudyTip: "瞑想の最後に立てた3つの宣言を紙に書いてから勉強を再開する"
      },
      {
        title: "暗記ダンス・チャレンジ",
        description: "覚えたい内容をリズムに乗せて体で表現する楽しい新感覚学習法",
        category: "行動的",
        steps: [
          "覚えたい公式や単語を3つ選ぶ",
          "それぞれに簡単な手の動きを割り当てる",
          "好きな音楽に合わせて、動きを繰り返す",
          "最後は音楽なしで動きだけで内容を思い出す"
        ],
        benefit: {
          immediate: "運動により脳への血流が増加し、記憶力が一時的に向上",
          shortTerm: "身体動作と結びついた記憶は通常の2倍長く保持される",
          motivation: "勉強が楽しくなり、苦手科目への抵抗感が減少"
        },
        returnToStudyTip: "次の勉強セッションでも同じ動きを1回してから開始"
      }
    ]
  },
  school: {
    examples: [
      {
        title: "階段瞑想ウォーク",
        description: "校内の階段を使った移動瞑想で心身をリフレッシュ",
        category: "行動的",
        steps: [
          "人の少ない階段を見つける",
          "一段ずつゆっくりと上り、足裏の感覚に集中",
          "3段ごとに立ち止まり、深呼吸を1回",
          "最上階で30秒間、窓の外を眺めて心を整える"
        ],
        benefit: {
          immediate: "適度な運動で脳内のセロトニンが分泌され、気分が向上",
          shortTerm: "午後の授業への集中力が平均30%アップ",
          motivation: "小さな達成感の積み重ねで自己効力感が向上"
        },
        returnToStudyTip: "教室に戻る前に、次の授業で学びたいことを1つ決める"
      }
    ]
  },
  commuting: {
    examples: [
      {
        title: "通学電車マインドマップ",
        description: "車窓の景色から連想ゲームで創造力を刺激してスッキリ",
        category: "認知的",
        steps: [
          "窓の外の景色から気になるものを1つ選ぶ",
          "それから連想される単語を頭の中で5つ挙げる",
          "5つの単語を使って短いストーリーを作る",
          "ストーリーの教訓を今日の目標に結びつける"
        ],
        benefit: {
          immediate: "創造的思考により脳の別の領域が活性化し、勉強疲れがリセット",
          shortTerm: "発想力と論理的思考力が20%向上する効果が期待できる",
          motivation: "日常が学びの場に変わり、通学時間が楽しみになる"
        },
        returnToStudyTip: "作ったストーリーの要素を、今日学ぶ内容と関連付けしよう"
      }
    ]
  },
  beforeExam: {
    examples: [
      {
        title: "試験前パワーポーズ",
        description: "科学的に証明された自信向上ポーズでリフレッシュ",
        category: "行動的",
        steps: [
          "立ち上がって両手を腰に当てる",
          "胸を張り、顎を少し上げて2分間キープ",
          "深呼吸しながら「できる」と心の中で3回唱える",
          "最後に両手を上に伸ばして大きく伸び"
        ],
        benefit: {
          immediate: "テストステロンが増加し、自信と集中力が向上",
          shortTerm: "ストレスホルモンが25%減少し、緊張が和らぐ",
          motivation: "成功イメージが強化され、前向きな気持ちで試験に臨める"
        },
        returnToStudyTip: "パワーポーズの感覚を保ちながら、最も得意な問題から始めることにしよう"
      },
      {
        title: "記憶定着スキャン瞑想",
        description: "学んだ内容を脳に定着させる特別な瞑想法でスッキリ",
        category: "認知的",
        steps: [
          "目を閉じて、今日学習した内容を思い浮かべる",
          "頭の中で重要ポイントを3つピックアップ",
          "それぞれのポイントを映像化して10秒ずつイメージ",
          "最後に全体をつなげて1つのストーリーにする"
        ],
        benefit: {
          immediate: "散在していた知識が整理され、頭がクリアになる",
          shortTerm: "記憶の定着率が30%向上する研究結果あり",
          motivation: "学習内容が整理され、試験への準備が整った実感"
        },
        returnToStudyTip: "作ったストーリーの流れに沿って、もう一度要点を確認しよう"
      }
    ]
  }
};

// A/Bテスト用のメトリクス定義
export const STUDENT_AB_TEST_METRICS = {
  engagement: {
    suggestionClickRate: "提案をクリックする率",
    completionRate: "最後まで実行した率",
    repeatUsageRate: "同じ提案を再度選択する率"
  },
  satisfaction: {
    helpfulnessRating: "役立ち度評価（5段階）",
    moodImprovement: "気分改善度（実行前後の自己評価）",
    recommendationScore: "友達に勧めたい度（NPS）"
  },
  studyImpact: {
    returnToStudyTime: "勉強に戻るまでの時間",
    focusQualityRating: "勉強再開後の集中度評価",
    studySessionDuration: "次の勉強セッションの継続時間"
  },
  sharing: {
    shareButtonClicks: "シェアボタンのクリック数",
    savedSuggestions: "お気に入り保存数",
    screenshotsTaken: "スクリーンショット撮影数"
  }
};

// 学生特有のストレス要因
export interface StudentStressFactors {
  type: 'exam' | 'report' | 'presentation' | 'social' | 'future';
  intensity: '軽' | '中' | '重';
}

// プロンプト生成関数
export interface StudentPromptInput {
  concern: string;
  subject: string;
  time: number;
  situation: 'studying' | 'school' | 'commuting' | 'beforeExam';
  stressFactor?: StudentStressFactors;
}

export function createStudentPrompt(input: StudentPromptInput): string {
  const { concern, subject, time, situation, stressFactor } = input;
  
  // 空の入力に対するフォールバック
  if (!concern && !subject) {
    return `学生向けの気晴らし方法を提案してください。
学生生活全般のストレスに対応する${time}分間の気晴らし方法を3つ提案してください。

以下のJSON形式で回答してください：
{
  "title": "提案のタイトル",
  "description": "提案の説明",
  "category": "認知的 または 行動的",
  "steps": ["ステップ1", "ステップ2", "ステップ3"],
  "benefit": {
    "immediate": "すぐに感じられる効果",
    "shortTerm": "数時間〜数日で現れる効果",
    "motivation": "やる気が出る理由"
  },
  "returnToStudyTip": "勉強に戻るための具体的なコツ",
  "duration": ${time}
}`;
  }
  
  // 状況に応じたコンテキスト
  const situationContext = {
    studying: '勉強中・勉強の合間',
    school: '学校や大学で',
    commuting: '通学中',
    beforeExam: '試験前'
  };
  
  return `学生向けの気晴らし方法を提案してください。

状況: ${situationContext[situation]}
悩み: ${concern || '特になし'}
${subject ? `科目: ${subject}` : ''}
${stressFactor ? `ストレス要因: ${getStressDescription(stressFactor)}` : ''}
時間: ${time}分

学生（16-22歳）向けの実践的で効果的な気晴らし方法を提案してください。

以下のJSON形式で回答してください：
{
  "title": "キャッチーで覚えやすいタイトル",
  "description": "概要（学生言葉で親しみやすく）",
  "category": "認知的 または 行動的",
  "steps": ["具体的なステップ1", "ステップ2", "ステップ3"],
  "benefit": {
    "immediate": "すぐに感じられる効果",
    "shortTerm": "数時間〜数日で現れる効果（数字を含む）",
    "motivation": "やる気が出る理由"
  },
  "returnToStudyTip": "勉強に戻るための具体的なコツ",
  "duration": ${time}
}

重要な要件：
- ${concern ? `「${concern}」という悩みに対応する内容` : ''}
- 実践のハードルを下げる（特別な道具不要）
- 科学的根拠のある効果を含める
- 学生の限られた時間と空間の制約を考慮`;
}

// ストレス要因の説明を生成
function getStressDescription(stressFactor: StudentStressFactors): string {
  const typeDescriptions = {
    exam: '試験・テスト',
    report: 'レポート・課題',
    presentation: '発表・プレゼン',
    social: '人間関係',
    future: '将来・進路'
  };
  
  return `${typeDescriptions[stressFactor.type]}に関する${stressFactor.intensity}度のストレス`;
}