# 学生向けプロンプト最適化実装例

## 1. プロンプト比較: 現行版 vs 学生最適化版

### 現行プロンプト（職場向け）

```typescript
const currentWorkplacePrompt = `
あなたは職場のストレス解消をサポートする専門的なAIアシスタントです。

【状況】: 職場で
【利用可能時間】: 5分
【対象者】: 20-40代の会社員

職場環境に適した、実践的で短時間で実行可能な気晴らし方法を3つ提案してください。
科学的根拠に基づき、同僚に迷惑をかけず、業務効率向上に繋がる内容としてください。

以下のJSON形式で回答してください：
{
  "suggestions": [
    {
      "title": "提案タイトル",
      "description": "詳細説明（100-150文字）", 
      "steps": ["手順1", "手順2", "手順3"],
      "category": "認知的 or 行動的",
      "duration": 5
    }
  ]
}
`;
```

**期待される応答例**:
```json
{
  "suggestions": [
    {
      "title": "デスクサイド深呼吸法",
      "description": "座ったまま実行できる呼吸法です。4秒で息を吸い、7秒止め、8秒で吐く478呼吸法により、副交感神経を活性化させ、ストレス軽減効果が期待できます。",
      "steps": ["背筋を伸ばして椅子に座る", "4秒かけて鼻から息を吸う", "7秒間息を止める", "8秒かけて口から息を吐く"],
      "category": "認知的",
      "duration": 5
    }
  ]
}
```

### 学生向け最適化プロンプト

```typescript
const studentOptimizedPrompt = `
あなたは高校生・大学生（16-22歳）の気持ちに寄り添うAIカウンセラーです 🎓
勉強、友人関係、将来への不安など、学生特有のストレスを理解し、
親しみやすく実践的なアドバイスを提供してください。

【状況】: 勉強中・勉強の合間
【利用可能時間】: 5分  
【特別な配慮】: 集中力低下、レポート締切のプレッシャー

以下の方針で3つの気晴らし方法を提案してください：
✨ 親しみやすく、でも軽薄すぎない言葉遣い
😊 絵文字を適度に使用（各提案に1-2個）
📚 科学的根拠を1-2行で簡潔に説明
🏫 図書館、電車内、自室で実践可能
💪 将来不安、学業プレッシャー、人間関係の悩みに配慮

以下のJSON形式で回答してください：
{
  "suggestions": [
    {
      "title": "提案タイトル（絵文字1個含む）",
      "description": "親しみやすい説明（80-120文字）",
      "steps": ["ステップ1", "ステップ2", "ステップ3"],
      "category": "認知的 or 行動的", 
      "benefit": "学生向けメリット説明",
      "scientificBasis": "科学的根拠（簡潔に1-2行）",
      "duration": 5
    }
  ]
}
`;
```

**期待される応答例**:
```json
{
  "suggestions": [
    {
      "title": "集中力リセット呼吸法 🌸",
      "description": "勉強疲れの脳をスッキリさせる呼吸法だよ！4-7-8のリズムで呼吸するだけで、心も落ち着いて次の勉強に集中できるよ ✨",
      "steps": ["背筋を伸ばしてリラックス", "4秒で鼻から息を吸う", "7秒息を止める", "8秒で口からゆっくり吐く"],
      "category": "認知的",
      "benefit": "脳の疲労回復と集中力向上、テスト前の緊張緩和にも効果的",
      "scientificBasis": "副交感神経を活性化し、ストレスホルモンのコルチゾールを減少させる効果が科学的に実証されています",
      "duration": 5
    }
  ]
}
```

## 2. 差別化ポイントの分析

| 要素 | 現行版（職場向け） | 学生最適化版 | 改善効果 |
|------|-----------------|-------------|---------|
| **言葉遣い** | 敬語中心、フォーマル | カジュアル丁寧語、親しみやすい | +3pt 親しみやすさ |
| **絵文字使用** | なし | 適度に使用（1-2個/提案） | +2pt 視覚的親しみやすさ |
| **説明長** | 100-150文字（詳細） | 80-120文字（簡潔） | +1pt 読みやすさ |
| **科学的根拠** | 専門的で詳細 | 簡潔で分かりやすい | +2pt 理解しやすさ |
| **想定環境** | オフィス特化 | 学習環境対応 | +3pt 実用性 |
| **ストレス要因** | 業務、上司関係 | 学業、将来不安、友人関係 | +3pt 共感度 |

## 3. 年齢層別プロンプト実装例

### 中学生向け（13-15歳）

```typescript
const middleSchoolPrompt = `
あなたは中学生の気持ちを理解してくれる優しいお姉さん/お兄さんです 🌟

【対象】: 中学生（13-15歳）
【状況】: ${situation}
【時間】: ${duration}分

中学生の生活に寄り添った、安全で実践しやすい気晴らし方法を提案してください：
🎯 中学生にも分かりやすい言葉
🛡️ 安全性を最優先（危険な活動は絶対NG）
🏠 家や学校で気軽にできる
👥 友達と一緒でも、一人でもOK
📱 スマホを使いすぎない方法

JSON形式で3つ提案してください（benefitとscientificBasisは優しく説明）
`;
```

### 主婦向け（25-45歳）

```typescript
const housewifePrompt = `
あなたは同じ立場のママ友として、育児や家事の大変さを理解してくれるAIです 💕

【対象】: 主婦・ママ（25-45歳）
【状況】: ${situation}  
【時間】: ${duration}分
【特別配慮】: 子育て中、家事の合間、限られた自分時間

育児や家事で疲れた心と体をいたわる気晴らし方法を提案してください：
🏠 家でできる（子供がいても大丈夫）
⏰ 短時間で効果的
👶 子供の声や動きを考慮
💪 ママの心と体のケア重視
🤗 孤立感の解消も意識

同じママとして共感を込めて、JSON形式で3つ提案してください
`;
```

### 高齢者向け（65歳以上）

```typescript
const elderlyPrompt = `
いつもお疲れ様でございます。あなたの人生経験を尊重し、
穏やかで心地よい時間をお過ごしいただけるようお手伝いいたします 🌸

【対象】: 65歳以上の方
【状況】: ${situation}
【時間】: ${duration}分

人生の豊かな経験をお持ちの方に相応しい、穏やかな気晴らし方法をご提案いたします：
🌸 昔懐かしい要素を取り入れて
🚶‍♂️ 無理のない軽やかな動き
🧠 記憶力や集中力を自然にサポート
👥 地域の方々との繋がりも大切に
⚡ 急激な変化ではなく、優しい刺激

丁寧にJSON形式で3つご提案いたします
`;
```

## 4. 安全性チェック実装コード例

```typescript
// services/safetyCheck.ts
interface SafetyResult {
  safe: boolean;
  severity: 'low' | 'medium' | 'high';
  issues: string[];
  alternative?: string;
}

export class SafetyCheckService {
  private crisisKeywords = [
    '死にたい', '消えたい', '自殺', '自傷', 'リストカット',
    'いじめ', '虐待', '暴力', '家出', '援助交際'
  ];
  
  private ageInappropriateContent = {
    middleSchool: ['恋愛', 'デート', 'アルバイト', '深夜外出'],
    student: ['違法薬物', '過度な飲酒', '危険運転'],
    housewife: ['育児放棄', '不倫', '借金'],
    elderly: ['激しい運動', 'SNS炎上', '詐欺被害']
  };

  async checkContentSafety(
    content: string, 
    ageGroup: keyof typeof this.ageInappropriateContent
  ): Promise<SafetyResult> {
    
    // 1. 危機介入チェック
    const crisisDetected = this.detectCrisis(content);
    if (crisisDetected) {
      return {
        safe: false,
        severity: 'high',
        issues: ['危機介入が必要な内容が検出されました'],
        alternative: '専門家にご相談することをお勧めします。'
      };
    }

    // 2. 年齢不適切コンテンツチェック
    const inappropriateContent = this.checkAgeAppropriate(content, ageGroup);
    if (inappropriateContent.length > 0) {
      return {
        safe: false,
        severity: 'medium',
        issues: inappropriateContent,
        alternative: await this.generateAlternative(content, ageGroup)
      };
    }

    // 3. Gemini APIによる詳細チェック
    return await this.geminiSafetyCheck(content, ageGroup);
  }

  private detectCrisis(content: string): boolean {
    const lowerContent = content.toLowerCase();
    return this.crisisKeywords.some(keyword => 
      lowerContent.includes(keyword)
    );
  }

  private checkAgeAppropriate(
    content: string, 
    ageGroup: keyof typeof this.ageInappropriateContent
  ): string[] {
    const inappropriateWords = this.ageInappropriateContent[ageGroup];
    const lowerContent = content.toLowerCase();
    
    return inappropriateWords.filter(word => 
      lowerContent.includes(word)
    );
  }

  private async geminiSafetyCheck(
    content: string, 
    ageGroup: string
  ): Promise<SafetyResult> {
    const safetyPrompt = `
    以下のコンテンツが${ageGroup}の年齢層に適切かチェックしてください：
    "${content}"
    
    チェック項目：
    1. 年齢に適した内容か
    2. 安全性に問題はないか  
    3. 心理的に配慮されているか
    4. 実践可能で現実的か
    
    JSON形式で回答：
    {
      "safe": boolean,
      "severity": "low|medium|high",
      "issues": ["問題点1", "問題点2"],
      "suggestions": ["改善案1", "改善案2"]
    }
    `;

    try {
      const response = await this.geminiClient.generateContent(safetyPrompt);
      const result = JSON.parse(response.text);
      
      return {
        safe: result.safe,
        severity: result.severity || 'low',
        issues: result.issues || [],
        alternative: result.suggestions?.[0]
      };
    } catch (error) {
      // エラー時は安全側に倒す
      return {
        safe: false,
        severity: 'high',
        issues: ['安全性チェックでエラーが発生しました'],
        alternative: 'より安全な活動をお勧めします'
      };
    }
  }

  private async generateAlternative(
    originalContent: string,
    ageGroup: string
  ): Promise<string> {
    const alternativePrompt = `
    以下の内容を${ageGroup}に適した安全な代替案に変更してください：
    "${originalContent}"
    
    安全で年齢に適した代替案を1つ提案してください。
    `;

    try {
      const response = await this.geminiClient.generateContent(alternativePrompt);
      return response.text.trim();
    } catch (error) {
      return '深呼吸やストレッチなど、安全で簡単な活動をお勧めします。';
    }
  }
}
```

## 5. A/Bテスト実装例

```typescript
// services/abTestService.ts
export class ABTestService {
  private experiments = {
    studentOptimization: {
      id: 'student_prompt_v2',
      variants: ['control', 'treatment'],
      allocation: { control: 50, treatment: 50 },
      startDate: '2025-07-03',
      endDate: '2025-07-24'
    }
  };

  getUserVariant(userId: string, experimentId: string): string {
    const experiment = this.experiments[experimentId];
    if (!experiment) return 'control';

    // ユーザーIDのハッシュ値で一貫した配布
    const hash = crypto
      .createHash('md5')
      .update(`${userId}_${experimentId}`)
      .digest('hex');
    
    const hashInt = parseInt(hash.substring(0, 8), 16);
    const bucket = hashInt % 100;
    
    return bucket < experiment.allocation.treatment ? 'treatment' : 'control';
  }

  async trackEvent(
    userId: string, 
    experimentId: string, 
    event: string, 
    properties?: Record<string, any>
  ) {
    const variant = this.getUserVariant(userId, experimentId);
    
    await analytics.track('ab_test_event', {
      userId,
      experimentId,
      variant,
      event,
      timestamp: new Date().toISOString(),
      ...properties
    });
  }

  async getExperimentResults(experimentId: string) {
    const results = await analytics.query(`
      SELECT 
        variant,
        COUNT(DISTINCT userId) as users,
        AVG(CASE WHEN event = 'suggestion_completed' THEN 1 ELSE 0 END) as completion_rate,
        AVG(satisfaction_score) as avg_satisfaction
      FROM ab_test_events 
      WHERE experimentId = '${experimentId}'
      GROUP BY variant
    `);

    return results;
  }
}

// 使用例
export const useStudentOptimization = () => {
  const { userId } = useAuth();
  const abTest = new ABTestService();
  
  const getOptimizedPrompt = (baseParams: SuggestionParams) => {
    const variant = abTest.getUserVariant(userId, 'studentOptimization');
    
    if (variant === 'treatment' && baseParams.ageGroup === 'student') {
      return studentOptimizedPrompt;
    }
    
    return currentWorkplacePrompt;
  };

  const trackCompletion = (suggestionId: string, satisfaction: number) => {
    abTest.trackEvent(userId, 'studentOptimization', 'suggestion_completed', {
      suggestionId,
      satisfaction,
      timestamp: Date.now()
    });
  };

  return { getOptimizedPrompt, trackCompletion };
};
```

## 6. 実装スケジュール詳細

### Week 1: 基盤実装（40時間）

#### Day 1-2: UI Components (16時間)
```typescript
// 実装ファイル:
// - components/ageGroup/AgeGroupSelector.tsx
// - hooks/useAgeGroup.ts  
// - types/ageGroup.ts

interface AgeGroupSelectorProps {
  selectedAgeGroup?: string;
  onSelectAgeGroup: (ageGroup: string) => void;
  disabled?: boolean;
}

const AgeGroupSelector: React.FC<AgeGroupSelectorProps> = ({ 
  selectedAgeGroup, 
  onSelectAgeGroup, 
  disabled 
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {AGE_GROUPS.map(group => (
        <AgeGroupCard 
          key={group.id}
          ageGroup={group}
          selected={selectedAgeGroup === group.id}
          onClick={() => onSelectAgeGroup(group.id)}
          disabled={disabled}
        />
      ))}
    </div>
  );
};
```

#### Day 3-4: Prompt Optimization (16時間)
```typescript
// 実装ファイル:
// - services/promptOptimization.ts
// - data/ageGroupPrompts.ts
// - utils/promptGenerator.ts

export class PromptOptimizationService {
  generateOptimizedPrompt(params: OptimizedSuggestionParams): string {
    const baseTemplate = this.getAgeGroupTemplate(params.ageGroup);
    return this.interpolateTemplate(baseTemplate, params);
  }

  private getAgeGroupTemplate(ageGroup: string): string {
    const templates = {
      student: studentOptimizedPrompt,
      middleSchool: middleSchoolPrompt,
      housewife: housewifePrompt,
      elderly: elderlyPrompt,
      default: currentWorkplacePrompt
    };
    
    return templates[ageGroup] || templates.default;
  }
}
```

#### Day 5: Fallback Data (8時間)
```typescript
// 実装ファイル:
// - data/ageGroupFallbacks.ts
// - services/fallbackService.ts

export const ageGroupFallbacks = {
  student: {
    study_5min: [
      {
        title: "集中力リセット呼吸法 🌸",
        description: "勉強疲れの脳をスッキリさせる呼吸法だよ！",
        // ... 詳細データ
      }
    ]
  }
  // ... 他の年齢層
};
```

### Week 2: 統合・テスト（40時間）

#### Day 1-2: System Integration (16時間)
- 既存APIとの統合
- レスポンス形式の統一
- エラーハンドリングの実装

#### Day 3-4: Testing (16時間) 
- ユニットテスト作成
- 統合テスト実装
- E2Eテスト設定

#### Day 5: A/B Test Setup (8時間)
- A/Bテストフレームワーク構築
- メトリクス収集実装

### Week 3: デプロイ・監視（40時間）

#### Day 1-2: Staging Deploy (16時間)
- ステージング環境構築
- 動作検証とバグ修正

#### Day 3: Production Deploy (8時間)
- 段階的本番デプロイ（10%トラフィック）
- 監視ダッシュボード設定

#### Day 4-5: Monitoring & Optimization (16時間)
- パフォーマンス監視
- A/Bテスト結果分析
- 必要に応じた調整

## 成功指標とKPI

| カテゴリ | KPI | 現在値 | 目標値 | 測定方法 |
|---------|-----|--------|--------|---------|
| **エンゲージメント** | 提案実行率 | 65% | 75% | 完了ボタンクリック率 |
| **満足度** | ユーザー評価 | 4.2/5 | 4.5/5 | 5段階評価の平均 |
| **リテンション** | 7日再訪問率 | 45% | 55% | ユーザー追跡分析 |
| **技術的品質** | API応答時間 | 800ms | 600ms | レスポンスタイム監視 |
| **コスト効率** | 月額API費用 | $120 | $20 | 使用量ベースの計算 |

この実装計画により、学生向けに最適化された高品質な気晴らしアプリの提供が可能になります。