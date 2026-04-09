import { useState, useEffect } from 'react';
import { useGeolocation } from './useGeolocation';
import { fetchWeather, WeatherData } from '../services/weatherService';

export function useWeather() {
  const { position, loading: geoLoading } = useGeolocation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!position) return;

    let cancelled = false;
    setLoading(true);

    fetchWeather(position.lat, position.lon).then((data) => {
      if (!cancelled) {
        setWeather(data);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [position]);

  return {
    weather,
    position,
    loading: geoLoading || loading,
    isDemoMode: position?.isDemoMode ?? false,
  };
}
