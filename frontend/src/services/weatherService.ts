/**
 * Open-Meteo API を使った天気取得（APIキー不要）
 * Sorano プロジェクトの実装を参考
 */

export interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  weatherCode: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'unknown';
}

const WMO_CODES: Record<number, { description: string; icon: string; condition: WeatherData['condition'] }> = {
  0: { description: '快晴', icon: '☀️', condition: 'sunny' },
  1: { description: 'ほぼ晴れ', icon: '🌤', condition: 'sunny' },
  2: { description: 'くもり時々晴れ', icon: '⛅', condition: 'cloudy' },
  3: { description: 'くもり', icon: '☁️', condition: 'cloudy' },
  45: { description: '霧', icon: '🌫', condition: 'cloudy' },
  48: { description: '霧氷', icon: '🌫', condition: 'cloudy' },
  51: { description: '小雨', icon: '🌦', condition: 'rainy' },
  53: { description: '雨', icon: '🌧', condition: 'rainy' },
  55: { description: '強い雨', icon: '🌧', condition: 'rainy' },
  61: { description: '小雨', icon: '🌦', condition: 'rainy' },
  63: { description: '雨', icon: '🌧', condition: 'rainy' },
  65: { description: '大雨', icon: '🌧', condition: 'rainy' },
  71: { description: '小雪', icon: '🌨', condition: 'snowy' },
  73: { description: '雪', icon: '❄️', condition: 'snowy' },
  75: { description: '大雪', icon: '❄️', condition: 'snowy' },
  77: { description: '霰', icon: '🌨', condition: 'snowy' },
  80: { description: 'にわか雨', icon: '🌦', condition: 'rainy' },
  81: { description: 'にわか雨', icon: '🌧', condition: 'rainy' },
  82: { description: '激しいにわか雨', icon: '⛈', condition: 'rainy' },
  85: { description: 'にわか雪', icon: '🌨', condition: 'snowy' },
  86: { description: '激しいにわか雪', icon: '❄️', condition: 'snowy' },
  95: { description: '雷雨', icon: '⛈', condition: 'rainy' },
  96: { description: '雷雨（雹）', icon: '⛈', condition: 'rainy' },
  99: { description: '激しい雷雨', icon: '⛈', condition: 'rainy' },
};

export async function fetchWeather(latitude: number, longitude: number): Promise<WeatherData | null> {
  // 座標値バリデーション
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    const current = data.current;
    if (!current) return null;

    const code = current.weather_code ?? 0;
    const temp = current.temperature_2m;
    const weather = WMO_CODES[code] ?? { description: '---', icon: '🌈', condition: 'unknown' as const };

    return {
      temperature: Number.isFinite(temp) ? Math.round(temp) : 0,
      description: weather.description,
      icon: weather.icon,
      weatherCode: code,
      condition: weather.condition,
    };
  } catch {
    return null;
  }
}
