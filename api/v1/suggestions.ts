import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required');
    }
    geminiClient = new GoogleGenerativeAI(apiKey);
  }
  return geminiClient;
}

// 気晴らし提案生成
async function generateSuggestions(situation: string, duration: number) {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

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

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // JSONパースを試行
    try {
      const parsed = JSON.parse(text);
      return parsed.suggestions || [];
    } catch (parseError) {
      console.warn('Failed to parse Gemini response as JSON, using fallback');
      return getFallbackSuggestions(situation, duration);
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    return getFallbackSuggestions(situation, duration);
  }
}

// フォールバック提案
function getFallbackSuggestions(situation: string, duration: number) {
  const fallbackData = {
    workplace: {
      5: [
        {
          id: 'workplace_5_1',
          title: '深呼吸とポジティブ思考',
          description: '5回深呼吸して、今日の良かったことを3つ思い浮かべる',
          category: '認知的',
          duration: 5,
          steps: ['椅子に座って背筋を伸ばす', '鼻から4秒吸って8秒で吐く', '良かったことを3つ思い浮かべる']
        },
        {
          id: 'workplace_5_2',
          title: 'デスク周りの整理',
          description: 'デスクの上を片付けて、気持ちもスッキリさせる',
          category: '行動的',
          duration: 5,
          steps: ['不要な書類を片付ける', 'PC周りを拭く', 'お気に入りのアイテムを飾る']
        },
        {
          id: 'workplace_5_3',
          title: '温かい飲み物を味わう',
          description: 'コーヒーやお茶を丁寧に味わって、心を落ち着かせる',
          category: '行動的',
          duration: 5,
          steps: ['お気に入りの飲み物を用意', '香りを楽しむ', '一口ずつゆっくり味わう']
        }
      ]
    },
    home: {
      5: [
        {
          id: 'home_5_1',
          title: '感謝の気持ちを思い返す',
          description: '今日感謝したいことを3つ心の中で唱える',
          category: '認知的',
          duration: 5,
          steps: ['静かな場所に座る', '感謝したいことを思い浮かべる', '心の中で「ありがとう」と唱える']
        },
        {
          id: 'home_5_2',
          title: '軽いストレッチ',
          description: '肩や首のコリをほぐして、体の緊張を和らげる',
          category: '行動的',
          duration: 5,
          steps: ['首をゆっくり回す', '肩を上下に動かす', '腕を大きく回す']
        },
        {
          id: 'home_5_3',
          title: '好きな音楽を聴く',
          description: 'お気に入りの曲を聴いて、心を癒す',
          category: '行動的',
          duration: 5,
          steps: ['リラックスできる曲を選ぶ', '目を閉じて聴く', '歌詞や音に集中する']
        }
      ]
    },
    outside: {
      5: [
        {
          id: 'outside_5_1',
          title: '自然の音に耳を傾ける',
          description: '鳥の声や風の音など、自然の音に集中する',
          category: '認知的',
          duration: 5,
          steps: ['静かな場所を見つける', '目を閉じる', '自然の音に集中する']
        },
        {
          id: 'outside_5_2',
          title: 'ゆっくり歩く',
          description: '急がずに周りの景色を眺めながら歩く',
          category: '行動的',
          duration: 5,
          steps: ['歩くペースを落とす', '周りの景色を観察', '足の感覚に意識を向ける']
        },
        {
          id: 'outside_5_3',
          title: '空を見上げる',
          description: '空の雲や色の変化を眺めて、心を広げる',
          category: '認知的',
          duration: 5,
          steps: ['空を見上げる', '雲の形や動きを観察', '大きな空間を感じる']
        }
      ]
    }
  };

  return fallbackData[situation as keyof typeof fallbackData]?.[duration as keyof any] || [];
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

    console.log(`Generating suggestions for situation: ${situation}, duration: ${duration}`);

    // 提案生成
    const suggestions = await generateSuggestions(situation, duration);

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