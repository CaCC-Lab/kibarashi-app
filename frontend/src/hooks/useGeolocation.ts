import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

export interface GeoPosition {
  lat: number;
  lon: number;
  isDemoMode: boolean;
}

// デモモード用デフォルト位置（東京駅）
const DEMO_POSITION: GeoPosition = { lat: 35.6812, lon: 139.7671, isDemoMode: true };

export function useGeolocation() {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function getPosition() {
      try {
        if (Capacitor.isNativePlatform()) {
          const perm = await Geolocation.checkPermissions();
          if (perm.location === 'denied') {
            const req = await Geolocation.requestPermissions();
            if (req.location === 'denied') {
              if (!cancelled) setPosition(DEMO_POSITION);
              return;
            }
          }
          const pos = await Geolocation.getCurrentPosition({ timeout: 10000 });
          if (!cancelled) {
            setPosition({ lat: pos.coords.latitude, lon: pos.coords.longitude, isDemoMode: false });
          }
        } else if ('geolocation' in navigator) {
          // Web ブラウザ
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              if (!cancelled) {
                setPosition({ lat: pos.coords.latitude, lon: pos.coords.longitude, isDemoMode: false });
              }
            },
            () => {
              if (!cancelled) setPosition(DEMO_POSITION);
            },
            { timeout: 10000 }
          );
          return; // callback ベースなので finally は不要
        } else {
          if (!cancelled) setPosition(DEMO_POSITION);
        }
      } catch {
        if (!cancelled) setPosition(DEMO_POSITION);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    getPosition();
    return () => { cancelled = true; };
  }, []);

  return { position, loading };
}
