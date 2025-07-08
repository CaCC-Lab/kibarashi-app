import { VercelRequest, VercelResponse } from "@vercel/node";

// Standard API response types
type ApiResponseSuccess<T> = {
  status: 'success';
  data: T;
};

type ApiResponseError = {
  status: 'error';
  message: string;
  code?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[SIMPLE] Function invoked at:', new Date().toISOString());
  console.log('[SIMPLE] Method:', req.method);
  console.log('[SIMPLE] Query params:', req.query);
  
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    console.log('[SIMPLE] OPTIONS request, returning 200');
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    console.log('[SIMPLE] Invalid method:', req.method);
    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    } as ApiResponseError);
  }

  try {
    console.log('[SIMPLE] Processing request...');
    
    // Quick success response for testing
    const response: ApiResponseSuccess<{ suggestions: any[]; metadata: any }> = {
      status: 'success',
      data: {
        suggestions: [
          {
            id: 'simple_1',
            title: '深呼吸で気持ちをリセット',
            description: '5分間の深呼吸で心を落ち着かせます',
            duration: 5,
            category: '認知的',
            steps: [
              '椅子に座り、背筋を伸ばす',
              '鼻から4秒かけて息を吸う',
              '4秒間息を止める',
              '口から8秒かけて息を吐く',
              'これを5回繰り返す'
            ]
          },
          {
            id: 'simple_2',
            title: '軽い散歩',
            description: '新鮮な空気を吸いながら気分転換',
            duration: 5,
            category: '行動的',
            steps: [
              '外に出る',
              'ゆっくりと歩く',
              '周りの景色を観察する',
              '深呼吸を心がける',
              '気持ちをリフレッシュ'
            ]
          },
          {
            id: 'simple_3',
            title: '感謝の気持ちを思い出す',
            description: '今日の良かったことを3つ思い出す',
            duration: 5,
            category: '認知的',
            steps: [
              '今日起きた良いことを思い出す',
              '感謝したい人を思い浮かべる',
              'その人に心の中でお礼を言う',
              '自分の頑張りを認める',
              '前向きな気持ちを感じる'
            ]
          }
        ],
        metadata: {
          situation: req.query.situation || 'workplace',
          duration: parseInt(req.query.duration as string) || 5,
          ageGroup: req.query.ageGroup || 'office_worker',
          location: req.query.location || 'Tokyo',
          timestamp: new Date().toISOString(),
          simple: true
        },
      }
    };

    console.log('[SIMPLE] Sending response...');
    return res.status(200).json(response);
  } catch (error) {
    console.error('[SIMPLE] Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'サーバー内部でエラーが発生しました。時間をおいて再試行してください。',
      code: 'INTERNAL_SERVER_ERROR'
    } as ApiResponseError);
  }
}