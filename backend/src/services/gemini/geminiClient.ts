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

    // 前回の提案を記憶するための時間ベースのシード
    const timeSeed = new Date().toISOString().slice(0, 16); // 分単位で変化

    return `あなたは職場のストレス解消法の専門家です。
以下の条件で、気晴らし方法を3つ提案してください。

条件：
- 場所: ${situationMap[situation as keyof typeof situationMap]}
- 時間: ${duration}分
- 対象: 20-40代の職場でストレスを抱える人
- 現在時刻: ${timeSeed}

要件：
1. 具体的で実行可能な提案
2. ${duration}分間でちょうど完了できる内容にする
3. 認知的気晴らし（頭の中で行う）と行動的気晴らし（体を動かす）をバランスよく含める
4. **重要**: 毎回異なる提案をすること。一般的すぎる提案（深呼吸、ストレッチ、散歩など）は避け、創造的で具体的な提案を心がける
5. 各提案には以下を含める：
   - タイトル（20文字以内、具体的で魅力的なもの）
   - 説明（100文字程度、実際の効果や気分の変化を含める）
   - カテゴリ（"認知的" または "行動的"）
   - 具体的な手順（3-5ステップ、実行しやすい詳細な説明）
   - ガイド（実行時の詳しい案内文、200文字程度、励ましの言葉も含める）
   - duration（実行時間: ${duration}）

既に提案したものと重複しないよう、以下のような多様な観点から考えてください：
- 五感を使った気晴らし（視覚、聴覚、触覚、嗅覚、味覚）
- 創造的な活動（描く、書く、作る、想像する）
- 身体的な活動（姿勢、動作、リズム、バランス）
- 認知的な活動（記憶、計算、パズル、言語）
- 社会的な活動（連絡、共有、感謝、つながり）
- 自然との関わり（観察、感じる、育てる）

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

重要: コードブロック記法(\\\`\\\`\\\`)を使わず、純粋なJSON配列のみを返してください。説明文や余計な文字を含めないでください。`;
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
  generateSuggestions: async (situation: 'workplace' | 'home' | 'outside', duration: number) => {
    if (!instance) {
      instance = new GeminiClient();
    }
    return instance.generateSuggestions(situation, duration);
  }
};