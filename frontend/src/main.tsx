import ReactDOM from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import App from './App';
import './styles/globals.css';
import './styles/animations.css';
import { reportWebVitals } from './utils/reportWebVitals';

// Capacitor ネイティブ初期化
if (Capacitor.isNativePlatform()) {
  StatusBar.setStyle({ style: Style.Light });
  SplashScreen.hide();
} else if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  // Web開発時のみ: Service Workerを削除
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => registration.unregister());
  });
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => caches.delete(cacheName));
    });
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
);

// Web Vitalsのパフォーマンス計測
if (import.meta.env.DEV) {
  reportWebVitals(() => {
    // Web Vitals metrics would be logged here in production
  });
}