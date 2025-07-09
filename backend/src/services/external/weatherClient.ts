import axios, { AxiosResponse } from 'axios';
import { getCityByPrefecture } from '../../data/japanCities';

export interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'unknown';
  description: string;
  humidity: number;
  location: string;
  icon: string;
}

interface OpenWeatherMapResponse {
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  name: string;
}

/**
 * OpenWeatherMap API を使用した天気データ取得クライアント
 */
class WeatherClient {
  private apiKey: string;
  private baseUrl = 'https://api.openweathermap.org/data/2.5';
  private cache = new Map<string, { data: WeatherData; timestamp: number }>();
  private readonly cacheTimeout = 10 * 60 * 1000; // 10分キャッシュ
  private lastRequestTime = 0;
  private readonly rateLimitDelay = 1000; // 1秒間隔

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENWEATHER_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('⚠️ OpenWeatherMap API key not configured. Using mock data.');
    }
  }

  /**
   * 都道府県IDから天気データを取得
   */
  async getWeatherByPrefecture(prefectureId: string): Promise<WeatherData> {
    const cacheKey = `prefecture_${prefectureId}`;
    
    // キャッシュチェック
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`Weather data returned from cache for ${prefectureId}`);
      return cached.data;
    }

    const cityData = getCityByPrefecture(prefectureId);
    if (!cityData) {
      console.warn(`Prefecture ${prefectureId} not found, using Tokyo as fallback`);
      return this.getWeatherByPrefecture('Tokyo');
    }

    try {
      const weatherData = await this.getCurrentWeatherByCoordinates(
        cityData.lat,
        cityData.lon,
        cityData.japaneseDisplayName
      );
      
      // キャッシュに保存
      this.cache.set(cacheKey, {
        data: weatherData,
        timestamp: Date.now()
      });
      
      return weatherData;
    } catch (error) {
      console.error(`Failed to get weather for ${prefectureId}:`, error);
      return this.getMockWeatherData(cityData.japaneseDisplayName);
    }
  }

  /**
   * 座標から現在の天気データを取得
   */
  async getCurrentWeatherByCoordinates(lat: number, lon: number, locationName: string): Promise<WeatherData> {
    if (!this.apiKey) {
      console.warn('API key not available, using mock data');
      return this.getMockWeatherData(locationName);
    }

    // レート制限対応
    await this.waitForRateLimit();

    const url = `${this.baseUrl}/weather`;
    const params = {
      lat: lat.toString(),
      lon: lon.toString(),
      appid: this.apiKey,
      units: 'metric',
      lang: 'ja'
    };

    try {
      console.log(`Fetching weather data for ${locationName} (${lat}, ${lon})`);
      
      const response: AxiosResponse<OpenWeatherMapResponse> = await axios.get(url, {
        params,
        timeout: 8000
      });

      return this.parseOpenWeatherMapResponse(response.data, locationName);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          console.error('Rate limit exceeded, waiting and retrying...');
          await this.sleep(2000);
          return this.getCurrentWeatherByCoordinates(lat, lon, locationName);
        }
        
        console.error('OpenWeatherMap API error:', {
          status: error.response?.status,
          message: error.response?.data?.message || error.message
        });
      }
      
      throw error;
    }
  }

  /**
   * 都市名から天気データを取得（従来の方法）
   */
  async getCurrentWeatherByCity(cityName: string): Promise<WeatherData> {
    if (!this.apiKey) {
      console.warn('API key not available, using mock data');
      return this.getMockWeatherData(cityName);
    }

    // レート制限対応
    await this.waitForRateLimit();

    const url = `${this.baseUrl}/weather`;
    const params = {
      q: `${cityName},JP`,
      appid: this.apiKey,
      units: 'metric',
      lang: 'ja'
    };

    try {
      console.log(`Fetching weather data for city: ${cityName}`);
      
      const response: AxiosResponse<OpenWeatherMapResponse> = await axios.get(url, {
        params,
        timeout: 8000
      });

      return this.parseOpenWeatherMapResponse(response.data, cityName);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          console.error('Rate limit exceeded, waiting and retrying...');
          await this.sleep(2000);
          return this.getCurrentWeatherByCity(cityName);
        }
        
        console.error('OpenWeatherMap API error:', {
          status: error.response?.status,
          message: error.response?.data?.message || error.message
        });
      }
      
      throw error;
    }
  }

  /**
   * OpenWeatherMap APIレスポンスを内部形式に変換
   */
  private parseOpenWeatherMapResponse(data: OpenWeatherMapResponse, locationName: string): WeatherData {
    const weather = data.weather[0];
    const condition = this.mapWeatherCondition(weather.id, weather.main);
    
    return {
      temperature: Math.round(data.main.temp),
      condition,
      description: weather.description,
      humidity: data.main.humidity,
      location: locationName,
      icon: weather.icon
    };
  }

  /**
   * OpenWeatherMap の weather ID を内部のcondition形式に変換
   */
  private mapWeatherCondition(weatherId: number, weatherMain: string): WeatherData['condition'] {
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

  /**
   * レート制限対応の待機処理
   */
  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastRequest;
      await this.sleep(waitTime);
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * 指定ミリ秒待機
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * API利用不可時のモックデータ
   */
  private getMockWeatherData(locationName: string): WeatherData {
    const now = new Date();
    const month = now.getMonth() + 1;
    const hour = now.getHours();
    
    // 季節判定
    let season: 'spring' | 'summer' | 'autumn' | 'winter';
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
    const weatherConditions: WeatherData['condition'][] = ['sunny', 'cloudy', 'rainy'];
    const currentCondition = weatherConditions[hour % weatherConditions.length];

    // 天候の説明
    const weatherDescriptions = {
      sunny: '晴れ',
      cloudy: '曇り',
      rainy: '雨',
      snowy: '雪',
      unknown: '不明'
    };

    return {
      temperature: baseTemperatures[season] + Math.floor(Math.random() * 6) - 3,
      condition: currentCondition,
      description: weatherDescriptions[currentCondition],
      humidity: Math.floor(Math.random() * 30) + 50,
      location: locationName,
      icon: currentCondition === 'sunny' ? '01d' : 
            currentCondition === 'cloudy' ? '03d' : 
            currentCondition === 'rainy' ? '10d' : 
            currentCondition === 'snowy' ? '13d' : '01d'
    };
  }

  /**
   * キャッシュをクリア
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * API設定状況を確認
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

// シングルトンインスタンス
const weatherClient = new WeatherClient();

export { weatherClient };
export default WeatherClient;