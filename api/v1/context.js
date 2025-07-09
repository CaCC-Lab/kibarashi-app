// OpenWeatherMap API を使用した実際の天気データ取得
const axios = require('axios');

// 47都道府県の県庁所在地座標データ
const JAPAN_CITIES = {
  'Hokkaido': { lat: 43.0642, lon: 141.3469, name: '北海道' },
  'Aomori': { lat: 40.8244, lon: 140.7400, name: '青森県' },
  'Iwate': { lat: 39.7036, lon: 141.1527, name: '岩手県' },
  'Miyagi': { lat: 38.2682, lon: 140.8694, name: '宮城県' },
  'Akita': { lat: 39.7186, lon: 140.1024, name: '秋田県' },
  'Yamagata': { lat: 38.2404, lon: 140.3633, name: '山形県' },
  'Fukushima': { lat: 37.7608, lon: 140.4747, name: '福島県' },
  'Ibaraki': { lat: 36.3417, lon: 140.4469, name: '茨城県' },
  'Tochigi': { lat: 36.5658, lon: 139.8836, name: '栃木県' },
  'Gunma': { lat: 36.3906, lon: 139.0608, name: '群馬県' },
  'Saitama': { lat: 35.8569, lon: 139.6489, name: '埼玉県' },
  'Chiba': { lat: 35.6074, lon: 140.1061, name: '千葉県' },
  'Tokyo': { lat: 35.6762, lon: 139.6503, name: '東京都' },
  'Kanagawa': { lat: 35.4478, lon: 139.6425, name: '神奈川県' },
  'Niigata': { lat: 37.9026, lon: 139.0232, name: '新潟県' },
  'Toyama': { lat: 36.6953, lon: 137.2113, name: '富山県' },
  'Ishikawa': { lat: 36.5944, lon: 136.6256, name: '石川県' },
  'Fukui': { lat: 36.0652, lon: 136.2217, name: '福井県' },
  'Yamanashi': { lat: 35.6642, lon: 138.5686, name: '山梨県' },
  'Nagano': { lat: 36.6513, lon: 138.1811, name: '長野県' },
  'Gifu': { lat: 35.3911, lon: 136.7222, name: '岐阜県' },
  'Shizuoka': { lat: 34.9769, lon: 138.3833, name: '静岡県' },
  'Aichi': { lat: 35.1802, lon: 136.9066, name: '愛知県' },
  'Mie': { lat: 34.7303, lon: 136.5086, name: '三重県' },
  'Shiga': { lat: 35.0044, lon: 135.8686, name: '滋賀県' },
  'Kyoto': { lat: 35.0211, lon: 135.7556, name: '京都府' },
  'Osaka': { lat: 34.6937, lon: 135.5023, name: '大阪府' },
  'Hyogo': { lat: 34.6913, lon: 135.1830, name: '兵庫県' },
  'Nara': { lat: 34.6851, lon: 135.8050, name: '奈良県' },
  'Wakayama': { lat: 34.2261, lon: 135.1675, name: '和歌山県' },
  'Tottori': { lat: 35.5036, lon: 134.2381, name: '鳥取県' },
  'Shimane': { lat: 35.4722, lon: 133.0506, name: '島根県' },
  'Okayama': { lat: 34.6617, lon: 133.9347, name: '岡山県' },
  'Hiroshima': { lat: 34.3853, lon: 132.4553, name: '広島県' },
  'Yamaguchi': { lat: 34.1861, lon: 131.4706, name: '山口県' },
  'Tokushima': { lat: 34.0658, lon: 134.5594, name: '徳島県' },
  'Kagawa': { lat: 34.3428, lon: 134.0431, name: '香川県' },
  'Ehime': { lat: 33.8417, lon: 132.7656, name: '愛媛県' },
  'Kochi': { lat: 33.5597, lon: 133.5311, name: '高知県' },
  'Fukuoka': { lat: 33.6064, lon: 130.4181, name: '福岡県' },
  'Saga': { lat: 33.2494, lon: 130.2989, name: '佐賀県' },
  'Nagasaki': { lat: 32.7503, lon: 129.8781, name: '長崎県' },
  'Kumamoto': { lat: 32.8031, lon: 130.7058, name: '熊本県' },
  'Oita': { lat: 33.2382, lon: 131.6125, name: '大分県' },
  'Miyazaki': { lat: 31.9077, lon: 131.4202, name: '宮崎県' },
  'Kagoshima': { lat: 31.5602, lon: 130.5581, name: '鹿児島県' },
  'Okinawa': { lat: 26.2124, lon: 127.6792, name: '沖縄県' },
  // 既存の主要都市（後方互換性のため）
  'Yokohama': { lat: 35.4478, lon: 139.6425, name: '横浜' },
  'Nagoya': { lat: 35.1802, lon: 136.9066, name: '名古屋' },
  'Sapporo': { lat: 43.0642, lon: 141.3469, name: '札幌' },
  'Sendai': { lat: 38.2682, lon: 140.8694, name: '仙台' },
  'Kobe': { lat: 34.6913, lon: 135.1830, name: '神戸' }
};

// OpenWeatherMap API の weather ID を内部のcondition形式に変換
function mapWeatherCondition(weatherId, weatherMain) {
  if (weatherId >= 200 && weatherId < 300) return 'rainy'; // 雷雨
  if (weatherId >= 300 && weatherId < 400) return 'rainy'; // 霧雨
  if (weatherId >= 500 && weatherId < 600) return 'rainy'; // 雨
  if (weatherId >= 600 && weatherId < 700) return 'snowy'; // 雪
  if (weatherId >= 700 && weatherId < 800) return 'cloudy'; // 大気現象（霧など）
  if (weatherId === 800) return 'sunny'; // 晴れ
  if (weatherId > 800) return 'cloudy'; // 曇り

  // フォールバック
  const main = weatherMain.toLowerCase();
  if (main.includes('rain')) return 'rainy';
  if (main.includes('snow')) return 'snowy';
  if (main.includes('cloud')) return 'cloudy';
  if (main.includes('clear')) return 'sunny';
  
  return 'unknown';
}

// 実際の天気データを取得
async function getActualWeatherData(location) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ OpenWeatherMap API key not configured. Using mock data.');
    return null;
  }

  const cityData = JAPAN_CITIES[location];
  if (!cityData) {
    console.warn(`City data not found for ${location}, using Tokyo as fallback`);
    return null;
  }

  try {
    const url = 'https://api.openweathermap.org/data/2.5/weather';
    const response = await axios.get(url, {
      params: {
        lat: cityData.lat,
        lon: cityData.lon,
        appid: apiKey,
        units: 'metric',
        lang: 'ja'
      },
      timeout: 8000
    });

    const weather = response.data.weather[0];
    const condition = mapWeatherCondition(weather.id, weather.main);
    
    return {
      temperature: Math.round(response.data.main.temp),
      condition,
      description: weather.description,
      humidity: response.data.main.humidity,
      location: cityData.name,
      icon: weather.icon
    };
  } catch (error) {
    console.error('OpenWeatherMap API error:', error.response?.data || error.message);
    return null;
  }
}

// モックデータ生成（API利用不可時）
function getMockWeatherData(location) {
  const cityData = JAPAN_CITIES[location] || JAPAN_CITIES['Tokyo'];
  const now = new Date();
  const month = now.getMonth() + 1;
  const hour = now.getHours();
  
  // 季節判定
  let season;
  if (month >= 3 && month <= 5) {
    season = 'spring';
  } else if (month >= 6 && month <= 8) {
    season = 'summer';
  } else if (month >= 9 && month <= 11) {
    season = 'autumn';
  } else {
    season = 'winter';
  }
  
  // 季節別の基本温度
  const baseTemperatures = {
    spring: 18,
    summer: 28,
    autumn: 15,
    winter: 8
  };
  
  // 時間帯に基づく天候パターン
  const weatherConditions = ['sunny', 'cloudy', 'rainy'];
  const currentCondition = weatherConditions[hour % weatherConditions.length];
  
  return {
    temperature: baseTemperatures[season] + Math.floor(Math.random() * 6) - 3,
    condition: currentCondition,
    description: currentCondition === 'sunny' ? '晴れ' : 
                 currentCondition === 'cloudy' ? '曇り' : 
                 currentCondition === 'rainy' ? '雨' : '晴れ',
    humidity: Math.floor(Math.random() * 30) + 50,
    location: cityData.name,
    icon: currentCondition === 'sunny' ? '01d' : 
          currentCondition === 'cloudy' ? '03d' : 
          currentCondition === 'rainy' ? '10d' : '01d'
  };
}

module.exports = async (req, res) => {
  console.log('[JS CONTEXT] Function invoked at:', new Date().toISOString());
  console.log('[JS CONTEXT] Method:', req.method);
  
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    console.log('[JS CONTEXT] OPTIONS request, returning 200');
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    console.log('[JS CONTEXT] Invalid method:', req.method);
    return res.status(405).json({
      error: {
        message: 'Method not allowed',
        code: 'METHOD_NOT_ALLOWED'
      }
    });
  }

  try {
    console.log('[JS CONTEXT] Processing request...');
    
    // クエリパラメータから位置情報を取得
    const location = req.query.location || 'Tokyo';
    console.log('[JS CONTEXT] Location:', location);
    
    // 実際の天気データを取得
    let weatherData = await getActualWeatherData(location);
    
    if (!weatherData) {
      console.log('[JS CONTEXT] Using mock weather data');
      weatherData = getMockWeatherData(location);
    } else {
      console.log('[JS CONTEXT] Using actual weather data from OpenWeatherMap');
    }
    
    const now = new Date();
    const month = now.getMonth() + 1;
    
    // 天候の説明
    const weatherDescriptions = {
      sunny: '晴れ',
      cloudy: '曇り',
      rainy: '雨',
      snowy: '雪',
      unknown: '不明'
    };
    
    // 季節のイベント
    const seasonalEvents = {
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
    
    // 季節のヒント
    const seasonalTips = {
      spring: ['🌸 桜や花の写真を撮る', '🌿 新緑を感じながら深呼吸', '📚 新しいことを始める季節'],
      summer: ['🌊 涼しい音楽を聴く', '🍧 冷たい飲み物でリフレッシュ', '🌟 夏の思い出を振り返る'],
      autumn: ['🍂 紅葉の写真を見る', '📖 読書でのんびり過ごす', '🍁 秋の味覚を楽しむ'],
      winter: ['❄️ 雪景色や冬の風景を楽しむ', '☕ 温かい飲み物で暖まる', '🧦 暖かい場所でくつろぐ']
    };
    
    // 季節判定
    let season;
    if (month >= 3 && month <= 5) {
      season = 'spring';
    } else if (month >= 6 && month <= 8) {
      season = 'summer';
    } else if (month >= 9 && month <= 11) {
      season = 'autumn';
    } else {
      season = 'winter';
    }
    
    // 特別な期間の判定
    const date = now.getDate();
    const specialPeriods = [];
    
    if ((month === 12 && date >= 29) || (month === 1 && date <= 3)) {
      specialPeriods.push('年末年始');
    }
    if ((month === 4 && date >= 29) || (month === 5 && date <= 5)) {
      specialPeriods.push('ゴールデンウィーク');
    }
    if (month === 8 && date >= 13 && date <= 16) {
      specialPeriods.push('お盆');
    }
    
    // レスポンスデータ構築
    const response = {
      success: true,
      data: {
        weather: {
          temperature: weatherData.temperature,
          condition: weatherData.condition,
          description: weatherData.description,
          humidity: weatherData.humidity,
          location: weatherData.location,
          icon: weatherData.icon
        },
        seasonal: {
          season: season,
          month: month,
          seasonalEvents: seasonalEvents[month] || [],
          holidays: [], // 簡易実装のため空配列
          specialPeriods: specialPeriods,
          seasonalTips: seasonalTips[season] || []
        },
        timestamp: now.toISOString()
      }
    };
    
    console.log('[JS CONTEXT] Sending response...');
    return res.status(200).json(response);
    
  } catch (error) {
    console.error('[JS CONTEXT] Error:', error);
    return res.status(500).json({
      error: {
        message: 'サーバー内部でエラーが発生しました。時間をおいて再試行してください。',
        code: 'INTERNAL_SERVER_ERROR'
      }
    });
  }
};