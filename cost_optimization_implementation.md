# Gemini API コスト最適化・キャッシュ戦略実装

## 1. 現在のコスト分析

### API使用量の詳細分析

```typescript
interface CostAnalysis {
  // 現在の使用量（Phase 1）
  current: {
    dau: 1000;                    // 日次アクティブユーザー
    suggestionsPerUser: 5;        // ユーザー当たり提案数/日
    dailyApiCalls: 5000;          // 日次API呼び出し数
    monthlyApiCalls: 150000;      // 月次API呼び出し数
    avgTokensPerCall: {
      input: 600;                 // 入力トークン（プロンプト）
      output: 200;                // 出力トークン（回答）
    };
    monthlyTokens: {
      input: 90000000;            // 9千万トークン/月
      output: 30000000;           // 3千万トークン/月
    };
  };
  
  // Gemini 1.5 Flash料金（2025年7月時点）
  pricing: {
    inputTokens: 0.00025;         // $0.00025 per 1K tokens
    outputTokens: 0.00075;        // $0.00075 per 1K tokens
  };
  
  // 現在のコスト
  monthlyCost: {
    input: 22.5;                  // $90M * 0.00025/1000
    output: 22.5;                 // $30M * 0.00075/1000
    total: 45;                    // $45/月
  };
}
```

### 成長予測とスケーリング課題

```typescript
interface GrowthProjection {
  // 6ヶ月後の予測
  sixMonths: {
    dau: 10000;                   // 10倍成長
    monthlyApiCalls: 1500000;     // 1.5M回/月
    monthlyCost: 450;             // $450/月
  };
  
  // 1年後の予測  
  oneYear: {
    dau: 50000;                   // 50倍成長
    monthlyApiCalls: 7500000;     // 7.5M回/月
    monthlyCost: 2250;            // $2,250/月
  };
  
  // コスト問題のしきい値
  criticalThreshold: {
    monthlyCost: 500;             // $500/月を超えると対策必須
    responseTime: 2000;           // 2秒を超えると改善必須
  };
}
```

## 2. ハイブリッドキャッシュ戦略

### 3層キャッシュアーキテクチャ

```typescript
// services/cacheManager.ts
interface CacheLayer {
  name: string;
  ttl: number;                    // Time to Live (秒)
  capacity: number;               // 最大キャッシュ数
  hitRate: number;                // 期待ヒット率
}

export class HybridCacheManager {
  private layers: {
    memory: LRUCache<string, any>;        // L1: メモリキャッシュ
    redis: Redis;                         // L2: Redisキャッシュ
    database: any;                        // L3: 永続化キャッシュ
  };
  
  private layerConfig: CacheLayer[] = [
    { name: 'memory', ttl: 300, capacity: 100, hitRate: 0.3 },    // 5分
    { name: 'redis', ttl: 3600, capacity: 10000, hitRate: 0.4 },  // 1時間
    { name: 'database', ttl: 86400, capacity: 100000, hitRate: 0.2 } // 24時間
  ];

  constructor() {
    this.layers = {
      memory: new LRUCache({ max: 100, ttl: 300000 }),
      redis: new Redis(process.env.REDIS_URL),
      database: null // Phase 2で実装
    };
  }

  async get<T>(key: string): Promise<T | null> {
    // L1: メモリキャッシュチェック
    const memoryResult = this.layers.memory.get(key);
    if (memoryResult) {
      await this.recordHit('memory', key);
      return memoryResult as T;
    }

    // L2: Redisキャッシュチェック
    try {
      const redisResult = await this.layers.redis.get(key);
      if (redisResult) {
        const parsed = JSON.parse(redisResult) as T;
        
        // L1に昇格保存
        this.layers.memory.set(key, parsed);
        await this.recordHit('redis', key);
        
        return parsed;
      }
    } catch (error) {
      console.warn('Redis cache error:', error);
    }

    // L3: データベースキャッシュチェック（Phase 2）
    // if (this.layers.database) {
    //   const dbResult = await this.getFromDatabase(key);
    //   if (dbResult) {
    //     await this.promoteToRedis(key, dbResult);
    //     return dbResult;
    //   }
    // }

    await this.recordMiss(key);
    return null;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const effectiveTtl = ttl || 3600;

    // L1: メモリに保存
    this.layers.memory.set(key, value);

    // L2: Redisに保存
    try {
      await this.layers.redis.setex(
        key, 
        effectiveTtl, 
        JSON.stringify(value)
      );
    } catch (error) {
      console.warn('Redis cache set error:', error);
    }

    // L3: データベースに保存（長期間のみ）
    if (effectiveTtl > 3600 && this.layers.database) {
      await this.saveToDatabase(key, value, effectiveTtl);
    }
  }

  generateCacheKey(params: SuggestionParams): string {
    const {
      situation,
      duration,
      ageGroup = 'default',
      timestamp = null
    } = params;

    // タイムスタンプベースの時間窓（15分単位）
    const timeWindow = timestamp 
      ? Math.floor(timestamp / (15 * 60 * 1000)) * (15 * 60 * 1000)
      : Math.floor(Date.now() / (15 * 60 * 1000)) * (15 * 60 * 1000);

    const keyData = {
      situation,
      duration,
      ageGroup,
      timeWindow
    };

    return crypto
      .createHash('sha256')
      .update(JSON.stringify(keyData))
      .digest('hex')
      .substring(0, 16);
  }

  async getStats(): Promise<CacheStats> {
    return {
      hitRate: await this.calculateHitRate(),
      memoryUsage: this.layers.memory.size,
      redisUsage: await this.getRedisKeyCount(),
      costSavings: await this.calculateCostSavings()
    };
  }

  private async recordHit(layer: string, key: string): Promise<void> {
    const hitKey = `cache:hit:${layer}:${new Date().toISOString().split('T')[0]}`;
    await this.layers.redis.incr(hitKey);
    await this.layers.redis.expire(hitKey, 86400 * 7); // 7日保持
  }

  private async recordMiss(key: string): Promise<void> {
    const missKey = `cache:miss:${new Date().toISOString().split('T')[0]}`;
    await this.layers.redis.incr(missKey);
    await this.layers.redis.expire(missKey, 86400 * 7);
  }
}
```

### インテリジェント・キャッシュ戦略

```typescript
// services/intelligentCaching.ts
export class IntelligentCacheService {
  private cacheManager: HybridCacheManager;
  private popularityTracker: Map<string, number> = new Map();
  
  constructor(cacheManager: HybridCacheManager) {
    this.cacheManager = cacheManager;
    this.startPopularityTracking();
  }

  async getSuggestions(params: SuggestionParams): Promise<SuggestionResponse> {
    const cacheKey = this.cacheManager.generateCacheKey(params);
    
    // 1. キャッシュから取得試行
    const cached = await this.cacheManager.get<SuggestionResponse>(cacheKey);
    if (cached) {
      this.trackPopularity(cacheKey);
      return this.addCacheMetadata(cached, 'cached');
    }

    // 2. AI生成判定ロジック
    const shouldUseAI = await this.shouldGenerateWithAI(params, cacheKey);
    
    let result: SuggestionResponse;
    
    if (shouldUseAI) {
      // 3a. Gemini APIで生成
      result = await this.generateWithGemini(params);
      
      // 結果の品質チェック
      const qualityScore = await this.evaluateQuality(result);
      
      if (qualityScore >= 0.8) {
        // 高品質な結果のみキャッシュ
        const ttl = this.calculateOptimalTTL(params, qualityScore);
        await this.cacheManager.set(cacheKey, result, ttl);
      }
    } else {
      // 3b. フォールバックデータ使用
      result = await this.getFallbackSuggestions(params);
    }

    this.trackPopularity(cacheKey);
    return this.addCacheMetadata(result, shouldUseAI ? 'ai_generated' : 'fallback');
  }

  private async shouldGenerateWithAI(
    params: SuggestionParams, 
    cacheKey: string
  ): Promise<boolean> {
    // 1. 新規ユーザーは必ずAI生成
    if (params.isNewUser) return true;

    // 2. 過去のフィードバックが低評価の組み合わせ
    const historicalRating = await this.getHistoricalRating(params);
    if (historicalRating < 3.5) return true;

    // 3. 人気のない（キャッシュヒットが少ない）組み合わせ
    const popularity = this.popularityTracker.get(cacheKey) || 0;
    if (popularity < 5) return true;

    // 4. 現在のAPI使用量が予算内
    const currentUsage = await this.getCurrentAPIUsage();
    const monthlyBudget = parseFloat(process.env.MONTHLY_API_BUDGET || '100');
    if (currentUsage < monthlyBudget * 0.8) return true;

    // 5. ピーク時間外
    const currentHour = new Date().getHours();
    const isOffPeak = currentHour < 8 || currentHour > 22;
    if (isOffPeak) return true;

    // 6. 確率的な選択（20%の確率でAI生成）
    return Math.random() < 0.2;
  }

  private calculateOptimalTTL(
    params: SuggestionParams, 
    qualityScore: number
  ): number {
    const baseTTL = 3600; // 1時間
    
    // 品質スコアに基づく調整
    const qualityMultiplier = qualityScore >= 0.9 ? 2.0 : 
                             qualityScore >= 0.8 ? 1.5 : 1.0;
    
    // 人気度に基づく調整
    const cacheKey = this.cacheManager.generateCacheKey(params);
    const popularity = this.popularityTracker.get(cacheKey) || 0;
    const popularityMultiplier = popularity > 50 ? 2.0 :
                                popularity > 20 ? 1.5 : 1.0;
    
    // 年齢層による調整（学生は変化を好む）
    const ageGroupMultiplier = params.ageGroup === 'student' ? 0.5 :
                              params.ageGroup === 'elderly' ? 1.5 : 1.0;
    
    return Math.floor(baseTTL * qualityMultiplier * popularityMultiplier * ageGroupMultiplier);
  }

  private async evaluateQuality(result: SuggestionResponse): Promise<number> {
    // 簡易品質評価アルゴリズム
    let score = 0.5; // ベーススコア

    result.suggestions.forEach(suggestion => {
      // タイトルの多様性
      if (suggestion.title.length > 10 && suggestion.title.length < 30) score += 0.1;
      
      // 説明の適切さ
      if (suggestion.description.length > 50 && suggestion.description.length < 150) score += 0.1;
      
      // ステップ数の適切さ
      if (suggestion.steps && suggestion.steps.length >= 3 && suggestion.steps.length <= 5) score += 0.05;
      
      // 絵文字の使用（年齢層による）
      const emojiCount = (suggestion.title.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu) || []).length;
      if (emojiCount >= 1 && emojiCount <= 3) score += 0.05;
    });

    return Math.min(score, 1.0);
  }
}
```

## 3. コスト削減実装例

### プロンプト最適化

```typescript
// services/promptOptimization.ts
export class PromptOptimizationService {
  private optimizedTemplates = {
    // 現行版: ~600トークン
    verbose: `あなたは高校生・大学生（16-22歳）の気持ちに寄り添うAIカウンセラーです。
    勉強、友人関係、将来への不安など、学生特有のストレスを理解し、
    親しみやすく実践的なアドバイスを提供してください。
    [... 詳細な指示 ...]`,
    
    // 最適化版: ~300トークン（50%削減）
    optimized: `16-22歳学生向けAIとして、親しみやすく実践的な気晴らし提案。
    状況: {situation}, 時間: {duration}分
    要件: 絵文字適度使用、科学的根拠簡潔、{ageGroup}配慮
    JSON形式3提案返答。`,
    
    // 超最適化版: ~150トークン（75%削減）
    minimal: `{ageGroup}向け{duration}分気晴らし3つ、{situation}で実践可能、JSON形式`
  };

  generateOptimizedPrompt(
    params: SuggestionParams, 
    optimizationLevel: 'verbose' | 'optimized' | 'minimal' = 'optimized'
  ): string {
    const template = this.optimizedTemplates[optimizationLevel];
    
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] || match;
    });
  }

  async measureTokens(prompt: string): Promise<number> {
    // おおまかなトークン数計算（英語: 4文字/トークン、日本語: 2文字/トークン）
    const englishChars = prompt.match(/[a-zA-Z0-9\s.,!?]/g)?.length || 0;
    const japaneseChars = prompt.length - englishChars;
    
    return Math.ceil(englishChars / 4 + japaneseChars / 2);
  }

  async selectOptimalPrompt(params: SuggestionParams): Promise<string> {
    const currentBudgetUsage = await this.getCurrentBudgetUsage();
    const urgencyLevel = this.assessUrgency(params);
    
    // 予算使用率に基づく最適化レベル選択
    if (currentBudgetUsage > 0.8) return this.generateOptimizedPrompt(params, 'minimal');
    if (currentBudgetUsage > 0.6) return this.generateOptimizedPrompt(params, 'optimized');
    if (urgencyLevel === 'high') return this.generateOptimizedPrompt(params, 'verbose');
    
    return this.generateOptimizedPrompt(params, 'optimized');
  }
}
```

### バッチ処理によるAPI効率化

```typescript
// services/batchProcessor.ts
export class BatchAPIProcessor {
  private batchQueue: SuggestionRequest[] = [];
  private batchSize = 5;
  private batchTimeout = 2000; // 2秒
  private processingTimer: NodeJS.Timeout | null = null;

  async queueRequest(
    params: SuggestionParams
  ): Promise<SuggestionResponse> {
    return new Promise((resolve, reject) => {
      const request: SuggestionRequest = {
        id: crypto.randomUUID(),
        params,
        resolve,
        reject,
        timestamp: Date.now()
      };

      this.batchQueue.push(request);

      // バッチサイズに達したら即座に処理
      if (this.batchQueue.length >= this.batchSize) {
        this.processBatch();
      } else if (!this.processingTimer) {
        // タイムアウト後に処理
        this.processingTimer = setTimeout(() => {
          this.processBatch();
        }, this.batchTimeout);
      }
    });
  }

  private async processBatch(): Promise<void> {
    if (this.batchQueue.length === 0) return;

    const batch = this.batchQueue.splice(0, this.batchSize);
    
    if (this.processingTimer) {
      clearTimeout(this.processingTimer);
      this.processingTimer = null;
    }

    try {
      // 類似リクエストをグループ化
      const groupedRequests = this.groupSimilarRequests(batch);
      
      // 各グループを並列処理
      await Promise.all(
        Object.entries(groupedRequests).map(([key, requests]) =>
          this.processGroup(key, requests)
        )
      );

    } catch (error) {
      // エラー時は個別にフォールバック処理
      batch.forEach(request => {
        this.fallbackIndividualProcess(request);
      });
    }
  }

  private groupSimilarRequests(
    batch: SuggestionRequest[]
  ): Record<string, SuggestionRequest[]> {
    const groups: Record<string, SuggestionRequest[]> = {};

    batch.forEach(request => {
      const groupKey = `${request.params.situation}_${request.params.duration}_${request.params.ageGroup}`;
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(request);
    });

    return groups;
  }

  private async processGroup(
    groupKey: string,
    requests: SuggestionRequest[]
  ): Promise<void> {
    // グループの代表リクエストでAPI呼び出し
    const representativeRequest = requests[0];
    
    try {
      const result = await this.callGeminiAPI(representativeRequest.params);
      
      // バリエーション生成
      const variations = await this.generateVariations(result, requests.length);
      
      // 各リクエストに結果を配布
      requests.forEach((request, index) => {
        const variation = variations[index] || result;
        request.resolve(variation);
      });

    } catch (error) {
      requests.forEach(request => {
        request.reject(error);
      });
    }
  }

  private async generateVariations(
    baseResult: SuggestionResponse,
    count: number
  ): Promise<SuggestionResponse[]> {
    if (count === 1) return [baseResult];

    const variations: SuggestionResponse[] = [baseResult];

    // ベース結果から順序入れ替えや軽微な変更でバリエーション作成
    for (let i = 1; i < count; i++) {
      const variation = {
        ...baseResult,
        suggestions: this.shuffleArray([...baseResult.suggestions])
      };
      
      // 微細な変更を加える
      variation.suggestions = variation.suggestions.map(suggestion => ({
        ...suggestion,
        id: crypto.randomUUID() // 新しいIDを生成
      }));

      variations.push(variation);
    }

    return variations;
  }
}
```

## 4. 動的料金制御システム

```typescript
// services/costController.ts
export class DynamicCostController {
  private monthlyBudget: number;
  private currentUsage: number = 0;
  private alertThresholds = [0.5, 0.75, 0.9]; // 50%, 75%, 90%

  constructor() {
    this.monthlyBudget = parseFloat(process.env.MONTHLY_API_BUDGET || '100');
    this.initializeMonthlyTracking();
  }

  async checkBudgetStatus(): Promise<BudgetStatus> {
    const usage = await this.getCurrentUsage();
    const percentage = usage / this.monthlyBudget;
    
    const status: BudgetStatus = {
      budgetAmount: this.monthlyBudget,
      currentUsage: usage,
      usagePercentage: percentage,
      remainingBudget: this.monthlyBudget - usage,
      recommendedAction: this.getRecommendedAction(percentage),
      estimatedMonthEnd: this.estimateMonthEndUsage(usage)
    };

    // アラート発火
    await this.checkAndSendAlerts(status);

    return status;
  }

  private getRecommendedAction(usagePercentage: number): string {
    if (usagePercentage >= 0.9) {
      return 'EMERGENCY: Switch to fallback-only mode';
    } else if (usagePercentage >= 0.75) {
      return 'WARNING: Reduce AI usage to 10%';
    } else if (usagePercentage >= 0.5) {
      return 'CAUTION: Increase cache hit rate to 80%';
    } else {
      return 'NORMAL: Continue current usage pattern';
    }
  }

  async getAPIUsagePermission(
    params: SuggestionParams
  ): Promise<{ allowed: boolean; reason: string; alternative?: string }> {
    const budgetStatus = await this.checkBudgetStatus();
    
    // 緊急時は AI使用禁止
    if (budgetStatus.usagePercentage >= 0.95) {
      return {
        allowed: false,
        reason: 'Monthly budget exceeded',
        alternative: 'fallback_only'
      };
    }

    // 高使用率時は制限付き許可
    if (budgetStatus.usagePercentage >= 0.8) {
      // VIPユーザーまたは新規ユーザーのみ許可
      if (params.isVIPUser || params.isNewUser) {
        return { allowed: true, reason: 'Priority user' };
      }
      
      return {
        allowed: false,
        reason: 'Budget conservation mode',
        alternative: 'cached_or_fallback'
      };
    }

    // 通常時は確率的制御
    const allowanceRate = this.calculateAllowanceRate(budgetStatus.usagePercentage);
    const allowed = Math.random() < allowanceRate;

    return {
      allowed,
      reason: allowed ? 'Within budget limits' : 'Random throttling',
      alternative: allowed ? undefined : 'intelligent_fallback'
    };
  }

  private calculateAllowanceRate(usagePercentage: number): number {
    // 使用率に応じて確率的に制御
    if (usagePercentage < 0.5) return 1.0;     // 100%許可
    if (usagePercentage < 0.6) return 0.8;     // 80%許可  
    if (usagePercentage < 0.7) return 0.6;     // 60%許可
    if (usagePercentage < 0.8) return 0.4;     // 40%許可
    return 0.2;                                // 20%許可
  }

  async recordAPIUsage(cost: number, tokens: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    
    // Redis に使用量を記録
    await redis.hincrby(`api_usage:${today}`, 'cost', Math.round(cost * 1000));
    await redis.hincrby(`api_usage:${today}`, 'tokens', tokens);
    await redis.expire(`api_usage:${today}`, 86400 * 32); // 32日保持
    
    this.currentUsage += cost;
  }
}
```

## 5. パフォーマンス監視ダッシュボード

```typescript
// services/performanceMonitor.ts
export class PerformanceMonitor {
  async generateDashboardData(): Promise<DashboardData> {
    const [
      cacheStats,
      costStats,
      apiStats,
      userEngagement
    ] = await Promise.all([
      this.getCacheStatistics(),
      this.getCostStatistics(),
      this.getAPIStatistics(),
      this.getUserEngagementStats()
    ]);

    return {
      cache: cacheStats,
      cost: costStats,
      api: apiStats,
      engagement: userEngagement,
      recommendations: this.generateRecommendations(cacheStats, costStats, apiStats)
    };
  }

  private async getCacheStatistics(): Promise<CacheStatistics> {
    const today = new Date().toISOString().split('T')[0];
    
    const [hits, misses] = await Promise.all([
      redis.get(`cache:hit:memory:${today}`) || 0,
      redis.get(`cache:miss:${today}`) || 0
    ]);

    const totalRequests = parseInt(hits) + parseInt(misses);
    const hitRate = totalRequests > 0 ? parseInt(hits) / totalRequests : 0;

    return {
      hitRate: hitRate,
      memoryUsage: await this.getMemoryCacheUsage(),
      redisUsage: await this.getRedisCacheUsage(),
      dailyHits: parseInt(hits),
      dailyMisses: parseInt(misses),
      costSavings: hitRate * 150 * 0.00075 // 150 tokens * $0.00075
    };
  }

  private generateRecommendations(
    cache: CacheStatistics,
    cost: CostStatistics,
    api: APIStatistics
  ): string[] {
    const recommendations: string[] = [];

    if (cache.hitRate < 0.6) {
      recommendations.push('キャッシュヒット率が60%未満です。TTLの延長を検討してください。');
    }

    if (cost.monthlyProjection > cost.budget * 0.9) {
      recommendations.push('月末予算超過の可能性があります。AI使用率を削減してください。');
    }

    if (api.averageResponseTime > 1500) {
      recommendations.push('API応答時間が1.5秒を超えています。最適化が必要です。');
    }

    if (recommendations.length === 0) {
      recommendations.push('全ての指標が良好です。現在の戦略を継続してください。');
    }

    return recommendations;
  }
}
```

## 6. 最適化の期待効果

### コスト削減シミュレーション

| 施策 | 削減率 | 月額コスト | 年間削減額 |
|------|--------|------------|------------|
| **現在のベースライン** | - | $45 | - |
| プロンプト最適化（50%短縮） | 25% | $34 | $132 |
| キャッシュ導入（60%ヒット率） | 60% | $18 | $324 |
| バッチ処理（効率化） | 15% | $15 | $360 |
| 動的制御（ピーク制限） | 10% | $14 | $372 |
| **最終最適化後** | **69%** | **$14** | **$372/年** |

### スケーラビリティ向上効果

```typescript
interface ScalabilityImpact {
  // 現在（最適化前）
  before: {
    supportableDAU: 1000;
    costPerUser: 0.045;      // $0.045/ユーザー/月
    responseTime: 800;       // 800ms
  };
  
  // 最適化後  
  after: {
    supportableDAU: 7000;    // 7倍のスケーラビリティ
    costPerUser: 0.002;      // $0.002/ユーザー/月（95%削減）
    responseTime: 400;       // 400ms（50%改善）
  };
  
  // 1年後の効果
  oneYearProjection: {
    userGrowth: '50,000 DAU対応可能';
    costSavings: '$2,000/月の削減';
    performanceGain: '2倍の応答速度';
  };
}
```

この最適化戦略により、API使用コストを大幅に削減しながら、より多くのユーザーに高品質なサービスを提供できるようになります。特に年齢層別展開時の大量トラフィック処理において、コスト効率性が重要な差別化要因となります。