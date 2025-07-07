import { logger } from '../../utils/logger';

export interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'unknown';
  description: string;
  humidity: number;
  location: string;
  icon: string;
}

export interface WeatherApiResponse {
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  name: string;
}

class WeatherClient {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5';
  private readonly cache = new Map<string, { data: WeatherData; timestamp: number }>();
  private readonly cacheTimeout = 10 * 60 * 1000; // 10分キャッシュ

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || '';
    if (!this.apiKey) {
      logger.warn('OpenWeatherMap API key not found. Weather features will be disabled.');
    }
  }

  /**
   * 都市名または座標で天候データを取得
   */
  async getCurrentWeather(location: string = 'Tokyo'): Promise<WeatherData | null> {
    try {
      // APIキーが設定されていない場合はモックデータを返す
      if (!this.apiKey) {
        return this.getMockWeatherData(location);
      }

      // キャッシュチェック
      const cacheKey = `weather_${location}`;
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        logger.info('Weather data returned from cache', { location });
        return cached.data;
      }

      // API呼び出し
      const url = `${this.baseUrl}/weather?q=${encodeURIComponent(location)}&appid=${this.apiKey}&units=metric&lang=ja`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // タイムアウト設定
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data: WeatherApiResponse = await response.json();
      const weatherData = this.parseWeatherResponse(data);

      // キャッシュに保存
      this.cache.set(cacheKey, {
        data: weatherData,
        timestamp: Date.now()
      });

      logger.info('Weather data fetched successfully', {
        location: weatherData.location,
        condition: weatherData.condition,
        temperature: weatherData.temperature
      });

      return weatherData;

    } catch (error) {
      logger.error('Failed to fetch weather data', {
        error: error instanceof Error ? error.message : 'Unknown error',
        location
      });

      // エラー時はモックデータを返す
      return this.getMockWeatherData(location);
    }
  }

  /**
   * OpenWeatherMap APIレスポンスを内部形式に変換
   */
  private parseWeatherResponse(data: WeatherApiResponse): WeatherData {
    const weatherMain = data.weather[0]?.main.toLowerCase() || 'unknown';
    
    const condition = this.mapWeatherCondition(weatherMain);
    
    return {
      temperature: Math.round(data.main.temp),
      condition,
      description: data.weather[0]?.description || '不明',
      humidity: data.main.humidity,
      location: data.name,
      icon: data.weather[0]?.icon || '01d'
    };
  }

  /**
   * OpenWeatherMapの天候コードを内部コードにマッピング
   */
  private mapWeatherCondition(weatherMain: string): WeatherData['condition'] {
    const conditionMap: Record<string, WeatherData['condition']> = {
      'clear': 'sunny',
      'clouds': 'cloudy', 
      'rain': 'rainy',
      'drizzle': 'rainy',
      'thunderstorm': 'rainy',
      'snow': 'snowy',
      'mist': 'cloudy',
      'fog': 'cloudy',
      'haze': 'cloudy'
    };

    return conditionMap[weatherMain] || 'unknown';
  }

  /**
   * API利用できない場合のモックデータ
   */
  private getMockWeatherData(location: string): WeatherData {
    const hour = new Date().getHours();
    const mockConditions: WeatherData['condition'][] = ['sunny', 'cloudy', 'rainy'];
    const randomCondition = mockConditions[hour % mockConditions.length];
    
    return {
      temperature: Math.floor(Math.random() * 20) + 10, // 10-30度
      condition: randomCondition,
      description: randomCondition === 'sunny' ? '晴れ' : 
                   randomCondition === 'cloudy' ? '曇り' : '雨',
      humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
      location: location || '東京',
      icon: randomCondition === 'sunny' ? '01d' : 
            randomCondition === 'cloudy' ? '03d' : '10d'
    };
  }

  /**
   * 天候に基づく気晴らし提案のヒントを生成
   */
  generateWeatherBasedTips(weather: WeatherData): string[] {
    const tips: string[] = [];

    switch (weather.condition) {
      case 'sunny':
        tips.push('☀️ 日光浴をしながらリラックス');
        tips.push('🌞 窓を開けて新鮮な空気を取り入れる');
        if (weather.temperature > 20) {
          tips.push('🏃‍♂️ 外でのストレッチがおすすめ');
        }
        break;

      case 'rainy':
        tips.push('🌧️ 雨音を聞きながら瞑想');
        tips.push('☕ 温かい飲み物でほっと一息');
        tips.push('📚 読書やポッドキャストで知的リフレッシュ');
        break;

      case 'cloudy':
        tips.push('☁️ 室内でのんびり過ごす');
        tips.push('🎵 音楽を聴いてリラックス');
        break;

      case 'snowy':
        tips.push('❄️ 雪景色を眺めて心を落ち着ける');
        tips.push('🫖 熱いお茶で体を温める');
        break;

      default:
        tips.push('🌈 今の気分に合わせてゆっくり');
    }

    // 温度に基づく追加ヒント
    if (weather.temperature < 10) {
      tips.push('🧣 暖かい場所でのんびり');
    } else if (weather.temperature > 25) {
      tips.push('💧 水分補給を忘れずに');
    }

    return tips;
  }
}

// シングルトンインスタンス
let instance: WeatherClient | null = null;

export const weatherClient = {
  getCurrentWeather: async (location?: string) => {
    if (!instance) {
      instance = new WeatherClient();
    }
    return instance.getCurrentWeather(location);
  },

  generateWeatherBasedTips: (weather: WeatherData) => {
    if (!instance) {
      instance = new WeatherClient();
    }
    return instance.generateWeatherBasedTips(weather);
  }
};