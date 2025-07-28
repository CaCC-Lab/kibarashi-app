/**
 * メトリクスとA/Bテスト用の型定義
 */

// A/Bテストのメトリクスデータ型
export interface ABTestMetricData {
  [key: string]: string | number | boolean | undefined;
  testGroup?: string;
  timestamp?: number;
  sessionId?: string;
  userId?: string;
}

// Web Vitalsのメトリクス型
export interface WebVitalsMetric {
  id: string;
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  entries: PerformanceEntry[];
  navigationType: 'navigate' | 'reload' | 'back_forward' | 'prerender';
}

// メトリクスイベント型
export interface MetricsEvent {
  name: string;
  timestamp: number;
  properties?: Record<string, unknown>;
}

// A/Bテストのトラッキング関数型
export type TrackMetricFunction = (metric: string, data?: ABTestMetricData) => void;