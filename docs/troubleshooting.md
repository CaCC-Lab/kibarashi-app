# トラブルシューティングガイド

このファイルは「5分気晴らし」アプリケーションで発生する可能性のある問題の診断と解決手順を記載します。
問題発生時は、このガイドに従って体系的に問題を特定・解決してください。

## 目次

1. [一般的なトラブルシューティング手順](#一般的なトラブルシューティング手順)
2. [フロントエンド関連](#フロントエンド関連)
3. [バックエンド関連](#バックエンド関連)
4. [外部API関連](#外部api関連)
5. [デプロイメント関連](#デプロイメント関連)
6. [パフォーマンス問題](#パフォーマンス問題)
7. [セキュリティ関連](#セキュリティ関連)
8. [ツールとユーティリティ](#ツールとユーティリティ)

## 一般的なトラブルシューティング手順

### 🔍 問題の初期診断

#### 1. 基本情報の収集
```bash
# システム情報
node --version
npm --version
docker --version

# アプリケーション状態
curl -f http://localhost:8080/health
curl -f https://your-app.vercel.app/health

# ログの確認
docker-compose logs -f
tail -f backend/logs/error.log
```

#### 2. 問題の分類

| 症状 | 分類 | 確認箇所 |
|------|------|----------|
| ページが表示されない | フロントエンド | ブラウザコンソール、Vercel ログ |
| APIが応答しない | バックエンド | サーバーログ、ネットワーク |
| 提案が生成されない | 外部API | Gemini API ログ、レート制限 |
| 音声が再生されない | TTS/ブラウザ | TTS API、ブラウザ権限 |
| 表示が遅い | パフォーマンス | Core Web Vitals、ネットワーク |

#### 3. 緊急度の判定

| レベル | 症状 | 対応時間 | エスカレーション |
|--------|------|----------|-----------------|
| **Critical** | サービス完全停止 | 即座 | 管理者 + 開発チーム |
| **High** | 主要機能停止 | 30分以内 | 開発チーム |
| **Medium** | 部分機能停止 | 2時間以内 | 担当者 |
| **Low** | UI/UX問題 | 1日以内 | 定期対応 |

## フロントエンド関連

### 🚫 アプリケーションが起動しない

#### 症状
- `npm run dev` でエラーが発生
- ブラウザで真っ白ページが表示される
- ビルドが失敗する

#### 診断手順
```bash
# 1. 依存関係の確認
cd frontend
npm install
npm audit

# 2. TypeScript型チェック
npm run type-check

# 3. ESLint チェック
npm run lint

# 4. Vite キャッシュクリア
rm -rf node_modules/.vite
npm run dev
```

#### よくある原因と解決策

##### Node.js バージョンの不一致
```bash
# 症状: "unsupported engine" エラー
# 解決:
nvm install 20.10.0
nvm use 20.10.0
npm install
```

##### 型定義エラー
```typescript
// 症状: TypeScript コンパイルエラー
// 解決: 型定義ファイルの更新
npm install --save-dev @types/react@^18.2.0
npm install --save-dev @types/react-dom@^18.2.0
```

##### ポート競合
```bash
# 症状: "EADDRINUSE" エラー
# 確認:
lsof -i :3000
netstat -tulpn | grep :3000

# 解決:
kill -9 $(lsof -t -i:3000)
# または環境変数で別ポート指定
VITE_PORT=3001 npm run dev
```

### 🎨 スタイルが適用されない

#### Tailwind CSS の問題
```bash
# 1. Tailwind設定確認
npx tailwindcss --version

# 2. CSS ビルド確認
npm run build:css

# 3. Purge 設定確認
cat tailwind.config.js
```

#### 解決策
```javascript
// tailwind.config.js の確認
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./index.html"
  ],
  // ...
}
```

### 📱 PWA機能が動作しない

#### Service Worker の問題
```javascript
// ブラウザコンソールで確認
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('SW registrations:', registrations);
});

// Service Worker の再登録
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister());
});
```

#### マニフェストファイルの確認
```bash
# manifest.json の妥当性チェック
curl -s https://your-app.vercel.app/manifest.json | jq .

# PWA 設定の確認（Chrome DevTools）
# Application タブ > Manifest
```

## バックエンド関連

### 🚫 サーバーが起動しない

#### 環境変数の確認
```bash
# 1. 必須環境変数のチェック
cd backend
node scripts/check-env.js

# 2. .env ファイルの存在確認
ls -la .env*
cat .env.example
```

#### ポート/プロセス問題
```bash
# ポート使用状況の確認
lsof -i :8080
ps aux | grep node

# 強制終了
pkill -f "node.*server"
```

#### 依存関係の問題
```bash
# package-lock.json の再生成
rm -rf node_modules package-lock.json
npm install

# セキュリティ脆弱性の確認
npm audit
npm audit fix
```

### 🔌 データベース接続エラー（Phase 2以降）

#### PostgreSQL 接続問題
```bash
# 1. PostgreSQL コンテナの状態確認
docker-compose ps
docker-compose logs postgres

# 2. 接続テスト
psql postgresql://username:password@localhost:5432/dbname

# 3. 接続プールの確認
# backend/src/utils/database.ts でプール設定を確認
```

#### Redis 接続問題
```bash
# Redis コンテナの確認
docker-compose logs redis

# Redis CLI での接続テスト
redis-cli -h localhost -p 6379 ping
```

### 📊 APIエンドポイントが応答しない

#### 基本診断
```bash
# 1. ヘルスチェック
curl -f http://localhost:8080/health

# 2. 具体的なエンドポイントテスト
curl -X GET "http://localhost:8080/api/v1/suggestions?situation=workplace&duration=5"

# 3. レスポンスヘッダーの確認
curl -I http://localhost:8080/api/v1/suggestions
```

#### ルーティング問題
```javascript
// backend/src/api/routes/index.ts の確認
console.log('Registered routes:');
app._router.stack.forEach(layer => {
  if (layer.route) {
    console.log(`${Object.keys(layer.route.methods)} ${layer.route.path}`);
  }
});
```

## 外部API関連

### 🤖 Gemini API エラー

#### 認証問題
```bash
# APIキーの確認
echo $GEMINI_API_KEY | cut -c1-10
curl -H "Authorization: Bearer $GEMINI_API_KEY" \
     https://generativelanguage.googleapis.com/v1beta/models
```

#### レート制限
```javascript
// backend/src/services/gemini/client.ts
// レート制限の確認
const rateLimitStatus = {
  requestsPerMinute: process.env.GEMINI_RATE_LIMIT || 60,
  currentUsage: await getRateLimitUsage(),
  resetTime: await getRateLimitReset()
};
console.log('Rate limit status:', rateLimitStatus);
```

#### よくあるエラーと解決策

##### "API_KEY_INVALID"
```bash
# 原因: 無効なAPIキー
# 解決: Google AI Studio でキーを再生成
# https://aistudio.google.com/app/apikey
```

##### "RATE_LIMIT_EXCEEDED"
```javascript
// 原因: リクエスト制限超過
// 解決: 指数バックオフでリトライ実装
const retryWithBackoff = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.code === 'RATE_LIMIT_EXCEEDED' && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
};
```

### 🔊 Google TTS API エラー

#### 認証問題
```bash
# サービスアカウントキーの確認
cat $GOOGLE_APPLICATION_CREDENTIALS | jq .type
gcloud auth application-default print-access-token
```

#### 音声生成失敗
```javascript
// よくあるエラーパターン
const ttsErrors = {
  'INVALID_LANGUAGE_CODE': {
    cause: '対応していない言語コード',
    solution: 'ja-JP を使用する'
  },
  'TEXT_TOO_LONG': {
    cause: 'テキストが長すぎる',
    solution: 'テキストを5000文字以下に制限'
  },
  'QUOTA_EXCEEDED': {
    cause: '月間クォータ超過',
    solution: 'キャッシュ機能の強化、使用量監視'
  }
};
```

#### 音声再生問題
```javascript
// ブラウザでの音声再生権限
const checkAudioPermission = async () => {
  try {
    const audio = new Audio();
    audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmESBz6Y2u/NbCECVb7Y3Z9gHgo...';
    await audio.play();
    console.log('Audio permission: granted');
  } catch (error) {
    console.log('Audio permission: denied', error);
  }
};
```

## デプロイメント関連

### 🚀 Vercel デプロイ失敗

#### ビルドエラー
```bash
# ローカルでビルドテスト
cd frontend
npm run build

# ビルドサイズの確認
du -sh dist/
ls -la dist/assets/
```

#### 環境変数設定
```bash
# Vercel CLI で環境変数確認
vercel env ls

# 環境変数の追加
vercel env add GEMINI_API_KEY
```

#### 関数タイムアウト
```javascript
// vercel.json の設定確認
{
  "functions": {
    "backend/src/server.ts": {
      "maxDuration": 10
    }
  }
}
```

### 🐳 Docker 問題

#### コンテナ起動失敗
```bash
# 1. イメージの確認
docker images | grep kibarashi

# 2. コンテナログの確認
docker-compose logs frontend
docker-compose logs backend

# 3. ネットワークの確認
docker network ls
docker network inspect kibarashi-app_default
```

#### ポートマッピング問題
```bash
# ポート使用状況
docker-compose ps
netstat -tulpn | grep -E ':(3000|8080)'

# ポート競合の解決
docker-compose down
# ポート変更後
docker-compose up -d
```

## パフォーマンス問題

### 🐌 ページ読み込みが遅い

#### Core Web Vitals 診断
```bash
# Lighthouse CLI での測定
npm install -g lighthouse
lighthouse https://your-app.vercel.app --output=html --output-path=./report.html

# Web Vitals の確認
curl -s "https://your-app.vercel.app" | grep -E "(LCP|FID|CLS)"
```

#### バンドルサイズ分析
```bash
cd frontend
npm install --save-dev @bundle-analyzer/webpack-bundle-analyzer

# バンドル分析
npm run build
npx webpack-bundle-analyzer dist/assets/index-*.js
```

#### 画像最適化
```bash
# 画像圧縮
npm install --save-dev imagemin imagemin-webp
# または Vercel 自動最適化を確認
curl -I "https://your-app.vercel.app/_next/image?url=/icon.png&w=32&q=75"
```

### 🔥 API レスポンスが遅い

#### SQL クエリ最適化（Phase 2以降）
```sql
-- スロークエリの特定
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- インデックス使用状況
EXPLAIN ANALYZE SELECT * FROM suggestions WHERE situation = 'workplace';
```

#### キャッシュ戦略
```javascript
// Redis キャッシュの確認
const redis = require('ioredis');
const client = new redis();

// キャッシュヒット率の確認
const cacheStats = await client.info('stats');
console.log('Cache hit ratio:', cacheStats);
```

## セキュリティ関連

### 🔒 CORS エラー

#### 症状と診断
```javascript
// ブラウザコンソールのエラー例
// "Access to fetch at 'http://localhost:8080/api/v1/suggestions' from origin 'http://localhost:3000' has been blocked by CORS policy"

// backend/src/api/middleware/cors.ts の設定確認
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
```

#### 解決策
```javascript
// 本番環境での CORS 設定
const allowedOrigins = [
  'https://your-app.vercel.app',
  'https://your-app-git-main.vercel.app',
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null
].filter(Boolean);
```

### 🛡️ CSP (Content Security Policy) エラー

#### エラーの確認
```bash
# ブラウザコンソールで CSP エラーをチェック
# "Refused to load the script 'https://example.com/script.js' because it violates the following Content Security Policy directive"
```

#### CSP 設定の調整
```javascript
// backend/src/api/middleware/security.ts
const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", "data:", "https:"],
  connectSrc: ["'self'", "https://*.googleapis.com"],
  mediaSrc: ["'self'", "https://storage.googleapis.com"]
};
```

### 🔑 API キー漏洩チェック

#### 診断ツール
```bash
# Git 履歴でのキー検索
git log --all --grep="API_KEY" --oneline
git log --all -S "sk-" --oneline

# ファイル内でのキー検索
grep -r "sk-" . --exclude-dir=node_modules
grep -r "AIza" . --exclude-dir=node_modules
```

#### 対処方法
```bash
# 1. 漏洩したキーの無効化
# Google AI Studio or Google Cloud Console で即座に無効化

# 2. Git 履歴からの削除
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch path/to/file/with/key' \
  --prune-empty --tag-name-filter cat -- --all

# 3. 新しいキーの生成と設定
# Google AI Studio で新しいキーを生成
```

## ツールとユーティリティ

### 🔧 診断用スクリプト

#### システム全体ヘルスチェック
```bash
#!/bin/bash
# scripts/health-check.sh

echo "=== Kibarashi App Health Check ==="

# 1. サービス状態確認
echo "Frontend (localhost:3000):"
curl -f http://localhost:3000 &>/dev/null && echo "✅ OK" || echo "❌ FAIL"

echo "Backend (localhost:8080):"
curl -f http://localhost:8080/health &>/dev/null && echo "✅ OK" || echo "❌ FAIL"

# 2. 外部API確認
echo "Gemini API:"
curl -H "Authorization: Bearer $GEMINI_API_KEY" \
     https://generativelanguage.googleapis.com/v1beta/models &>/dev/null \
     && echo "✅ OK" || echo "❌ FAIL"

# 3. ログエラー確認
echo "Recent errors:"
tail -n 10 backend/logs/error.log 2>/dev/null || echo "No error log found"

echo "=== Health Check Complete ==="
```

#### パフォーマンス測定
```javascript
// scripts/performance-test.js
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function runPerformanceTest() {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance'],
    port: chrome.port
  };
  
  const runnerResult = await lighthouse('http://localhost:3000', options);
  
  const { lhr } = runnerResult;
  console.log('Performance Score:', lhr.categories.performance.score * 100);
  console.log('LCP:', lhr.audits['largest-contentful-paint'].displayValue);
  console.log('FID:', lhr.audits['max-potential-fid'].displayValue);
  
  await chrome.kill();
}
```

### 📊 ログ分析ツール

#### エラーレート分析
```bash
# 過去1時間のエラーレート
grep "$(date -d '1 hour ago' '+%Y-%m-%d %H')" backend/logs/error.log | wc -l

# 最も多いエラーパターン
grep -o '"error":"[^"]*"' backend/logs/error.log | sort | uniq -c | sort -nr

# API レスポンス時間分析
grep "responseTime" backend/logs/combined.log | \
  awk '{print $NF}' | \
  sort -n | \
  awk 'BEGIN{sum=0; count=0} {sum+=$1; count++; values[count]=$1} \
       END{print "平均:", sum/count "ms"; print "P95:", values[int(count*0.95)] "ms"}'
```

### 🔄 自動復旧スクリプト

#### サービス自動再起動
```bash
#!/bin/bash
# scripts/auto-recovery.sh

check_and_restart() {
  local service=$1
  local port=$2
  local max_retries=3
  
  for ((i=1; i<=max_retries; i++)); do
    if curl -f "http://localhost:$port/health" &>/dev/null; then
      echo "$service is healthy"
      return 0
    fi
    
    echo "$service is down, attempting restart ($i/$max_retries)"
    
    if [ "$service" = "frontend" ]; then
      pkill -f "vite"
      cd frontend && npm run dev &
    elif [ "$service" = "backend" ]; then
      pkill -f "nodemon"
      cd backend && npm run dev &
    fi
    
    sleep 30
  done
  
  echo "Failed to recover $service after $max_retries attempts"
  # アラート送信（Slack, メール等）
  return 1
}

check_and_restart "frontend" 3000
check_and_restart "backend" 8080
```

## エスカレーション手順

### 📞 連絡先とエスカレーション

#### 役割と責任

| レベル | 対象者 | 対応範囲 | 連絡方法 |
|--------|--------|----------|----------|
| L1 | 開発者 | 基本的なトラブル | Slack #dev |
| L2 | シニア開発者 | 複雑な技術問題 | Slack #dev + メンション |
| L3 | アーキテクト/リード | アーキテクチャ変更 | 直接連絡 |
| L4 | CTO/管理者 | ビジネス影響大 | 電話 + メール |

#### エスカレーション基準

```yaml
immediate_escalation:
  - サービス完全停止（5分以上）
  - セキュリティインシデント
  - データ損失の可能性

within_30_minutes:
  - 主要機能停止
  - 外部API完全停止
  - パフォーマンス80%以上劣化

within_2_hours:
  - 部分機能停止
  - 多数のユーザーからの問い合わせ
  - 監視アラート多発
```

### 📋 インシデント報告テンプレート

```markdown
# インシデント報告書

## 基本情報
- **発生日時**: YYYY/MM/DD HH:MM
- **検知方法**: 監視アラート / ユーザー報告 / その他
- **影響範囲**: 全サービス / 特定機能 / 限定的
- **緊急度**: Critical / High / Medium / Low

## 症状
- **現象**: 
- **影響を受けるユーザー**: 
- **エラーメッセージ**: 

## 初期対応
- **実施した診断**: 
- **実施した対処**: 
- **効果**: 

## 根本原因
- **原因**: 
- **発生要因**: 

## 恒久対策
- **対策内容**: 
- **実施予定日**: 
- **担当者**: 

## 学習ポイント
- **改善点**: 
- **予防策**: 
```

---

## クイックリファレンス

### 🚀 よく使うコマンド

```bash
# サービス起動
docker-compose up -d
cd frontend && npm run dev
cd backend && npm run dev

# ログ確認
docker-compose logs -f
tail -f backend/logs/error.log

# ヘルスチェック
curl http://localhost:3000
curl http://localhost:8080/health

# テスト実行
npm run test
npm run test:e2e

# デプロイ
vercel --prod
```

### 📞 緊急時の優先順位

1. **サービス復旧** - 影響を最小限に抑制
2. **原因特定** - ログ・監視データの分析
3. **恒久対策** - 再発防止のための改善
4. **事後レビュー** - インシデントからの学習

---

最終更新: 2025-01-07