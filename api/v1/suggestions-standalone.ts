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

// Simple validation function
function validateRequest(query: any) {
  const { situation, duration, ageGroup, location } = query;
  
  // Validate situation
  const validSituations = ['workplace', 'home', 'outside', 'studying', 'school', 'commuting', 'job_hunting'];
  if (!validSituations.includes(situation)) {
    throw new Error(`Invalid situation: ${situation}`);
  }
  
  // Validate duration
  const validDurations = ['5', '15', '30'];
  if (!validDurations.includes(duration)) {
    throw new Error(`Invalid duration: ${duration}`);
  }
  
  // Validate ageGroup if provided
  if (ageGroup) {
    const validAgeGroups = ['student', 'office_worker', 'middle_school', 'housewife', 'elderly', 'job_seeker', 'career_changer'];
    if (!validAgeGroups.includes(ageGroup)) {
      throw new Error(`Invalid ageGroup: ${ageGroup}`);
    }
  }
  
  return {
    situation,
    duration: parseInt(duration),
    ageGroup: ageGroup || 'office_worker',
    location: location || 'Tokyo'
  };
}

// Simple suggestions generator without external dependencies
function generateSimpleSuggestions(situation: string, duration: number, ageGroup: string, location: string) {
  const suggestions = [];
  
  // Basic suggestion based on situation and duration
  if (situation === 'workplace') {
    suggestions.push({
      id: 'workplace_1',
      title: '深呼吸で気持ちをリセット',
      description: '5分間の深呼吸で心を落ち着かせます',
      duration: duration,
      category: '認知的',
      steps: [
        '椅子に座り、背筋を伸ばす',
        '鼻から4秒かけて息を吸う',
        '4秒間息を止める',
        '口から8秒かけて息を吐く',
        'これを5回繰り返す'
      ]
    });
  } else if (situation === 'studying') {
    suggestions.push({
      id: 'studying_1',
      title: '目と首のストレッチ',
      description: '勉強疲れを解消するストレッチ',
      duration: duration,
      category: '行動的',
      steps: [
        '椅子から立ち上がる',
        '首をゆっくり左右に回す',
        '目を閉じて10秒間休む',
        '遠くを見つめる',
        '肩を上下に動かす'
      ]
    });
  } else {
    suggestions.push({
      id: 'general_1',
      title: '軽い散歩',
      description: '新鮮な空気を吸いながら気分転換',
      duration: duration,
      category: '行動的',
      steps: [
        '外に出る',
        'ゆっくりと歩く',
        '周りの景色を観察する',
        '深呼吸を心がける',
        '気持ちをリフレッシュ'
      ]
    });
  }
  
  // Add age group specific suggestions
  if (ageGroup === 'student') {
    suggestions.push({
      id: 'student_1',
      title: '勉強の合間の瞑想',
      description: '短時間で集中力を回復',
      duration: duration,
      category: '認知的',
      steps: [
        '静かな場所に座る',
        '目を閉じる',
        '呼吸に集中する',
        '雑念が浮かんだら呼吸に戻る',
        '5分間継続する'
      ]
    });
  }
  
  // Add third suggestion for variety
  suggestions.push({
    id: 'general_2',
    title: '感謝の気持ちを思い出す',
    description: '今日の良かったことを3つ思い出す',
    duration: duration,
    category: '認知的',
    steps: [
      '今日起きた良いことを思い出す',
      '感謝したい人を思い浮かべる',
      'その人に心の中でお礼を言う',
      '自分の頑張りを認める',
      '前向きな気持ちを感じる'
    ]
  });
  
  return suggestions.slice(0, 3); // Return exactly 3 suggestions
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[STANDALONE] Function invoked at:', new Date().toISOString());
  console.log('[STANDALONE] Method:', req.method);
  console.log('[STANDALONE] Query params:', req.query);
  
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    console.log('[STANDALONE] OPTIONS request, returning 200');
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    console.log('[STANDALONE] Invalid method:', req.method);
    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    } as ApiResponseError);
  }

  try {
    console.log('[STANDALONE] Starting validation...');
    const validatedQuery = validateRequest(req.query);
    console.log('[STANDALONE] Validation successful:', validatedQuery);
    
    const { situation, duration, ageGroup, location } = validatedQuery;
    
    console.log('[STANDALONE] Generating suggestions...');
    const suggestions = generateSimpleSuggestions(situation, duration, ageGroup, location);
    console.log('[STANDALONE] Suggestions generated:', suggestions.length);

    const response: ApiResponseSuccess<{ suggestions: any[]; metadata: any }> = {
      status: 'success',
      data: {
        suggestions,
        metadata: {
          situation,
          duration,
          ageGroup,
          location,
          timestamp: new Date().toISOString(),
          standalone: true
        },
      }
    };

    console.log('[STANDALONE] Sending response...');
    return res.status(200).json(response);
  } catch (error) {
    console.error('[STANDALONE] Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'サーバー内部でエラーが発生しました。時間をおいて再試行してください。',
      code: 'INTERNAL_SERVER_ERROR'
    } as ApiResponseError);
  }
}