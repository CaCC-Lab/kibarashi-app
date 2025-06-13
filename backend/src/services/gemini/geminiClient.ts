import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../../utils/logger';

class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async generateSuggestions(
    situation: 'workplace' | 'home' | 'outside',
    duration: number
  ): Promise<any[]> {
    try {
      const prompt = this.createPrompt(situation, duration);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // JSON形式のレスポンスをパース
      const suggestions = this.parseResponse(text, duration);
      logger.info('Gemini API response received', { 
        situation, 
        duration, 
        suggestionCount: suggestions.length 
      });
      
      return suggestions;
    } catch (error) {
      logger.error('Gemini API error', { error, situation, duration });
      throw error;
    }
  }

  private createPrompt(situation: string, duration: number): string {
    const situationMap = {
      workplace: '職場',
      home: '家',
      outside: '外出先'
    };

    return `あなたは職場のストレス解消法の専門家です。
以下の条件で、気晴らし方法を3つ提案してください。

条件：
- 場所: ${situationMap[situation as keyof typeof situationMap]}
- 時間: ${duration}分
- 対象: 20-40代の職場でストレスを抱える人

要件：
1. 具体的で実行可能な提案
2. ${duration}分間でちょうど完了できる内容にする
3. 認知的気晴らし（頭の中で行う）と行動的気晴らし（体を動かす）をバランスよく含める
4. 各提案には以下を含める：
   - タイトル（20文字以内）
   - 説明（100文字程度）
   - カテゴリ（"認知的" または "行動的"）
   - 具体的な手順（3-5ステップ）
   - ガイド（実行時の詳しい案内文、200文字程度）
   - duration（実行時間: ${duration}）

以下のJSON形式で回答してください：
[
  {
    "title": "提案のタイトル",
    "description": "提案の説明",
    "category": "認知的",
    "steps": ["ステップ1", "ステップ2", "ステップ3"],
    "guide": "この気晴らし方法の詳しい実行方法と注意点を説明する案内文",
    "duration": ${duration}
  }
]

JSON形式のみを返し、他の説明文は不要です。`;
  }

  private parseResponse(text: string, duration: number): any[] {
    try {
      // JSONの部分を抽出（前後の説明文を除去）
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const suggestions = JSON.parse(jsonMatch[0]);
      
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
  generateSuggestions: async (situation: 'workplace' | 'home' | 'outside', duration: number) => {
    if (!instance) {
      instance = new GeminiClient();
    }
    return instance.generateSuggestions(situation, duration);
  }
};