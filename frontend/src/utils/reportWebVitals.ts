import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

// Web Vitalsのメトリクスをコンソールに出力
export const reportWebVitals = (onPerfEntry?: (metric: any) => void) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    onCLS(onPerfEntry);
    onINP(onPerfEntry); // FIDの代わりにINPを使用（v5での変更）
    onFCP(onPerfEntry);
    onLCP(onPerfEntry);
    onTTFB(onPerfEntry);
  }
};