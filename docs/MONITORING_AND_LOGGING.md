# 監視・ログ設定ドキュメント

## 概要
5分気晴らしアプリケーションの監視とログ設定に関するガイドです。本番環境の安定稼働とトラブルシューティングのために必要な設定をまとめています。

## 目次
1. [監視設定](#監視設定)
2. [ログ設定](#ログ設定)
3. [アラート設定](#アラート設定)
4. [メトリクス収集](#メトリクス収集)
5. [ダッシュボード](#ダッシュボード)

---

## 監視設定

### Vercel Analytics

Vercelの標準Analytics機能を使用して基本的な監視を実施。

#### 設定方法
1. Vercelダッシュボードで対象プロジェクトを選択
2. "Analytics"タブを開く
3. "Enable Analytics"をクリック

#### 監視項目
- ページビュー数
- ユニークビジター数
- リファラー
- デバイス種別
- 地域分布

### Web Vitals監視

ユーザー体験の品質を測定する重要指標を監視。

```javascript
// frontend/src/utils/webVitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export function reportWebVitals() {
  getCLS(console.log);  // Cumulative Layout Shift
  getFID(console.log);  // First Input Delay
  getFCP(console.log);  // First Contentful Paint
  getLCP(console.log);  // Largest Contentful Paint
  getTTFB(console.log); // Time to First Byte
}
```

### API監視

#### ヘルスチェックエンドポイント
```javascript
// api/health.js
export default (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || 'unknown'
  };
  
  res.status(200).json(health);
};
```

#### 外形監視設定（Uptime Robot等）
- エンドポイント: `https://your-domain.vercel.app/api/health`
- 監視間隔: 5分
- タイムアウト: 30秒
- アラート条件: 2回連続失敗

---

## ログ設定

### Vercel Functions ログ

#### ログレベル
```javascript
// api/v1/suggestions.js
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const currentLevel = process.env.LOG_LEVEL || 'INFO';

function log(level, message, data = {}) {
  if (LOG_LEVELS[level] <= LOG_LEVELS[currentLevel]) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...data
    }));
  }
}
```

#### 構造化ログの実装
```javascript
// すべてのAPIエンドポイントで使用
export default async (req, res) => {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  
  log('INFO', 'Request received', {
    requestId,
    method: req.method,
    path: req.url,
    query: req.query,
    headers: {
      'user-agent': req.headers['user-agent'],
      'x-forwarded-for': req.headers['x-forwarded-for']
    }
  });
  
  try {
    // APIロジック
    const result = await processRequest(req);
    
    log('INFO', 'Request completed', {
      requestId,
      duration: Date.now() - startTime,
      status: 200
    });
    
    res.status(200).json(result);
  } catch (error) {
    log('ERROR', 'Request failed', {
      requestId,
      duration: Date.now() - startTime,
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code
      }
    });
    
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
```

### フロントエンドログ

#### エラー境界の実装
```typescript
// frontend/src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo } from 'react';

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<{children: React.ReactNode}, State> {
  state: State = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // ログサービスに送信
    console.error('ErrorBoundary caught:', {
      error: error.toString(),
      errorInfo: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>申し訳ございません。エラーが発生しました。</h2>
          <button onClick={() => window.location.reload()}>
            ページを再読み込み
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

#### グローバルエラーハンドラー
```javascript
// frontend/src/utils/errorHandler.ts
window.addEventListener('error', (event) => {
  console.error('Global error:', {
    message: event.message,
    source: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error?.stack,
    timestamp: new Date().toISOString()
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', {
    reason: event.reason,
    promise: event.promise,
    timestamp: new Date().toISOString()
  });
});
```

---

## アラート設定

### 重要度レベル

| レベル | 説明 | 対応時間 |
|--------|------|----------|
| Critical | サービス全体の停止 | 即時 |
| High | 主要機能の障害 | 30分以内 |
| Medium | 一部機能の不具合 | 営業時間内 |
| Low | パフォーマンス低下 | 計画的対応 |

### アラート条件

#### APIエラー率
```javascript
// 閾値設定
const ERROR_RATE_THRESHOLDS = {
  critical: 0.5,  // 50%以上のエラー
  high: 0.2,      // 20%以上のエラー
  medium: 0.1,    // 10%以上のエラー
  low: 0.05       // 5%以上のエラー
};

// 5分間のウィンドウでエラー率を計算
function calculateErrorRate(logs) {
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  const recentLogs = logs.filter(log => log.timestamp > fiveMinutesAgo);
  const errors = recentLogs.filter(log => log.level === 'ERROR');
  return errors.length / recentLogs.length;
}
```

#### レスポンスタイム
- P95 > 3秒: Medium アラート
- P95 > 5秒: High アラート
- P95 > 10秒: Critical アラート

#### Gemini API制限
- レート制限の80%到達: Low アラート
- レート制限の90%到達: Medium アラート
- レート制限到達: High アラート

---

## メトリクス収集

### カスタムメトリクス

```javascript
// api/utils/metrics.js
class MetricsCollector {
  constructor() {
    this.metrics = {
      apiCalls: 0,
      apiErrors: 0,
      suggestionRequests: {},
      ttsCalls: 0,
      responseTime: []
    };
  }
  
  recordApiCall(endpoint, duration, status) {
    this.metrics.apiCalls++;
    
    if (status >= 400) {
      this.metrics.apiErrors++;
    }
    
    if (endpoint === '/api/v1/suggestions') {
      const key = `${req.query.situation}_${req.query.duration}`;
      this.metrics.suggestionRequests[key] = 
        (this.metrics.suggestionRequests[key] || 0) + 1;
    }
    
    this.metrics.responseTime.push({
      endpoint,
      duration,
      timestamp: Date.now()
    });
    
    // 1時間以上前のデータを削除
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    this.metrics.responseTime = this.metrics.responseTime.filter(
      m => m.timestamp > oneHourAgo
    );
  }
  
  getMetrics() {
    return {
      ...this.metrics,
      avgResponseTime: this.calculateAverage(this.metrics.responseTime),
      p95ResponseTime: this.calculatePercentile(this.metrics.responseTime, 0.95),
      errorRate: this.metrics.apiErrors / this.metrics.apiCalls
    };
  }
}

export const metrics = new MetricsCollector();
```

### ビジネスメトリクス

```javascript
// 追跡する主要指標
const businessMetrics = {
  // ユーザーエンゲージメント
  dailyActiveUsers: 0,
  sessionDuration: [],
  suggestionsViewed: 0,
  suggestionsWithAudio: 0,
  
  // 利用パターン
  popularSituations: {},
  popularDurations: {},
  peakUsageTimes: [],
  
  // 技術指標
  pwaInstalls: 0,
  offlineUsage: 0,
  errorsByType: {}
};
```

---

## ダッシュボード

### Vercel ダッシュボード活用

#### Functions タブ
- 実行回数
- エラー率
- 実行時間
- メモリ使用量

#### Logs タブ
- リアルタイムログ
- エラーフィルタリング
- ログ検索

### カスタムダッシュボード構成案

```typescript
// frontend/src/pages/admin/dashboard.tsx (Phase 2以降)
interface DashboardMetrics {
  // リアルタイムメトリクス
  activeUsers: number;
  requestsPerMinute: number;
  errorRate: number;
  avgResponseTime: number;
  
  // 集計メトリクス
  dailyStats: {
    totalRequests: number;
    uniqueUsers: number;
    popularSuggestions: Array<{
      title: string;
      count: number;
    }>;
  };
  
  // システムステータス
  systemHealth: {
    api: 'healthy' | 'degraded' | 'down';
    geminiApi: 'healthy' | 'degraded' | 'down';
    tts: 'healthy' | 'degraded' | 'down';
  };
}
```

### 監視画面レイアウト

```
┌─────────────────────────────────────────┐
│  5分気晴らし 監視ダッシュボード          │
├─────────────┬───────────────────────────┤
│ システム    │ API: ✅  Gemini: ✅       │
│ ステータス  │ TTS: ✅  DB: N/A         │
├─────────────┼───────────────────────────┤
│ リアルタイム│ アクティブユーザー: 42    │
│ メトリクス  │ リクエスト/分: 156        │
│             │ エラー率: 0.2%            │
│             │ 平均応答時間: 234ms       │
├─────────────┼───────────────────────────┤
│ 本日の統計  │ 総リクエスト: 12,345      │
│             │ ユニークユーザー: 3,456   │
│             │ 人気の状況: 職場(65%)     │
└─────────────┴───────────────────────────┘
```

---

## ログ保存とローテーション

### ログ保存ポリシー
- エラーログ: 30日間保存
- アクセスログ: 7日間保存  
- デバッグログ: 24時間保存

### ログのエクスポート
```bash
# Vercel CLIを使用したログのエクスポート
vercel logs --output logs/$(date +%Y%m%d).log

# 定期的なバックアップスクリプト
#!/bin/bash
DATE=$(date +%Y%m%d)
vercel logs --since 24h --output logs/daily_$DATE.log
gzip logs/daily_$DATE.log
```

---

## セキュリティ考慮事項

### センシティブ情報のマスキング
```javascript
function sanitizeLog(data) {
  const sensitiveKeys = ['apiKey', 'token', 'password', 'email'];
  const sanitized = { ...data };
  
  sensitiveKeys.forEach(key => {
    if (sanitized[key]) {
      sanitized[key] = '[REDACTED]';
    }
  });
  
  return sanitized;
}
```

### IPアドレスの匿名化
```javascript
function anonymizeIP(ip) {
  const parts = ip.split('.');
  if (parts.length === 4) {
    parts[3] = '0';
    return parts.join('.');
  }
  return ip;
}
```

---

## トラブルシューティング

### ログが表示されない
1. Vercelダッシュボードでプロジェクトを確認
2. Function名が正しいか確認
3. console.log()ではなくconsole.error()を使用してみる

### メトリクスが正しくない
1. タイムゾーンの設定を確認
2. 集計ロジックの確認
3. キャッシュのクリア

### アラートが発火しない
1. 閾値設定の確認
2. 通知先の設定確認
3. アラート履歴の確認

---

## 今後の拡張計画

### Phase 2での追加項目
- Google Cloud Logging統合
- カスタムメトリクスのPrometheus形式エクスポート
- Grafanaダッシュボード
- 異常検知の自動化

### Phase 3での追加項目
- 分散トレーシング（OpenTelemetry）
- ユーザー行動分析
- A/Bテスト結果の可視化
- 予測分析

最終更新: 2025-07-09