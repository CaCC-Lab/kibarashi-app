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
  // 開発環境でのデバッグ用処理
  if (process.env.NODE_ENV === 'development') {
    // Metrics tracking would go here in development
  }

  // TODO: 本番環境では実際のアナリティクスサービスに送信
  // 例：
  // if (window.gtag) {
  //   window.gtag('event', event.name, {
  //     event_category: 'AB_Test',
  //     event_label: event.properties?.variant,
  //     value: event.properties?.value,
  //     ...event.properties
  //   });
  // }
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