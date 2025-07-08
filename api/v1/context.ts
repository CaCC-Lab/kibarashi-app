import { VercelRequest, VercelResponse } from "@vercel/node";

// Types matching frontend expectations
interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'unknown';
  description: string;
  humidity: number;
  location: string;
  icon: string;
}

interface SeasonalData {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  month: number;
  seasonalEvents: string[];
  holidays: string[];
  specialPeriods: string[];
  seasonalTips: string[];
}

interface ContextualData {
  weather: WeatherData | null;
  seasonal: SeasonalData;
  timestamp: string;
}

// Standard API response types
type ApiResponseSuccess<T> = {
  success: true;
  data: T;
};

type ApiResponseError = {
  success: false;
  error: {
    message: string;
    code?: string;
  };
};

function handleError(res: VercelResponse, error: unknown): VercelResponse {
  console.error('Context API error:', error);
  return res.status(500).json({
    success: false,
    error: {
      message: 'サーバー内部でエラーが発生しました。時間をおいて再試行してください。',
      code: 'INTERNAL_SERVER_ERROR',
    }
  } as ApiResponseError);
}

function getCurrentSeason(month: number): SeasonalData['season'] {
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

function getSeasonalEvents(month: number): string[] {
  const events: Record<number, string[]> = {
    1: ['正月・新年', '成人の日'],
    2: ['節分', 'バレンタイン'],
    3: ['桜の開花時期', '春分の日'],
    4: ['新学期・新年度', 'お花見シーズン'],
    5: ['ゴールデンウィーク', 'こどもの日'],
    6: ['梅雨入り', 'ジューンブライド'],
    7: ['七夕・夏祭り', '海の日'],
    8: ['夏休み・お盆', '花火大会'],
    9: ['紅葉の始まり', '敬老の日'],
    10: ['紅葉シーズン', 'ハロウィン'],
    11: ['秋の味覚', '文化の日'],
    12: ['年末・クリスマス', '忘年会シーズン']
  };
  return events[month] || [];
}

function getCurrentHolidays(month: number, date: number): string[] {
  const holidays: Array<{ month: number; date: number; name: string }> = [
    { month: 1, date: 1, name: '元日' },
    { month: 2, date: 11, name: '建国記念の日' },
    { month: 2, date: 23, name: '天皇誕生日' },
    { month: 4, date: 29, name: '昭和の日' },
    { month: 5, date: 3, name: '憲法記念日' },
    { month: 5, date: 4, name: 'みどりの日' },
    { month: 5, date: 5, name: 'こどもの日' },
    { month: 11, date: 3, name: '文化の日' },
    { month: 11, date: 23, name: '勤労感謝の日' },
    { month: 12, date: 25, name: 'クリスマス' }
  ];

  return holidays
    .filter(holiday => holiday.month === month && Math.abs(holiday.date - date) <= 2)
    .map(holiday => holiday.name);
}

function getSpecialPeriods(month: number, date: number): string[] {
  const periods: string[] = [];

  if ((month === 12 && date >= 29) || (month === 1 && date <= 3)) {
    periods.push('年末年始');
  }

  if ((month === 4 && date >= 29) || (month === 5 && date <= 5)) {
    periods.push('ゴールデンウィーク');
  }

  if (month === 8 && date >= 13 && date <= 16) {
    periods.push('お盆');
  }

  return periods;
}

function getSeasonalTips(season: SeasonalData['season']): string[] {
  const tips: string[] = [];

  switch (season) {
    case 'spring':
      tips.push('🌸 桜や花の写真を撮る', '🌿 新緑を感じながら深呼吸', '📚 新しいことを始める季節');
      break;
    case 'summer':
      tips.push('🌊 涼しい音楽を聴く', '🍧 冷たい飲み物でリフレッシュ', '🌟 夏の思い出を振り返る');
      break;
    case 'autumn':
      tips.push('🍂 紅葉の写真を見る', '📖 読書でのんびり過ごす', '🍁 秋の味覚を楽しむ');
      break;
    case 'winter':
      tips.push('❄️ 雪景色や冬の風景を楽しむ', '☕ 温かい飲み物で暖まる', '🧦 暖かい場所でくつろぐ');
      break;
  }

  return tips;
}

function getSeasonalTemperature(season: SeasonalData['season']): number {
  const baseTemperatures = {
    spring: 18,
    summer: 28,
    autumn: 15,
    winter: 8
  };
  return baseTemperatures[season] + Math.floor(Math.random() * 6) - 3; // ±3度のランダム変動
}

function getWeatherForTimeAndSeason(hour: number, season: SeasonalData['season']): WeatherData {
  // 時間帯と季節に基づく天候パターン
  const weatherConditions: WeatherData['condition'][] = ['sunny', 'cloudy', 'rainy'];
  let currentCondition: WeatherData['condition'];

  // 季節と時間による天候傾向
  if (season === 'summer' && hour >= 6 && hour <= 18) {
    currentCondition = Math.random() > 0.3 ? 'sunny' : 'cloudy';
  } else if (season === 'winter' && (hour < 7 || hour > 17)) {
    currentCondition = Math.random() > 0.5 ? 'cloudy' : 'sunny';
  } else {
    currentCondition = weatherConditions[hour % weatherConditions.length];
  }

  const descriptions = {
    sunny: '晴れ',
    cloudy: '曇り',
    rainy: '雨',
    snowy: '雪',
    unknown: '不明'
  };

  const icons = {
    sunny: '01d',
    cloudy: '03d',
    rainy: '10d',
    snowy: '13d',
    unknown: '01d'
  };

  return {
    temperature: getSeasonalTemperature(season),
    condition: currentCondition,
    description: descriptions[currentCondition],
    humidity: Math.floor(Math.random() * 30) + 50, // 50-80%
    location: '東京',
    icon: icons[currentCondition]
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: {
        message: 'Method not allowed',
        code: 'METHOD_NOT_ALLOWED'
      }
    } as ApiResponseError);
  }

  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const hour = now.getHours();
    const season = getCurrentSeason(month);

    // Generate contextual data
    const contextualData: ContextualData = {
      weather: getWeatherForTimeAndSeason(hour, season),
      seasonal: {
        season,
        month,
        seasonalEvents: getSeasonalEvents(month),
        holidays: getCurrentHolidays(month, date),
        specialPeriods: getSpecialPeriods(month, date),
        seasonalTips: getSeasonalTips(season)
      },
      timestamp: now.toISOString()
    };

    // Cache control headers (short cache for dynamic data)
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5分キャッシュ
    res.setHeader('Pragma', 'cache');

    const response: ApiResponseSuccess<ContextualData> = {
      success: true,
      data: contextualData
    };

    console.log('Context API response generated:', {
      season: contextualData.seasonal.season,
      weather: contextualData.weather?.condition,
      timestamp: contextualData.timestamp
    });

    return res.status(200).json(response);
  } catch (error) {
    return handleError(res, error);
  }
}