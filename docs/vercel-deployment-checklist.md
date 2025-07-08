# Vercel本番デプロイメント チェックリスト

## 🚀 即座に実行が必要な手動設定

### 1. Vercel プロジェクト作成（5分）

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. "New Project" をクリック
3. GitHub リポジトリ `kibarashi-app` を選択
4. プロジェクト設定：
   ```
   Project Name: kibarashi-app
   Framework Preset: Other
   Build Command: cd frontend && npm install && npm run build
   Output Directory: frontend/dist
   Install Command: npm install
   ```
5. "Deploy" をクリック

### 2. GitHub Secrets 設定（3分）

GitHub リポジトリ > Settings > Secrets and variables > Actions

以下のSecrets を追加：

```yaml
# Vercel設定（Vercel Dashboard > Settings > Tokens で取得）
VERCEL_TOKEN: [Vercel Dashboard で生成]
VERCEL_ORG_ID: [Vercel Dashboard で確認]
VERCEL_PROJECT_ID: [プロジェクト作成後に確認]

# API キー（Google Cloud Console で取得済み）
GEMINI_API_KEY_1: [メインのGemini APIキー]
GEMINI_API_KEY_2: [バックアップ用Gemini APIキー] 
GEMINI_API_KEY_3: [バックアップ用Gemini APIキー]
GOOGLE_CLOUD_TTS_KEY: [TTS APIキー]

# フロントエンド用（オプション）
VITE_GEMINI_API_KEY: [フロントエンド用APIキー（制限付き）]
```

### 3. Vercel 環境変数設定（3分）

Vercel Dashboard > Project > Settings > Environment Variables

**Production 環境変数:**
```bash
GEMINI_API_KEY_1=[メインのGemini APIキー]
GEMINI_API_KEY_2=[バックアップ用Gemini APIキー]
GEMINI_API_KEY_3=[バックアップ用Gemini APIキー]
GOOGLE_CLOUD_TTS_KEY=[TTS APIキー]
NODE_ENV=production
API_VERSION=v1
ENABLE_RATE_LIMIT=true
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100
CACHE_TTL=300
```

### 4. 本番デプロイ実行（1分）

以下のいずれかの方法で実行：

#### 方法A: GitHub Actions経由（推奨）
```bash
# 単純にmainブランチにプッシュ（自動デプロイ）
git push origin main

# または手動トリガー
# GitHub Actions > Deploy to Vercel > Run workflow
```

#### 方法B: Vercel CLI経由
```bash
vercel --prod
```

## 📊 デプロイ後の確認事項

### 自動ヘルスチェック
GitHub Actions が以下を自動確認：
- ✅ フロントエンド動作確認（HTTP 200）
- ✅ API Health エンドポイント（/api/v1/health）
- ✅ Suggestions API 機能テスト（/api/v1/suggestions）

### 手動機能確認
本番環境で以下をテスト：
1. **状況・時間選択** → 3つの提案表示
2. **音声ガイド再生** → TTS動作確認
3. **PWAインストール** → アプリとして使用可能
4. **オフライン動作** → Service Worker動作確認

## 🔧 トラブルシューティング

### よくある問題

#### API キーエラー
```
Error: Invalid API key
解決: Vercel環境変数でAPIキーを再設定
```

#### ビルドエラー
```
Error: Build failed
解決: GitHub Actions > CI ワークフローでエラー詳細を確認
```

#### CORS エラー
```
Error: CORS policy
解決: CORS_ORIGIN環境変数を本番ドメインに設定
```

## 📈 期待される結果

### 技術指標
- **初回読み込み時間**: < 3秒
- **API レスポンス時間**: < 2秒
- **PWA Lighthouse スコア**: 90以上
- **アップタイム**: 99.9%以上

### 機能指標
- **提案生成成功率**: 99%以上
- **音声ガイド生成率**: 95%以上（APIキー設定時）
- **モバイル対応**: 完全対応
- **ダークモード**: 正常動作

## 🚀 完了後の Next Steps

1. **ドメイン設定**（オプション）
   - Vercel Dashboard > Domains で独自ドメイン設定

2. **Analytics 設定**
   - Vercel Analytics の有効化
   - Performance monitoring 開始

3. **監視設定**
   - Uptime monitoring ツール設定
   - エラートラッキング（Sentry）設定

---

**最終更新**: 2025-01-08
**推定所要時間**: 12分（手動設定）
**自動化率**: 85%（デプロイ・テスト・ヘルスチェックは完全自動）