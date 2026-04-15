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

    function done(pos: GeoPosition) {
      if (!cancelled) {
        setPosition(pos);
        setLoading(false);
      }
    }

    async function getPosition() {
      try {
        if (Capacitor.isNativePlatform()) {
          const perm = await Geolocation.checkPermissions();
          if (perm.location === 'denied') {
            const req = await Geolocation.requestPermissions();
            if (req.location === 'denied') {
              done(DEMO_POSITION);
              return;
            }
          }
          const pos = await Geolocation.getCurrentPosition({ timeout: 10000 });
          done({ lat: pos.coords.latitude, lon: pos.coords.longitude, isDemoMode: false });
        } else if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => done({ lat: pos.coords.latitude, lon: pos.coords.longitude, isDemoMode: false }),
            () => done(DEMO_POSITION),
            { timeout: 10000 }
          );
        } else {
          done(DEMO_POSITION);
        }
      } catch {
        done(DEMO_POSITION);
      }
    }

    getPosition();
    return () => { cancelled = true; };
  }, []);

  return { position, loading };
}
