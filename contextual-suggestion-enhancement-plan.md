# コンテキスト連携型気晴らし提案システム設計書

## 概要

最新ニュース・季節・天候データを活用して、よりパーソナライズされた気晴らし提案を生成するシステム。

## 主要機能

### 1. 外部データ統合
- **天候API**: OpenWeatherMap API
- **ニュースAPI**: News API または NHK RSS
- **季節・祝日API**: 内閣府の祝日データ

### 2. コンテキスト分析
- 現在の天候状況（晴れ/雨/雪/気温）
- 季節・月・時期（春夏秋冬、祝日、年末年始等）
- 最新ニュースのトピック分析（AI分析）

### 3. 提案生成ロジック
- 基本提案 + コンテキスト要素 = 強化された提案
- 天候に応じた室内/屋外活動の選択
- 季節に応じた活動提案（桜、紅葉、雪など）
- 時事問題に関連した気晴らし提案

## 実装アーキテクチャ

### A. バックエンド拡張

#### 1. 外部APIクライアント
```typescript
// services/external/weatherClient.ts
interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  humidity: number;
  location: string;
}

// services/external/newsClient.ts
interface NewsData {
  headlines: string[];
  categories: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

// services/external/seasonalClient.ts
interface SeasonalData {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  events: string[]; // 祝日、行事
  specialPeriods: string[]; // 年末年始、GW等
}
```

#### 2. コンテキスト統合サービス
```typescript
// services/context/contextualSuggestionService.ts
class ContextualSuggestionService {
  async generateContextualSuggestions(
    baseSuggestion: Suggestion,
    context: {
      weather: WeatherData;
      news: NewsData;
      seasonal: SeasonalData;
    }
  ): Promise<EnhancedSuggestion>
}
```

#### 3. Geminiプロンプト強化
```typescript
// services/gemini/contextualPromptTemplate.ts
export function generateContextualPrompt(
  baseParms: BasicParams,
  context: ContextData
): string {
  return `
基本提案パラメータ: ${JSON.stringify(baseParms)}

コンテキスト情報:
天候: ${context.weather.condition}、${context.weather.temperature}°C
季節: ${context.seasonal.season}
今日のニュースハイライト: ${context.news.headlines.slice(0,3).join(', ')}

上記のコンテキストを活用して、より具体的で時宜にかなった気晴らし提案を生成してください：

例：
- 雨の日 → 窓辺での雨音を聞きながらの瞑想
- 桜の季節 → 近所の桜の写真を撮る
- 暑い日 → 冷たい飲み物での気分転換
- 話題のニュース → 関連する本やドキュメンタリーを探す
  `;
}
```

### B. フロントエンド拡張

#### 1. コンテキスト表示コンポーネント
```tsx
// components/context/ContextDisplay.tsx
const ContextDisplay: React.FC<{
  weather: WeatherData;
  seasonal: SeasonalData;
}> = ({ weather, seasonal }) => (
  <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg mb-6">
    <div className="flex items-center space-x-4">
      <WeatherIcon condition={weather.condition} />
      <span>{weather.temperature}°C {weather.condition}</span>
      <SeasonalBadge season={seasonal.season} />
    </div>
  </div>
);
```

#### 2. 強化された提案カード
```tsx
// Enhanced SuggestionCard with context
const EnhancedSuggestionCard: React.FC<{
  suggestion: Suggestion;
  context: ContextData;
}> = ({ suggestion, context }) => {
  const contextualTips = generateContextualTips(suggestion, context);
  
  return (
    <div className="suggestion-card">
      {/* 基本提案内容 */}
      
      {/* コンテキスト連携部分 */}
      <div className="context-enhancement">
        <h4>今の状況にぴったり</h4>
        {contextualTips.map(tip => (
          <div key={tip.id} className="context-tip">
            <span className="context-icon">{tip.icon}</span>
            <span>{tip.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 実装フェーズ

### Phase 1: 天候連携
- [x] OpenWeatherMap API統合 (weatherClient.ts実装完了)
- [x] 天候に基づく提案の条件分岐 (contextualPromptEnhancer.ts実装完了)
- [x] 雨/晴れ/雪による室内外活動の自動選択 (提案生成ロジックに統合)

### Phase 2: 季節連携  
- [x] 季節判定ロジック (seasonalClient.ts実装完了)
- [x] 祝日・行事データベース構築 (日本の祝日・季節イベント対応)
- [x] 季節に応じた提案バリエーション (季節ヒント生成機能実装)

### Phase 3: ニュース連携
- [ ] News API統合
- [ ] ニュースのセンチメント分析
- [ ] トピックに応じた気晴らし提案

### Phase 4: 統合・最適化
- [x] 全コンテキストの統合 (contextualPromptEnhancer.ts完了)
- [x] フロントエンド統合 (ContextDisplay.tsx、contextAPI.ts完了)
- [x] バックエンドAPI統合 (/api/v1/context エンドポイント実装)
- [ ] パフォーマンス最適化
- [ ] ユーザーフィードバック分析

## 期待される効果

### 1. 提案の関連性向上
- 現実の状況に即した実用的な提案
- 季節感のある豊かな体験
- 時事問題への適切な対応

### 2. ユーザーエンゲージメント向上
- 「今このタイミングで」という特別感
- 毎日変わるフレッシュな提案
- リピート利用の促進

### 3. 技術的優位性
- AI × リアルタイムデータの融合
- 競合アプリとの差別化
- 将来的なパーソナライゼーション基盤

## 実装上の考慮事項

### セキュリティ
- APIキーの適切な管理
- 位置情報の取扱い（最小限）
- ニュースデータのフィルタリング

### パフォーマンス
- 外部API呼び出しのキャッシュ戦略
- フォールバック機能（API障害時）
- レスポンス時間の最適化

### コスト管理
- 各API利用量の監視
- 必要最小限のデータ取得
- フリープランの有効活用

## 次期ステップ

1. **Phase 1開始**: 天候API統合から着手
2. **プロトタイプ作成**: 基本的な天候連携機能
3. **ユーザーテスト**: 実際の改善効果を測定
4. **段階的拡張**: 成功を確認しながら順次機能追加