import { useState, useEffect } from 'react';
import { useGeolocation } from './useGeolocation';
import { fetchWeather, WeatherData } from '../services/weatherService';

export function useWeather() {
  const { position, loading: geoLoading } = useGeolocation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  // lat/lon を個別に依存配列に入れて参照比較問題を回避
  const lat = position?.lat;
  const lon = position?.lon;

  useEffect(() => {
    if (lat == null || lon == null) return;

    let cancelled = false;
    setLoading(true);

    fetchWeather(lat, lon)
      .then((data) => {
        if (!cancelled) {
          setWeather(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [lat, lon]);

  return {
    weather,
    position,
    loading: geoLoading || loading,
    isDemoMode: position?.isDemoMode ?? false,
  };
}
