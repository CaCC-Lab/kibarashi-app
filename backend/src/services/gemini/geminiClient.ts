import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../../utils/logger';
import { EnhancedSuggestionGenerator } from '../suggestion/enhancedSuggestionGenerator';
import { createStudentPrompt, StudentPromptInput } from '../suggestion/studentPromptTemplates';
import { createJobSeekerPrompt, createCareerChangerPrompt, JobHuntingPromptInput } from '../suggestion/jobHuntingPromptTemplates';
import { generateImprovedPrompt } from './improvedPromptTemplate';

class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private enhancedGenerator: EnhancedSuggestionGenerator;
  private previousSuggestions: Map<string, string[]> = new Map();

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    this.enhancedGenerator = new EnhancedSuggestionGenerator();
  }

  async generateSuggestions(
    situation: string,
    duration: number,
    ageGroup?: string,
    studentContext?: Partial<StudentPromptInput>,
    jobHuntingContext?: Partial<JobHuntingPromptInput>
  ): Promise<any[]> {
    try {
      const prompt = this.createPrompt(situation, duration, ageGroup, studentContext, jobHuntingContext);
      
      // タイムアウト付きでGemini APIを呼び出し
      const timeoutMs = process.env.NODE_ENV === 'test' ? 3000 : 10000; // テスト環境では3秒、本番では10秒
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
        uniqueSuggestions: titles
      });
      
      return suggestions;
    } catch (error) {
      logger.error('Gemini API error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        situation, 
        duration,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
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
    try {
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
  generateSuggestions: async (situation: 'workplace' | 'home' | 'outside' | 'studying' | 'school' | 'commuting' | 'job_hunting', duration: number, ageGroup?: string, studentContext?: Partial<StudentPromptInput>, jobHuntingContext?: Partial<JobHuntingPromptInput>) => {
    if (!instance) {
      instance = new GeminiClient();
    }
    return instance.generateSuggestions(situation, duration, ageGroup, studentContext, jobHuntingContext);
  },
  
  generateEnhancedSuggestions: async (situation: 'workplace' | 'home' | 'outside', duration: number, ageGroup?: string) => {
    if (!instance) {
      instance = new GeminiClient();
    }
    return instance.generateEnhancedSuggestions(situation, duration, ageGroup);
  }
};