import { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[ROOT API] Function invoked at:', new Date().toISOString());
  
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const response = {
      status: 'success',
      data: {
        suggestions: [
          {
            id: 'fixed_1',
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
            id: 'fixed_2',
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
            id: 'fixed_3',
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
          source: 'fixed_version'
        }
      }
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('[ROOT API] Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
}