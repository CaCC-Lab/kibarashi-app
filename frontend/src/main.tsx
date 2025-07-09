import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import './styles/animations.css';
import { reportWebVitals } from './utils/reportWebVitals';

// 開発時にService Workerを完全に削除
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      console.log('🗑️ Unregistering Service Worker:', registration);
      registration.unregister();
    });
  });
  
  // 全てのキャッシュを削除
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        console.log('🗑️ Deleting cache:', cacheName);
        caches.delete(cacheName);
      });
    });
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
);

// Web Vitalsのパフォーマンス計測
if (import.meta.env.DEV) {
  reportWebVitals(console.log);
}