import { WeatherData, SeasonalData } from '../components/context/ContextDisplay';

export interface ContextualData {
  weather: WeatherData | null;
  seasonal: SeasonalData;
  timestamp: string;
}

class ContextAPI {
  private cache: { data: ContextualData; timestamp: number } | null = null;
  private readonly cacheTimeout = 10 * 60 * 1000; // 10分キャッシュ

  /**
   * 現在のコンテキストデータを取得
   */
  async getCurrentContext(location?: string, lat?: number, lon?: number): Promise<ContextualData | null> {
    try {
      // キャッシュチェック - 場所が変わった場合はキャッシュを無効化
      if (this.cache && Date.now() - this.cache.timestamp < this.cacheTimeout) {
        if (location && this.cache.data.weather?.location !== this.getLocationDisplayName(location)) {
          this.cache = null;
        } else {
          return this.cache.data;
        }
      }

      // バックエンドAPIからデータを取得（GPS座標優先）
      const params = new URLSearchParams();
      if (lat && lon) {
        params.set('lat', lat.toString());
        params.set('lon', lon.toString());
      }
      if (location) {
        params.set('location', location);
      }
      const query = params.toString();
      const url = `/api/v1/context${query ? `?${query}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // タイムアウト設定
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        throw new Error(`Context API error: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error('Invalid context API response');
      }

      const contextData = result.data;
      
      // キャッシュに保存
      this.cache = {
        data: contextData,
        timestamp: Date.now()
      };

      return contextData;

    } catch (error) {
      // エラー時はモックデータを返す
      return this.getMockContextData(location);
    }
  }

  /**
   * モックデータ（開発・テスト用）
   */
  private async getMockContextData(location?: string): Promise<ContextualData> {
    const now = new Date();
    const month = now.getMonth() + 1;
    const hour = now.getHours();

    // 季節判定
    let season: SeasonalData['season'];
    if (month >= 3 && month <= 5) {
      season = 'spring';
    } else if (month >= 6 && month <= 8) {
      season = 'summer';
    } else if (month >= 9 && month <= 11) {
      season = 'autumn';
    } else {
      season = 'winter';
    }

    // 時間帯に基づく天候パターン
    const weatherConditions: WeatherData['condition'][] = ['sunny', 'cloudy', 'rainy'];
    const currentCondition = weatherConditions[hour % weatherConditions.length];

    // 季節のイベント
    const seasonalEvents = this.getSeasonalEvents(month);
    const holidays = this.getCurrentHolidays(month, now.getDate());
    const seasonalTips = this.getSeasonalTips(season, month);

    return {
      weather: {
        temperature: this.getSeasonalTemperature(season),
        condition: currentCondition,
        description: this.getWeatherDescription(currentCondition),
        humidity: Math.floor(Math.random() * 30) + 50, // 50-80%
        location: this.getLocationDisplayName(location || 'Tokyo'),
        icon: this.getWeatherIcon(currentCondition)
      },
      seasonal: {
        season,
        month,
        seasonalEvents,
        holidays,
        specialPeriods: this.getSpecialPeriods(month, now.getDate()),
        seasonalTips
      },
      timestamp: now.toISOString()
    };
  }

  private getSeasonalEvents(month: number): string[] {
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

  private getCurrentHolidays(month: number, date: number): string[] {
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

  private getSpecialPeriods(month: number, date: number): string[] {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private getSeasonalTips(season: SeasonalData['season'], _month: number): string[] {
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

  private getSeasonalTemperature(season: SeasonalData['season']): number {
    const baseTemperatures = {
      spring: 18,
      summer: 28,
      autumn: 15,
      winter: 8
    };

    return baseTemperatures[season] + Math.floor(Math.random() * 6) - 3; // ±3度のランダム変動
  }

  private getWeatherDescription(condition: WeatherData['condition']): string {
    const descriptions = {
      sunny: '晴れ',
      cloudy: '曇り',
      rainy: '雨',
      snowy: '雪',
      unknown: '不明'
    };

    return descriptions[condition];
  }

  private getWeatherIcon(condition: WeatherData['condition']): string {
    const icons = {
      sunny: '01d',
      cloudy: '03d',
      rainy: '10d',
      snowy: '13d',
      unknown: '01d'
    };

    return icons[condition];
  }

  /**
   * 場所の表示名を取得
   */
  private getLocationDisplayName(location: string): string {
    const locationMap: Record<string, string> = {
      // 既存の主要都市（後方互換性のため保持）
      'Tokyo': '東京',
      'Osaka': '大阪',
      'Kyoto': '京都',
      'Yokohama': '横浜',
      'Nagoya': '名古屋',
      'Sapporo': '札幌',
      'Fukuoka': '福岡',
      'Sendai': '仙台',
      'Hiroshima': '広島',
      'Kobe': '神戸',
      // 47都道府県
      'Hokkaido': '北海道',
      'Aomori': '青森県',
      'Iwate': '岩手県',
      'Miyagi': '宮城県',
      'Akita': '秋田県',
      'Yamagata': '山形県',
      'Fukushima': '福島県',
      'Ibaraki': '茨城県',
      'Tochigi': '栃木県',
      'Gunma': '群馬県',
      'Saitama': '埼玉県',
      'Chiba': '千葉県',
      'Kanagawa': '神奈川県',
      'Niigata': '新潟県',
      'Toyama': '富山県',
      'Ishikawa': '石川県',
      'Fukui': '福井県',
      'Yamanashi': '山梨県',
      'Nagano': '長野県',
      'Gifu': '岐阜県',
      'Shizuoka': '静岡県',
      'Aichi': '愛知県',
      'Mie': '三重県',
      'Shiga': '滋賀県',
      'Hyogo': '兵庫県',
      'Nara': '奈良県',
      'Wakayama': '和歌山県',
      'Tottori': '鳥取県',
      'Shimane': '島根県',
      'Okayama': '岡山県',
      'Yamaguchi': '山口県',
      'Tokushima': '徳島県',
      'Kagawa': '香川県',
      'Ehime': '愛媛県',
      'Kochi': '高知県',
      'Saga': '佐賀県',
      'Nagasaki': '長崎県',
      'Kumamoto': '熊本県',
      'Oita': '大分県',
      'Miyazaki': '宮崎県',
      'Kagoshima': '鹿児島県',
      'Okinawa': '沖縄県'
    };
    return locationMap[location] || location;
  }

  /**
   * キャッシュをクリア
   */
  clearCache(): void {
    this.cache = null;
  }
}

// シングルトンインスタンス
const contextAPI = new ContextAPI();

export { contextAPI };