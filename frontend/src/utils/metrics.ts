/**
 * メトリクス収集用のユーティリティ
 * A/Bテストやアナリティクスで使用
 */

export interface MetricsEvent {
  name: string;
  timestamp: number;
  properties?: Record<string, unknown>;
}

/**
 * イベントをトラッキングする関数
 * 実際の環境では、Google Analytics、Mixpanel、Amplitudeなどに送信
 */
export function trackEvent(event: MetricsEvent): void {
  // TODO: 本番環境では実際のアナリティクスサービスに送信
  if (process.env.NODE_ENV === 'development') {
    void event;
  }
}

/**
 * ページビューをトラッキング
 */
export function trackPageView(page: string, properties?: Record<string, unknown>): void {
  trackEvent({
    name: 'page_view',
    timestamp: Date.now(),
    properties: {
      page,
      ...properties
    }
  });
}

/**
 * エラーをトラッキング
 */
export function trackError(error: Error, context?: Record<string, unknown>): void {
  trackEvent({
    name: 'error',
    timestamp: Date.now(),
    properties: {
      error_message: error.message,
      error_stack: error.stack,
      ...context
    }
  });
}