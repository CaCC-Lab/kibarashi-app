import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../../utils/logger';
import { EnhancedSuggestionGenerator } from '../suggestion/enhancedSuggestionGenerator';
import { createStudentPrompt, StudentPromptInput } from '../suggestion/studentPromptTemplates';
import { createJobSeekerPrompt, createCareerChangerPrompt, JobHuntingPromptInput } from '../suggestion/jobHuntingPromptTemplates';
import { generateImprovedPrompt } from './improvedPromptTemplate';
import { contextualPromptEnhancer } from '../context/contextualPromptEnhancer';
import { apiKeyManager } from './apiKeyManager';

class GeminiClient {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private enhancedGenerator: EnhancedSuggestionGenerator;
  private previousSuggestions: Map<string, string[]> = new Map();
  private currentApiKey: string | null = null;

  constructor() {
    this.enhancedGenerator = new EnhancedSuggestionGenerator();
    this.initializeClient();
  }

  /**
   * APIクライアントを初期化
   */
  private initializeClient(): void {
    try {
      this.currentApiKey = apiKeyManager.getCurrentApiKey();
      this.genAI = new GoogleGenerativeAI(this.currentApiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      logger.info('Gemini client initialized with API key manager');
    } catch (error) {
      logger.error('Failed to initialize Gemini client', { error });
      throw error;
    }
  }

  /**
   * APIキーをローテーションして新しいクライアントを作成
   */
  private rotateApiKeyAndReinitialize(): void {
    try {
      const newApiKey = apiKeyManager.forceRotation();
      if (newApiKey === this.currentApiKey) {
        throw new Error('No alternative API key available');
      }

      this.currentApiKey = newApiKey;
      this.genAI = new GoogleGenerativeAI(newApiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      logger.info('API key rotated and client reinitialized');
    } catch (error) {
      logger.error('Failed to rotate API key', { error });
      throw error;
    }
  }

  /**
   * 提案生成パラメータのバリデーション
   */
  private validateSuggestionParameters(situation: string, duration: number): void {
    // situationの有効性チェック
    const validSituations = ['workplace', 'home', 'outside', 'studying', 'school', 'commuting', 'job_hunting'];
    if (!validSituations.includes(situation)) {
      throw new Error(`Invalid situation: ${situation}. Valid values are: ${validSituations.join(', ')}`);
    }

    // durationの有効性チェック
    if (typeof duration !== 'number' || isNaN(duration)) {
      throw new Error(`Duration must be a valid number, got: ${duration}`);
    }
    
    if (duration <= 0) {
      throw new Error(`Duration must be greater than 0, got: ${duration}`);
    }
    
    if (duration > 120) {
      throw new Error(`Duration must be 120 minutes or less, got: ${duration}`);
    }
  }

  async generateSuggestions(
    situation: string,
    duration: number,
    ageGroup?: string,
    studentContext?: Partial<StudentPromptInput>,
    jobHuntingContext?: Partial<JobHuntingPromptInput>,
    useContextualEnhancement: boolean = true
  ): Promise<any[]> {
    // パラメータバリデーション（テスト環境でも実行）
    this.validateSuggestionParameters(situation, duration);
    
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        let prompt: string;

        // コンテキスト連携が有効な場合は強化されたプロンプトを使用
        if (useContextualEnhancement && !studentContext && !jobHuntingContext) {
          try {
            logger.info('Using contextual prompt enhancement');
            const context = await contextualPromptEnhancer.getCurrentContext();
            const userHistory = this.previousSuggestions.get(`${situation}-${duration}-${ageGroup || 'default'}`) || [];
            
            prompt = contextualPromptEnhancer.generateEnhancedPrompt({
              situation,
              duration,
              context,
              userHistory
            });
            
            logger.info('Contextual prompt generated successfully', {
              hasWeatherData: !!context.weather,
              season: context.seasonal.season,
              historyCount: userHistory.length
            });
          } catch (contextError) {
            logger.warn('Failed to generate contextual prompt, falling back to standard prompt', {
              error: contextError instanceof Error ? contextError.message : 'Unknown error'
            });
            prompt = this.createPrompt(situation, duration, ageGroup, studentContext, jobHuntingContext);
          }
        } else {
          prompt = this.createPrompt(situation, duration, ageGroup, studentContext, jobHuntingContext);
        }
        
        // APIリクエスト実行（キーローテーション対応）
        const suggestions = await this.executeApiRequest(prompt, situation, duration, ageGroup);
        
        // 成功をAPIキーマネージャーに報告
        if (this.currentApiKey) {
          apiKeyManager.markKeyAsSuccess(this.currentApiKey);
        }
        
        return suggestions;

      } catch (error) {
        lastError = error as Error;
        
        logger.error(`Gemini API error (attempt ${attempt}/${maxRetries})`, { 
          error: lastError.message,
          situation, 
          duration,
          attempt
        });

        // APIキーマネージャーに失敗を報告
        if (this.currentApiKey) {
          const isRateLimit = this.isRateLimitError(lastError);
          apiKeyManager.markKeyAsFailure(this.currentApiKey, isRateLimit);
        }

        // 最後の試行でない場合、キーローテーションを試す
        if (attempt < maxRetries) {
          try {
            // 利用可能なキーがあるかチェック
            if (apiKeyManager.getAvailableKeyCount() > 0) {
              logger.info('Attempting to rotate API key and retry');
              this.rotateApiKeyAndReinitialize();
              
              // 短い待機時間を設けてから再試行
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            } else {
              logger.warn('No available API keys for rotation');
            }
          } catch (rotationError) {
            logger.error('Failed to rotate API key', { error: rotationError });
          }
        }
      }
    }

    // 全ての試行が失敗した場合
    throw lastError || new Error('All retry attempts failed');
  }

  /**
   * APIリクエストを実行
   */
  private async executeApiRequest(
    prompt: string,
    situation: string,
    duration: number,
    ageGroup?: string
  ): Promise<any[]> {
    // テスト環境では実際のAPIを呼ばずにモックレスポンスを返す
    if (process.env.NODE_ENV === 'test') {
      logger.debug('Test environment detected, returning mock response');
      
      // テスト用のモックレスポンス
      const mockSuggestions = [
        {
          title: `テスト用提案1 - ${situation}`,
          description: `${duration}分間の気晴らし活動です。`,
          category: '認知的',
          steps: ['ステップ1', 'ステップ2', 'ステップ3']
        },
        {
          title: `テスト用提案2 - ${situation}`,
          description: `${duration}分間の別の活動です。`,
          category: '行動的',
          steps: ['ステップA', 'ステップB', 'ステップC']
        },
        {
          title: `テスト用提案3 - ${situation}`,
          description: `${duration}分間のリラックス活動です。`,
          category: '認知的',
          steps: ['ステップX', 'ステップY', 'ステップZ']
        }
      ];
      
      // 各提案にIDと時間を追加
      const suggestions = mockSuggestions.map((suggestion: any, index: number) => ({
        id: `test-mock-${Date.now()}-${index}`,
        ...suggestion,
        duration: duration
      }));
      
      // 短い遅延を入れて実際のAPI呼び出しを模擬
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return suggestions;
    }
    
    // 本番環境・開発環境では実際のAPIを呼び出し
    const timeoutMs = 10000;
    const apiCall = this.model.generateContent(prompt);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Gemini API timeout after ${timeoutMs}ms`));
      }, timeoutMs);
    });
    
    const result = await Promise.race([apiCall, timeoutPromise]);
    const response = await result.response;
    const text = response.text();
    
    // JSON形式のレスポンスをパース
    const suggestions = this.parseResponse(text, duration);
    
    // 提案履歴を保存（最新20件まで）
    const key = `${situation}-${duration}-${ageGroup || 'default'}`;
    const history = this.previousSuggestions.get(key) || [];
    const titles = suggestions.map(s => s.title);
    history.push(...titles);
    
    // 最新20件のみ保持
    if (history.length > 20) {
      this.previousSuggestions.set(key, history.slice(-20));
    } else {
      this.previousSuggestions.set(key, history);
    }
    
    logger.info('Gemini API response received', { 
      situation, 
      duration, 
      suggestionCount: suggestions.length,
      responseTime: `< ${timeoutMs}ms`,
      uniqueSuggestions: titles,
      apiKeyIndex: this.getCurrentApiKeyIndex()
    });
    
    return suggestions;
  }

  /**
   * レート制限エラーかどうかを判定
   */
  private isRateLimitError(error: Error): boolean {
    const message = error.message.toLowerCase();
    return message.includes('rate limit') || 
           message.includes('quota') || 
           message.includes('429') ||
           message.includes('resource has been exhausted');
  }

  /**
   * 現在のAPIキーのインデックスを取得
   */
  private getCurrentApiKeyIndex(): number | null {
    if (!this.currentApiKey) return null;
    const stats = apiKeyManager.getStats();
    const keyDetail = stats.keyDetails.find(k => 
      stats.keyDetails[k.index] && 
      !k.isOnCooldown
    );
    return keyDetail?.index || null;
  }

  private createPrompt(situation: string, duration: number, ageGroup: string = 'office_worker', studentContext?: Partial<StudentPromptInput>, jobHuntingContext?: Partial<JobHuntingPromptInput>): string {
    // 学生の場合、詳細なプロンプト生成を使用
    if (ageGroup === 'student' && studentContext) {
      const studentInput: StudentPromptInput = {
        concern: studentContext.concern || '',
        subject: studentContext.subject || '',
        time: duration,
        situation: situation as any,
        stressFactor: studentContext.stressFactor
      };
      
      // 学生向けシナリオのマッピング
      const studentSituationMap: Record<string, 'studying' | 'school' | 'commuting' | 'beforeExam'> = {
        studying: 'studying',
        school: 'school',
        commuting: 'commuting',
        beforeExam: 'beforeExam',
        // 既存の状況を学生向けにマッピング
        workplace: 'studying',
        home: 'studying',
        outside: 'school'
      };
      
      studentInput.situation = studentSituationMap[situation] || 'studying';
      
      return createStudentPrompt(studentInput);
    }
    
    // 就活生の場合、専用のプロンプト生成を使用
    if (ageGroup === 'job_seeker' && jobHuntingContext) {
      const jobSeekerInput: JobHuntingPromptInput = {
        activityType: 'job_seeking',
        currentPhase: jobHuntingContext.currentPhase,
        concern: jobHuntingContext.concern || '',
        time: duration,
        situation: situation as any,
        stressFactor: jobHuntingContext.stressFactor,
        activityDuration: jobHuntingContext.activityDuration
      };
      
      return createJobSeekerPrompt(jobSeekerInput);
    }
    
    // 転職活動者の場合、専用のプロンプト生成を使用
    if (ageGroup === 'career_changer' && jobHuntingContext) {
      const careerChangerInput: JobHuntingPromptInput = {
        activityType: 'career_change',
        currentPhase: jobHuntingContext.currentPhase,
        concern: jobHuntingContext.concern || '',
        time: duration,
        situation: situation as any,
        stressFactor: jobHuntingContext.stressFactor,
        activityDuration: jobHuntingContext.activityDuration
      };
      
      return createCareerChangerPrompt(careerChangerInput);
    }
    
    // バリエーション豊かな提案のために改善されたプロンプトを使用
    const key = `${situation}-${duration}-${ageGroup}`;
    const previousSuggestions = this.previousSuggestions.get(key) || [];
    
    // 改善されたプロンプト生成機能を使用
    const improvedPrompt = generateImprovedPrompt(
      situation,
      duration,
      ageGroup,
      previousSuggestions
    );
    
    return improvedPrompt;
  }


  /**
   * 拡張提案を生成（音声ガイド対応）
   */
  async generateEnhancedSuggestions(
    situation: string,
    duration: number,
    ageGroup?: string
  ): Promise<any[]> {
    // パラメータバリデーション（テスト環境でも実行）
    this.validateSuggestionParameters(situation, duration);
    
    try {
      // テスト環境では実際のAPIを呼ばずにモックレスポンスを返す
      if (process.env.NODE_ENV === 'test') {
        logger.debug('Test environment detected, returning mock enhanced response');
        
        const mockEnhanced = {
          title: `拡張テスト提案 - ${situation}`,
          description: `${duration}分間の詳細な気晴らし活動です。`,
          category: '認知的',
          steps: ['準備', '実行', '完了'],
          detailedSteps: [
            { step: 1, instruction: 'まず深呼吸をします', duration: 30 },
            { step: 2, instruction: 'リラックスした姿勢を取ります', duration: 60 },
            { step: 3, instruction: 'ゆっくりと活動を終了します', duration: 30 }
          ],
          breathingInstructions: {
            pattern: 'basic',
            inhaleSeconds: 4,
            holdSeconds: 4,
            exhaleSeconds: 6
          },
          voiceGuide: {
            enabled: true,
            script: `${duration}分間の気晴らし活動を開始します。`
          }
        };
        
        const enhancedSuggestion = this.enhancedGenerator.convertToEnhancedSuggestion(
          JSON.stringify(mockEnhanced),
          `test-enhanced-${Date.now()}`,
          duration
        );
        
        // 短い遅延を入れて実際のAPI呼び出しを模擬
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return [enhancedSuggestion];
      }
      
      const prompt = this.enhancedGenerator.generateEnhancedPrompt(situation, duration, ageGroup);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // 拡張提案の配列を生成
      const enhancedSuggestions = this.parseEnhancedResponse(text, duration);
      
      logger.info('Gemini API enhanced response received', { 
        situation, 
        duration,
        ageGroup,
        suggestionCount: enhancedSuggestions.length 
      });
      
      return enhancedSuggestions;
    } catch (error) {
      logger.error('Gemini API enhanced generation error', { error, situation, duration, ageGroup });
      throw error;
    }
  }

  private parseEnhancedResponse(text: string, duration: number): any[] {
    try {
      // 複数のJSON形式に対応
      let jsonText = text.trim();
      
      // ```json ... ``` または ``` ... ``` の形式を処理
      const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1].trim();
      }
      
      // Geminiレスポンスからクリーンなデータを抽出
      let parsedData;
      
      // シングルオブジェクトの場合（新形式）
      if (jsonText.startsWith('{')) {
        parsedData = JSON.parse(jsonText);
        
        // 単一の拡張提案を配列に変換
        const enhancedSuggestion = this.enhancedGenerator.convertToEnhancedSuggestion(
          JSON.stringify(parsedData),
          `enhanced-${Date.now()}`,
          duration
        );
        return [enhancedSuggestion];
      }
      
      // 従来の配列形式
      const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      let cleanJson = jsonMatch[0];
      cleanJson = cleanJson.replace(/,(\s*[}\]])/g, '$1');
      
      const rawSuggestions = JSON.parse(cleanJson);
      
      if (!Array.isArray(rawSuggestions) || rawSuggestions.length === 0) {
        throw new Error('Invalid enhanced response format');
      }

      // 各提案を拡張形式に変換
      return rawSuggestions.map((suggestion: any, index: number) => {
        const id = `enhanced-${Date.now()}-${index}`;
        
        // 従来形式の場合は拡張形式に変換
        if (!suggestion.detailedSteps || !suggestion.breathingInstructions) {
          return this.enhancedGenerator.convertToEnhancedSuggestion(
            JSON.stringify(suggestion),
            id,
            duration
          );
        }
        
        // 既に拡張形式の場合はそのまま変換
        return this.enhancedGenerator.convertToEnhancedSuggestion(
          JSON.stringify(suggestion),
          id,
          duration
        );
      });
      
    } catch (error) {
      logger.error('Failed to parse enhanced Gemini response', { error, text });
      throw new Error('Failed to parse AI enhanced response');
    }
  }

  private parseResponse(text: string, duration: number): any[] {
    try {
      // Markdownコードブロックを除去
      let jsonText = text;
      
      // ```json ... ``` または ``` ... ``` の形式を処理
      const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1];
      }
      
      // JSONの配列部分を抽出
      const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      // 不正なJSONを修正（末尾のカンマを除去）
      let cleanJson = jsonMatch[0];
      // 配列やオブジェクトの末尾のカンマを除去
      cleanJson = cleanJson.replace(/,(\s*[}\]])/g, '$1');
      // 空白や改行を正規化
      cleanJson = cleanJson.replace(/\n\s*\n/g, '\n');

      const suggestions = JSON.parse(cleanJson);
      
      // バリデーション
      if (!Array.isArray(suggestions) || suggestions.length === 0) {
        throw new Error('Invalid response format');
      }

      // 各提案にIDと時間を追加
      return suggestions.map((suggestion: any, index: number) => ({
        id: `gemini-${Date.now()}-${index}`,
        ...suggestion,
        duration: suggestion.duration || duration // パラメータからdurationを取得
      }));
    } catch (error) {
      logger.error('Failed to parse Gemini response', { error, text });
      throw new Error('Failed to parse AI response');
    }
  }
}

// シングルトンインスタンスは初回アクセス時に作成
let instance: GeminiClient | null = null;

export const geminiClient = {
  generateSuggestions: async (situation: 'workplace' | 'home' | 'outside' | 'studying' | 'school' | 'commuting' | 'job_hunting', duration: number, ageGroup?: string, studentContext?: Partial<StudentPromptInput>, jobHuntingContext?: Partial<JobHuntingPromptInput>, useContextualEnhancement?: boolean) => {
    if (!instance) {
      instance = new GeminiClient();
    }
    return instance.generateSuggestions(situation, duration, ageGroup, studentContext, jobHuntingContext, useContextualEnhancement);
  },
  
  generateEnhancedSuggestions: async (situation: 'workplace' | 'home' | 'outside', duration: number, ageGroup?: string) => {
    if (!instance) {
      instance = new GeminiClient();
    }
    return instance.generateEnhancedSuggestions(situation, duration, ageGroup);
  }
};