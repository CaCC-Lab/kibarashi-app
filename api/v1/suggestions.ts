import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { fallbackSuggestions } from './fallbackData';

// バリデーションスキーマ
const suggestionsQuerySchema = z.object({
  situation: z.enum(['workplace', 'home', 'outside']),
  duration: z.enum(['5', '15', '30']).transform(Number),
});

// Geminiクライアントの初期化
let geminiClient: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('Initializing Gemini client, API key present:', !!apiKey);
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set in environment variables');
      throw new Error('GEMINI_API_KEY is required');
    }
    geminiClient = new GoogleGenerativeAI(apiKey);
  }
  return geminiClient;
}

// 気晴らし提案生成
async function generateSuggestions(situation: string, duration: number) {
  console.log(`Generating suggestions for situation: ${situation}, duration: ${duration}`);
  
  try {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('Gemini model initialized successfully');

  const situationMap = {
    workplace: '職場',
    home: '家',
    outside: '外出先'
  };

  const prompt = `
あなたは心理カウンセラーです。以下の条件で、ストレス解消のための気晴らし方法を提案してください。

条件:
- 場所: ${situationMap[situation as keyof typeof situationMap]}
- 時間: ${duration}分
- 対象: 職場の人間関係でストレスを抱える20-40代

要求:
1. 3つの異なる気晴らし方法を提案
2. 各提案は以下のJSON形式で出力
3. 認知的気晴らし（頭の中で行う）と行動的気晴らし（具体的な行動）を組み合わせる

出力形式:
{
  "suggestions": [
    {
      "id": "unique_id",
      "title": "提案のタイトル（20文字以内）",
      "description": "具体的な説明（80文字以内）",
      "category": "認知的" | "行動的",
      "duration": ${duration},
      "steps": ["手順1", "手順2", "手順3"]
    }
  ]
}

実用的で、すぐに実行できる提案をお願いします。`;

    console.log('Sending request to Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('Gemini API response received, length:', text.length);
    
    // JSONパースを試行
    try {
      // Markdownコードブロックを除去
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : text;
      
      const parsed = JSON.parse(jsonText);
      console.log('Successfully parsed Gemini response, suggestions count:', parsed.suggestions?.length || 0);
      return parsed.suggestions || [];
    } catch (parseError) {
      console.warn('Failed to parse Gemini response as JSON:', parseError);
      console.log('Raw response:', text.substring(0, 200) + '...');
      console.log('Using fallback suggestions');
      return getFallbackSuggestions(situation, duration);
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.log('Using fallback suggestions due to Gemini API error');
    return getFallbackSuggestions(situation, duration);
  }
}

// フォールバック提案
function getFallbackSuggestions(situation: string, duration: number) {
  console.log(`Getting fallback suggestions for ${situation}, ${duration} minutes`);
  
  const suggestions = fallbackSuggestions[situation as keyof typeof fallbackSuggestions]?.[duration as keyof any] || [];
  
  // Fisher-Yatesシャッフルで順番をランダマイズ
  function shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  // ユニークなIDを生成（タイムスタンプ + ランダム値）
  function generateUniqueId(baseId: string): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${baseId}_${timestamp}_${random}`;
  }
  
  // シャッフルして最初の3つを選択し、ユニークなIDを付与
  const shuffled = shuffle(suggestions);
  const selected = shuffled.slice(0, 3).map(suggestion => ({
    ...suggestion,
    id: generateUniqueId(suggestion.id)
  }));
  
  console.log(`Returning ${selected.length} fallback suggestions`);
  return selected;
}

// メインハンドラー
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: {
        message: 'Method not allowed',
        code: 'METHOD_NOT_ALLOWED'
      }
    });
  }

  try {
    // バリデーション
    const validatedQuery = suggestionsQuerySchema.parse(req.query);
    const { situation, duration } = validatedQuery;

    console.log(`API endpoint called - Generating suggestions for situation: ${situation}, duration: ${duration}`);

    // 提案生成
    const suggestions = await generateSuggestions(situation, duration);
    
    console.log(`Returning ${suggestions.length} suggestions, source: ${suggestions.length > 0 ? 'gemini or fallback' : 'empty'}`);

    return res.status(200).json({
      suggestions,
      metadata: {
        situation,
        duration,
        timestamp: new Date().toISOString(),
        source: suggestions.length > 0 ? 'gemini' : 'fallback'
      }
    });
  } catch (error) {
    console.error('Error generating suggestions:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          message: 'Invalid request parameters',
          code: 'VALIDATION_ERROR',
          details: error.errors
        }
      });
    }

    return res.status(500).json({
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR'
      }
    });
  }
}