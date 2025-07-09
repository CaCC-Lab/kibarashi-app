// 47都道府県の天気データをインポート
const prefectureWeatherData = require('./prefectureWeatherData');

module.exports = (req, res) => {
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
    
    // 47都道府県の天気データを使用
    const locationWeatherData = prefectureWeatherData;
    
    // 地域データを取得（デフォルトは東京）
    const locationData = locationWeatherData[location] || locationWeatherData['Tokyo'];
    
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
    
    // 地域別の天候パターン
    const weatherConditions = locationData.commonConditions;
    let currentCondition = weatherConditions[hour % weatherConditions.length];
    
    // 北海道・東北地方の冬は雪の確率を高く
    if ((location === 'Hokkaido' || location === 'Sapporo' || 
         location === 'Aomori' || location === 'Akita' || 
         location === 'Iwate' || location === 'Yamagata') && season === 'winter') {
      const snowChance = Math.random();
      if (snowChance < 0.4) {
        currentCondition = 'snowy';
      }
    }
    
    // 地域と季節を考慮した温度計算
    const baseTemperatures = {
      spring: 18,
      summer: 28,
      autumn: 15,
      winter: 8
    };
    const baseTemp = baseTemperatures[season];
    const locationAdjustment = locationData.seasonalAdjustment[season];
    const randomVariation = Math.floor(Math.random() * 6) - 3; // ±3度のランダム変動
    const temperature = baseTemp + locationAdjustment + randomVariation;
    
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
          temperature: temperature,
          condition: currentCondition,
          description: weatherDescriptions[currentCondition] || '不明',
          humidity: Math.floor(Math.random() * 30) + 50, // 50-80%
          location: locationData.baseName,
          icon: currentCondition === 'sunny' ? '01d' : 
                currentCondition === 'cloudy' ? '03d' : 
                currentCondition === 'rainy' ? '10d' : 
                currentCondition === 'snowy' ? '13d' : '01d'
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