import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

export interface GeoPosition {
  lat: number;
  lon: number;
}

export function useGeolocation() {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function getPosition() {
      try {
        if (Capacitor.isNativePlatform()) {
          const perm = await Geolocation.checkPermissions();
          if (perm.location === 'denied') {
            const req = await Geolocation.requestPermissions();
            if (req.location === 'denied') {
              setError('位置情報の権限がありません');
              setLoading(false);
              return;
            }
          }
        }

        const pos = await Geolocation.getCurrentPosition({ timeout: 10000 });
        if (!cancelled) {
          setPosition({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        }
      } catch (e) {
        // Web でもブラウザ Geolocation API にフォールバック
        if (!Capacitor.isNativePlatform() && 'geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              if (!cancelled) {
                setPosition({ lat: pos.coords.latitude, lon: pos.coords.longitude });
              }
            },
            () => {
              if (!cancelled) setError('位置情報を取得できませんでした');
            },
            { timeout: 10000 }
          );
          return;
        }
        if (!cancelled) setError('位置情報を取得できませんでした');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    getPosition();
    return () => { cancelled = true; };
  }, []);

  return { position, loading, error };
}
