import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export async function lightImpact(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await Haptics.impact({ style: ImpactStyle.Light });
  } else if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
    navigator.vibrate(30);
  }
}
