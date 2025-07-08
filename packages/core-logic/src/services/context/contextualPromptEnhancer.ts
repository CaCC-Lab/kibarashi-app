import { logger } from '../../utils/logger';
import { weatherClient, WeatherData } from '../external/weatherClient';
import { seasonalClient, SeasonalData } from '../external/seasonalClient';

export interface ContextualData {
  weather: WeatherData | null;
  seasonal: SeasonalData;
  timestamp: string;
}

export interface EnhancedPromptParams {
  situation: string;
  duration: number;
  context: ContextualData;
  userHistory?: string[];
}

class ContextualPromptEnhancer {
  /**
   * 現在のコンテキストデータを取得
   */
  async getCurrentContext(): Promise<ContextualData> {
    try {
      logger.info('Gathering contextual data for enhanced suggestions');

      // 並列でデータを取得
      const [weather, seasonal] = await Promise.all([
        weatherClient.getCurrentWeather('Tokyo').catch(error => {
          logger.warn('Weather data unavailable', { error: error.message });
          return null;
        }),
        Promise.resolve(seasonalClient.getCurrentSeasonalData())
      ]);

      const contextualData: ContextualData = {
        weather,
        seasonal,
        timestamp: new Date().toISOString()
      };

      logger.info('Contextual data gathered successfully', {
        hasWeatherData: !!weather,
        season: seasonal.season,
        month: seasonal.month,
        eventsCount: seasonal.seasonalEvents.length
      });

      return contextualData;

    } catch (error) {
      logger.error('Failed to gather contextual data', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // フォールバックとして最小限のコンテキストを返す
      return {
        weather: null,
        seasonal: seasonalClient.getCurrentSeasonalData(),
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * コンテキスト情報を含む強化されたプロンプトを生成
   */
  generateEnhancedPrompt(params: EnhancedPromptParams): string {
    const { situation, duration, context, userHistory = [] } = params;
    
    // 基本プロンプト部分
    const basePrompt = this.generateBasePrompt(situation, duration);
    
    // コンテキスト情報の追加
    const contextualEnhancement = this.generateContextualEnhancement(context);
    
    // ユーザー履歴の考慮
    const historyConsideration = this.generateHistoryConsideration(userHistory);
    
    // 提案生成指示
    const suggestionInstructions = this.generateSuggestionInstructions(context);

    const enhancedPrompt = `
${basePrompt}

${contextualEnhancement}

${historyConsideration}

${suggestionInstructions}

重要な指示:
1. 現在の天候と季節を最大限活用した、実用的で実現可能な提案をしてください
2. 今の時期ならではの特別感のある気晴らしを含めてください
3. ${duration}分という限られた時間内で完了できる活動に限定してください
4. 提案は具体的で、すぐに行動に移せる内容にしてください
5. 各提案には簡潔で魅力的なタイトルをつけてください
6. ユーザーの過去の提案履歴を考慮し、新鮮な提案を優先してください

出力形式:
以下のJSON形式で3つの提案を生成してください：

\`\`\`json
{
  "suggestions": [
    {
      "title": "魅力的なタイトル",
      "description": "具体的な実行方法の説明",
      "category": "認知的" または "行動的",
      "contextualReason": "なぜ今の状況に適しているかの説明",
      "duration": ${duration},
      "steps": ["ステップ1", "ステップ2", "ステップ3"]
    }
  ]
}
\`\`\`
`;

    logger.debug('Enhanced prompt generated', {
      promptLength: enhancedPrompt.length,
      hasWeatherData: !!context.weather,
      season: context.seasonal.season,
      situationType: situation
    });

    return enhancedPrompt.trim();
  }

  /**
   * 基本プロンプト部分を生成
   */
  private generateBasePrompt(situation: string, duration: number): string {
    return `
あなたは心理学とストレス管理の専門家です。
以下の条件で、創造的で効果的な気晴らし提案を3つ生成してください：

場所・状況: ${situation}
利用可能時間: ${duration}分
対象者: 20-40代の社会人（職場の人間関係等でストレスを抱えている）
`;
  }

  /**
   * コンテキスト情報による強化部分を生成
   */
  private generateContextualEnhancement(context: ContextualData): string {
    let enhancement = `\n現在のコンテキスト情報:`;
    
    // 天候情報
    if (context.weather) {
      enhancement += `
天候: ${context.weather.description} (${context.weather.condition})
気温: ${context.weather.temperature}°C
湿度: ${context.weather.humidity}%
`;

      // 天候に基づく具体的なヒント
      const weatherTips = weatherClient.generateWeatherBasedTips(context.weather);
      if (weatherTips.length > 0) {
        enhancement += `天候に適した活動のヒント: ${weatherTips.slice(0, 2).join('、')}`;
      }
    } else {
      enhancement += `\n天候: 情報取得できず（室内活動を中心に提案）`;
    }

    // 季節情報
    enhancement += `
季節: ${this.getSeasonText(context.seasonal.season)} (${context.seasonal.month}月)
`;

    // 季節のイベント・行事
    if (context.seasonal.seasonalEvents.length > 0) {
      enhancement += `今の時期の特徴: ${context.seasonal.seasonalEvents.join('、')}\n`;
    }

    // 祝日・特別な期間
    if (context.seasonal.holidays.length > 0) {
      enhancement += `祝日・記念日: ${context.seasonal.holidays.join('、')}\n`;
    }

    if (context.seasonal.specialPeriods.length > 0) {
      enhancement += `特別な期間: ${context.seasonal.specialPeriods.join('、')}\n`;
    }

    // 季節のヒント
    if (context.seasonal.seasonalTips.length > 0) {
      enhancement += `季節のおすすめ: ${context.seasonal.seasonalTips.slice(0, 3).join('、')}`;
    }

    return enhancement;
  }

  /**
   * ユーザー履歴の考慮部分を生成
   */
  private generateHistoryConsideration(userHistory: string[]): string {
    if (userHistory.length === 0) {
      return `\nユーザー履歴: 初回利用者のため、幅広いバリエーションで提案してください`;
    }

    return `
ユーザーの過去の提案履歴:
${userHistory.slice(-5).map((item, index) => `${index + 1}. ${item}`).join('\n')}

上記の履歴と重複しない、新鮮で多様な提案を心がけてください。
`;
  }

  /**
   * 提案生成指示部分を生成
   */
  private generateSuggestionInstructions(context: ContextualData): string {
    let instructions = `\n提案生成のガイドライン:`;

    // 天候に基づく指示
    if (context.weather) {
      switch (context.weather.condition) {
        case 'sunny':
          instructions += `\n• 明るい日差しを活用した気分向上の活動を含めてください`;
          if (context.weather.temperature > 20) {
            instructions += `\n• 暖かい気候を活かした外気に触れる活動も提案可能です`;
          }
          break;
        case 'rainy':
          instructions += `\n• 雨音や室内の落ち着いた環境を活かした静的な活動を中心に`;
          instructions += `\n• 温かい飲み物や心地よい香りなど、五感を使った提案を含めてください`;
          break;
        case 'cloudy':
          instructions += `\n• 落ち着いた照明環境を活かした集中型の活動を提案してください`;
          break;
        case 'snowy':
          instructions += `\n• 冬の特別感を活かした季節限定の体験を含めてください`;
          break;
      }
    }

    // 季節に基づく指示
    switch (context.seasonal.season) {
      case 'spring':
        instructions += `\n• 新しい始まりや成長のエネルギーを感じられる活動を含めてください`;
        break;
      case 'summer':
        instructions += `\n• 活動的でエネルギッシュな気晴らしと、涼しさを求める活動のバランスを`;
        break;
      case 'autumn':
        instructions += `\n• 落ち着きと内省、収穫の季節らしい充実感のある活動を`;
        break;
      case 'winter':
        instructions += `\n• 温かさと居心地の良さを重視した、心身を温める活動を`;
        break;
    }

    // 特別な期間の考慮
    if (context.seasonal.specialPeriods.length > 0) {
      instructions += `\n• ${context.seasonal.specialPeriods[0]}の特別感を活かした提案を1つは含めてください`;
    }

    return instructions;
  }

  /**
   * 季節の日本語名を取得
   */
  private getSeasonText(season: SeasonalData['season']): string {
    const seasonMap = {
      spring: '春',
      summer: '夏',
      autumn: '秋',
      winter: '冬'
    };
    return seasonMap[season];
  }

  /**
   * コンテキストデータの有効性を検証
   */
  validateContext(context: ContextualData): boolean {
    try {
      // 必須データの存在確認
      if (!context.seasonal || !context.timestamp) {
        return false;
      }

      // タイムスタンプの新しさ確認（1時間以内）
      const contextTime = new Date(context.timestamp);
      const now = new Date();
      const hoursDiff = (now.getTime() - contextTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff > 1) {
        logger.warn('Context data is stale', { hoursDiff });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Context validation failed', { error });
      return false;
    }
  }

  /**
   * コンテキストの変化を検出
   */
  hasContextChanged(oldContext: ContextualData, newContext: ContextualData): boolean {
    // 基本的な比較項目
    const weatherChanged = oldContext.weather?.condition !== newContext.weather?.condition ||
                          Math.abs((oldContext.weather?.temperature || 0) - (newContext.weather?.temperature || 0)) >= 3;
    
    const seasonChanged = oldContext.seasonal.season !== newContext.seasonal.season ||
                         oldContext.seasonal.month !== newContext.seasonal.month;

    const eventsChanged = oldContext.seasonal.seasonalEvents.length !== newContext.seasonal.seasonalEvents.length ||
                         oldContext.seasonal.holidays.length !== newContext.seasonal.holidays.length;

    return weatherChanged || seasonChanged || eventsChanged;
  }
}

// シングルトンインスタンス
let instance: ContextualPromptEnhancer | null = null;

export const contextualPromptEnhancer = {
  getCurrentContext: async () => {
    if (!instance) {
      instance = new ContextualPromptEnhancer();
    }
    return instance.getCurrentContext();
  },

  generateEnhancedPrompt: (params: EnhancedPromptParams) => {
    if (!instance) {
      instance = new ContextualPromptEnhancer();
    }
    return instance.generateEnhancedPrompt(params);
  },

  validateContext: (context: ContextualData) => {
    if (!instance) {
      instance = new ContextualPromptEnhancer();
    }
    return instance.validateContext(context);
  },

  hasContextChanged: (oldContext: ContextualData, newContext: ContextualData) => {
    if (!instance) {
      instance = new ContextualPromptEnhancer();
    }
    return instance.hasContextChanged(oldContext, newContext);
  }
};