# 監視・ログ設定ガイド

このファイルは「5分気晴らし」アプリケーションの監視体制とログ設定を定義します。
サービスの安定稼働、プロアクティブな問題検知、パフォーマンス分析を目的とします。

## 目次

1. [監視・ログの目的](#監視ログの目的)
2. [ログの種類と収集場所](#ログの種類と収集場所)
3. [主要監視メトリクス](#主要監視メトリクス)
4. [アラート設定](#アラート設定)
5. [ログフォーマットと構造化](#ログフォーマットと構造化)
6. [監視ツールの設定](#監視ツールの設定)
7. [パフォーマンス監視](#パフォーマンス監視)
8. [セキュリティ監視](#セキュリティ監視)
9. [ログ保管・運用](#ログ保管運用)

## 監視・ログの目的

### 1. 事前検知（Proactive Detection）
- システム障害の予兆を早期発見
- パフォーマンス劣化の検知
- リソース枯渇の予防

### 2. 迅速な問題解決（Rapid Response）
- 障害発生時の原因特定時間の短縮
- 根本原因分析のためのデータ提供
- 復旧時間の最小化

### 3. ビジネス分析（Business Intelligence）
- ユーザー行動の分析
- 機能使用率の把握
- サービス改善のためのデータ収集

### 4. コンプライアンス（Compliance）
- セキュリティインシデントの追跡
- 監査証跡の保持
- プライバシー保護の確認

## ログの種類と収集場所

### 1. アクセスログ

#### フロントエンド（Vercel）
- **場所**: Vercel Analytics & Speed Insights
- **内容**: 
  - ページビュー、ユニークユーザー数
  - Core Web Vitals (LCP, FID, CLS)
  - 地理的分布、デバイス情報
  - リアルユーザーモニタリング（RUM）データ

```javascript
// Vercel Analytics設定（frontend/src/main.tsx）
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

function App() {
  return (
    <>
      <MainApp />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
```

#### バックエンド（Express.js + Winston）
- **場所**: Google Cloud Logging / Vercel Functions Logs
- **フォーマット**: 構造化JSON
- **ツール**: Winston + Morgan

```javascript
// backend/src/utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'kibarashi-backend',
    version: process.env.npm_package_version
  },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});
```

### 2. アプリケーションログ

#### バックエンド詳細ログ

```javascript
// APIリクエスト/レスポンスログ
{
  "timestamp": "2025-01-07T12:00:00.000Z",
  "level": "info",
  "message": "API request processed",
  "requestId": "req_123456789",
  "method": "GET",
  "path": "/api/v1/suggestions",
  "statusCode": 200,
  "responseTime": 245,
  "userAgent": "Mozilla/5.0...",
  "clientIP": "192.168.1.100",
  "params": {
    "situation": "workplace",
    "duration": 5
  },
  "response": {
    "suggestionsCount": 3,
    "source": "gemini"
  }
}
```

#### ビジネスロジックログ

```javascript
// 気晴らし提案生成ログ
{
  "timestamp": "2025-01-07T12:00:01.123Z",
  "level": "info",
  "message": "Suggestion generation completed",
  "requestId": "req_123456789",
  "geminiApiKey": "key_1",
  "promptTokens": 150,
  "responseTokens": 300,
  "duration": 1200,
  "suggestions": [
    {"id": "sug_1", "category": "cognitive"},
    {"id": "sug_2", "category": "behavioral"},
    {"id": "sug_3", "category": "cognitive"}
  ]
}
```

### 3. 外部API連携ログ

#### Gemini API

```javascript
// Gemini API呼び出しログ
{
  "timestamp": "2025-01-07T12:00:00.500Z",
  "level": "info",
  "message": "Gemini API request",
  "requestId": "req_123456789",
  "apiKey": "gemini_key_1",
  "model": "gemini-pro",
  "request": {
    "situation": "workplace",
    "duration": 5,
    "promptLength": 250
  },
  "response": {
    "success": true,
    "tokensUsed": 450,
    "responseTime": 1100,
    "suggestionsGenerated": 3
  }
}
```

#### Google TTS API

```javascript
// TTS API呼び出しログ
{
  "timestamp": "2025-01-07T12:00:02.000Z",
  "level": "info",
  "message": "TTS generation completed",
  "requestId": "req_123456789",
  "textLength": 120,
  "languageCode": "ja-JP",
  "voiceName": "ja-JP-Neural2-B",
  "audioFormat": "mp3",
  "duration": 800,
  "cacheStatus": "miss",
  "audioFileSize": 15360
}
```

### 4. エラーログ

```javascript
// 構造化エラーログ
{
  "timestamp": "2025-01-07T12:00:03.000Z",
  "level": "error",
  "message": "Gemini API rate limit exceeded",
  "requestId": "req_123456789",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "apiKey": "gemini_key_1",
    "retryAfter": 60,
    "stack": "Error: Rate limit exceeded\n    at GeminiClient.generate..."
  },
  "context": {
    "situation": "workplace",
    "duration": 5,
    "fallbackUsed": true
  }
}
```

## 主要監視メトリクス

### 1. フロントエンド（Vercel Analytics）

#### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5秒
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

#### ユーザー体験指標
- **ページビュー**: 日次/週次トレンド
- **ユニークユーザー**: セッション分析
- **離脱率**: ページ別離脱率
- **コンバージョン**: 提案生成完了率

### 2. バックエンド（Cloud Monitoring）

#### システムメトリクス
- **CPU使用率**: 平均・最大値
- **メモリ使用率**: 平均・最大値、ガベージコレクション頻度
- **ディスク使用率**: 使用量・I/O待機時間

#### アプリケーションメトリクス
- **APIレスポンスタイム**:
  - P50: < 200ms
  - P95: < 500ms  
  - P99: < 1000ms
- **スループット**: リクエスト/秒
- **エラーレート**: 4xx/5xxレスポンス率

```javascript
// カスタムメトリクス収集（backend/src/middleware/metrics.ts）
import prometheus from 'prom-client';

const httpDuration = new prometheus.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 5, 15, 50, 100, 500]
});

const httpRequests = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

export const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const route = req.route?.path || req.path;
    
    httpDuration
      .labels(req.method, route, res.statusCode)
      .observe(duration);
      
    httpRequests
      .labels(req.method, route, res.statusCode)
      .inc();
  });
  
  next();
};
```

### 3. 外部API監視

#### Gemini API
- **レスポンス時間**: P50/P95/P99
- **エラーレート**: API呼び出し失敗率
- **レート制限**: キー別使用状況
- **コスト**: トークン使用量・料金

#### Google TTS API
- **レスポンス時間**: 音声生成時間
- **キャッシュヒット率**: 既存音声の再利用率
- **エラーレート**: 音声生成失敗率
- **データ転送量**: 音声ファイルサイズ

### 4. ビジネスメトリクス

```javascript
// ビジネスメトリクス例（backend/src/utils/businessMetrics.ts）
const suggestionMetrics = {
  totalSuggestionsGenerated: new prometheus.Counter({
    name: 'suggestions_generated_total',
    help: 'Total suggestions generated',
    labelNames: ['situation', 'duration', 'source']
  }),
  
  audioPlaybacks: new prometheus.Counter({
    name: 'audio_playbacks_total', 
    help: 'Total audio playbacks',
    labelNames: ['suggestion_id', 'completed']
  }),
  
  userSessions: new prometheus.Histogram({
    name: 'user_session_duration_seconds',
    help: 'User session duration',
    buckets: [30, 60, 120, 300, 600, 1200]
  })
};
```

## アラート設定

### 1. 即座対応が必要（Critical）

#### システム停止
- **条件**: HTTPステータス5xxが1分間に50%以上
- **通知**: Slack #alerts + メール + SMS
- **エスカレーション**: 5分以内に対応なしで管理者通知

#### 外部API完全失敗
- **条件**: Gemini/TTS APIが5分間完全に応答なし
- **通知**: Slack #alerts + メール
- **対応**: フォールバック機能の動作確認

### 2. 注意が必要（Warning）

#### パフォーマンス劣化
- **条件**: APIレスポンスタイムP95が2000msを超過
- **通知**: Slack #monitoring
- **期間**: 5分間継続

#### エラーレート上昇
- **条件**: 4xx/5xxエラーが全体の5%を超過
- **通知**: Slack #monitoring
- **期間**: 10分間継続

#### 外部API制限接近
- **条件**: Gemini APIエラーレートが10%を超過
- **通知**: Slack #monitoring
- **対応**: APIキーローテーション検討

### 3. 情報提供（Info）

#### リソース使用量
- **条件**: CPU/メモリ使用率が80%を超過
- **通知**: Slack #monitoring
- **期間**: 30分間継続

#### 異常なトラフィック
- **条件**: 通常の3倍以上のアクセス
- **通知**: Slack #monitoring
- **目的**: スケーリング検討

### アラート設定例（Google Cloud Monitoring）

```yaml
# alerting-policy.yaml
displayName: "High Error Rate"
conditions:
  - displayName: "HTTP 5xx Error Rate"
    conditionThreshold:
      filter: 'resource.type="cloud_function"'
      comparison: COMPARISON_GREATER_THAN
      thresholdValue: 0.05  # 5%
      duration: 300s  # 5分
aggregations:
  - alignmentPeriod: 60s
    perSeriesAligner: ALIGN_RATE
    crossSeriesReducer: REDUCE_MEAN

notificationChannels:
  - "projects/PROJECT_ID/notificationChannels/SLACK_CHANNEL_ID"
  - "projects/PROJECT_ID/notificationChannels/EMAIL_CHANNEL_ID"
```

## ログフォーマットと構造化

### 統一ログフォーマット

```javascript
// 標準ログエントリ構造
{
  // 必須フィールド
  "timestamp": "2025-01-07T12:00:00.000Z",
  "level": "info|warn|error|debug",
  "message": "Human readable message",
  "service": "kibarashi-frontend|backend",
  "version": "1.0.0",
  
  // リクエスト追跡
  "requestId": "req_123456789",
  "sessionId": "sess_987654321",
  "userId": "user_555666777", // Phase 2で追加
  
  // コンテキスト情報
  "context": {
    "feature": "suggestion|tts|general",
    "environment": "development|production",
    "clientIP": "192.168.1.100",
    "userAgent": "Mozilla/5.0..."
  },
  
  // パフォーマンス
  "performance": {
    "duration": 245,
    "memory": 67108864,
    "cpuTime": 50
  },
  
  // エラー情報（エラーレベルのみ）
  "error": {
    "code": "GEMINI_API_ERROR",
    "message": "Rate limit exceeded",
    "stack": "Error: Rate limit...",
    "cause": "external_api_failure"
  },
  
  // カスタムフィールド
  "custom": {
    "apiKey": "gemini_key_1",
    "suggestionsCount": 3,
    "cacheHit": true
  }
}
```

### ログレベル使い分け

```javascript
// DEBUG: 開発時の詳細情報
logger.debug('Processing suggestion request', {
  requestId,
  inputParams: { situation, duration },
  selectedPromptTemplate: 'workplace_5min'
});

// INFO: 正常な処理フロー
logger.info('Suggestion generated successfully', {
  requestId,
  suggestionsCount: 3,
  source: 'gemini',
  duration: 1200
});

// WARN: 注意が必要だが動作は継続
logger.warn('Gemini API slow response', {
  requestId,
  responseTime: 3500,
  threshold: 2000,
  apiKey: 'gemini_key_1'
});

// ERROR: エラーが発生したが回復可能
logger.error('TTS generation failed, using fallback', {
  requestId,
  error: error.message,
  fallbackUsed: true,
  text: text.substring(0, 50) + '...'
});

// FATAL: システムが継続できない致命的エラー
logger.fatal('Database connection lost', {
  error: error.message,
  stack: error.stack,
  connectionString: 'postgres://***masked***'
});
```

## 監視ツールの設定

### 1. Sentry（エラー監視とパフォーマンス）

#### フロントエンド設定

```javascript
// frontend/src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

// コンポーネントエラー境界
function App() {
  return (
    <Sentry.ErrorBoundary fallback={ErrorFallback}>
      <MainApp />
    </Sentry.ErrorBoundary>
  );
}
```

#### バックエンド設定

```javascript
// backend/src/server.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// エラーハンドラー（最後に配置）
app.use(Sentry.Handlers.errorHandler());
```

### 2. Google Cloud Monitoring

```javascript
// backend/src/utils/cloudMonitoring.ts
import { Monitoring } from '@google-cloud/monitoring';

const monitoring = new Monitoring.MetricServiceClient();

export async function createCustomMetric(metricType: string, value: number, labels: Record<string, string>) {
  const projectPath = monitoring.projectPath(process.env.GOOGLE_CLOUD_PROJECT_ID);
  
  const dataPoint = {
    interval: {
      endTime: { seconds: Date.now() / 1000 }
    },
    value: { doubleValue: value }
  };
  
  const timeSeries = {
    metric: {
      type: `custom.googleapis.com/${metricType}`,
      labels
    },
    resource: {
      type: 'global',
      labels: { project_id: process.env.GOOGLE_CLOUD_PROJECT_ID }
    },
    points: [dataPoint]
  };
  
  await monitoring.createTimeSeries({
    name: projectPath,
    timeSeries: [timeSeries]
  });
}
```

## パフォーマンス監視

### 1. Real User Monitoring (RUM)

```javascript
// frontend/src/utils/rum.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics({ name, value, id }) {
  gtag('event', name, {
    value: Math.round(name === 'CLS' ? value * 1000 : value),
    event_label: id,
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### 2. Synthetic Monitoring

```javascript
// monitoring/synthetic-tests.js
const { chromium } = require('playwright');

async function healthCheck() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    const start = Date.now();
    await page.goto('https://your-app.vercel.app');
    
    // 提案取得フロー
    await page.click('[data-testid="situation-workplace"]');
    await page.click('[data-testid="duration-5"]');
    await page.click('[data-testid="get-suggestions"]');
    
    await page.waitForSelector('[data-testid="suggestion-card"]');
    const duration = Date.now() - start;
    
    console.log(`Health check completed in ${duration}ms`);
    
    // メトリクス送信
    await sendMetricToCloudMonitoring('synthetic_health_check', duration);
    
  } catch (error) {
    console.error('Health check failed:', error);
    await sendAlertToSlack('Health check failure', error.message);
  } finally {
    await browser.close();
  }
}

// 5分おきに実行
setInterval(healthCheck, 5 * 60 * 1000);
```

## セキュリティ監視

### 1. 異常なアクセスパターン

```javascript
// backend/src/middleware/securityMonitoring.ts
const suspiciousRequests = new Map();

export function securityMonitoring(req, res, next) {
  const clientIP = req.ip;
  const path = req.path;
  
  // レート制限監視
  const requests = suspiciousRequests.get(clientIP) || [];
  requests.push({ path, timestamp: Date.now() });
  
  // 1分以内に20リクエスト以上
  const recentRequests = requests.filter(r => Date.now() - r.timestamp < 60000);
  if (recentRequests.length > 20) {
    logger.warn('Suspicious request rate detected', {
      clientIP,
      requestCount: recentRequests.length,
      paths: recentRequests.map(r => r.path)
    });
  }
  
  suspiciousRequests.set(clientIP, recentRequests);
  
  // 異常なパスアクセス
  if (path.includes('../') || path.includes('.env') || path.includes('admin')) {
    logger.error('Suspicious path access', {
      clientIP,
      path,
      userAgent: req.headers['user-agent']
    });
  }
  
  next();
}
```

### 2. APIキー使用状況監視

```javascript
// backend/src/services/gemini/securityMonitor.ts
const apiKeyUsage = new Map();

export function monitorApiKeyUsage(apiKey: string, requestCount: number) {
  const usage = apiKeyUsage.get(apiKey) || { requests: 0, lastReset: Date.now() };
  
  // 1時間ごとにリセット
  if (Date.now() - usage.lastReset > 3600000) {
    usage.requests = 0;
    usage.lastReset = Date.now();
  }
  
  usage.requests += requestCount;
  apiKeyUsage.set(apiKey, usage);
  
  // 異常な使用量を検知
  if (usage.requests > 1000) { // 1時間に1000リクエスト以上
    logger.warn('Unusual API key usage detected', {
      apiKey: apiKey.substring(0, 10) + '***',
      requests: usage.requests,
      timeWindow: '1 hour'
    });
  }
}
```

## ログ保管・運用

### 1. ログローテーション

```javascript
// backend/src/utils/logRotation.ts
import winston from 'winston';
import 'winston-daily-rotate-file';

const transport = new winston.transports.DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d' // 14日間保存
});
```

### 2. ログ分析クエリ例

```sql
-- Cloud Logging クエリ例

-- 1. エラーレートの分析
SELECT
  timestamp,
  severity,
  jsonPayload.error.code as error_code,
  COUNT(*) as error_count
FROM `project.logs.stdout`
WHERE severity = "ERROR"
  AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR)
GROUP BY timestamp, severity, error_code
ORDER BY timestamp DESC;

-- 2. レスポンス時間の分析
SELECT
  jsonPayload.method,
  jsonPayload.path,
  AVG(jsonPayload.responseTime) as avg_response_time,
  MAX(jsonPayload.responseTime) as max_response_time,
  COUNT(*) as request_count
FROM `project.logs.stdout`
WHERE jsonPayload.responseTime IS NOT NULL
  AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR)
GROUP BY jsonPayload.method, jsonPayload.path
ORDER BY avg_response_time DESC;

-- 3. Gemini API使用状況
SELECT
  jsonPayload.apiKey,
  COUNT(*) as requests,
  AVG(jsonPayload.response.tokensUsed) as avg_tokens,
  SUM(jsonPayload.response.tokensUsed) as total_tokens
FROM `project.logs.stdout`
WHERE jsonPayload.message LIKE "%Gemini API%"
  AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 DAY)
GROUP BY jsonPayload.apiKey;
```

### 3. ログ保管ポリシー

| ログタイプ | 保管期間 | 保管場所 | アクセス制御 |
|-----------|----------|----------|-------------|
| アクセスログ | 90日 | Cloud Logging | 開発チーム |
| アプリケーションログ | 30日 | Cloud Logging | 開発チーム |
| エラーログ | 1年 | Cloud Storage | 管理者のみ |
| セキュリティログ | 1年 | Cloud Storage | セキュリティチーム |
| 監査ログ | 3年 | Cloud Storage | 監査役のみ |

### 4. 運用手順

#### 日次チェック
1. **エラーレート確認**: 前日の5xxエラー率が1%以下か確認
2. **パフォーマンス確認**: P95レスポンス時間が基準値以下か確認
3. **外部API状況**: Gemini/TTS APIのエラーレートと使用量確認

#### 週次レビュー
1. **トレンド分析**: ユーザー数、リクエスト数の週次比較
2. **コスト分析**: 外部API使用料金の推移確認
3. **容量計画**: リソース使用量の将来予測

#### 月次レポート
1. **SLA達成率**: 可用性、パフォーマンス目標の達成状況
2. **インシデント分析**: 発生した問題の原因と対策
3. **改善提案**: 監視体制の改善点

---

## チェックリスト

### 実装チェック
- [ ] Winston/Morgan ログ設定完了
- [ ] Sentry エラー監視設定完了
- [ ] Vercel Analytics 設定完了
- [ ] Cloud Monitoring メトリクス設定完了
- [ ] アラート通知先設定完了

### 運用チェック
- [ ] 日次監視手順書作成
- [ ] インシデント対応手順書作成
- [ ] エスカレーション連絡先一覧作成
- [ ] ログ分析ダッシュボード作成
- [ ] 定期レポート形式決定

---

最終更新: 2025-01-07