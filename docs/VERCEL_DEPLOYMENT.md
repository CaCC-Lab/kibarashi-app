# Vercel デプロイメントガイド

## 概要

このガイドでは、5分気晴らしアプリをVercelにデプロイする手順を詳しく説明します。

## 前提条件

- GitHubアカウント
- Vercelアカウント（GitHubと連携）
- Google Cloud Platform プロジェクト
- Gemini API キー
- Google Cloud TTS サービスアカウント

## 1. Vercel プロジェクト作成

### 1.1 Vercel Web UIでの設定

1. **Vercelにアクセス**
   ```
   https://vercel.com
   ```

2. **GitHubでログイン**
   - "Continue with GitHub" をクリック
   - 必要な権限を承認

3. **新規プロジェクト作成**
   - "Add New Project" をクリック
   - "Import Git Repository" を選択
   - `kibarashi-app` リポジトリを検索・選択

4. **プロジェクト設定**
   - **Project Name**: `kibarashi-app` (または任意の名前)
   - **Framework Preset**: Other
   - **Build Command**: `npm run build` (自動検出)
   - **Output Directory**: `frontend/dist` (自動検出)
   - **Install Command**: `npm ci`

## 2. 環境変数設定

### 2.1 必要な環境変数

Project Settings → Environment Variables で以下を設定：

| 変数名 | 説明 | 設定値例 |
|--------|------|----------|
| `GEMINI_API_KEY` | Google Gemini API キー | `AIzaSy...` |
| `GOOGLE_APPLICATION_CREDENTIALS` | GCP サービスアカウント | JSON文字列 |
| `NODE_ENV` | 実行環境 | `production` |

### 2.2 GOOGLE_APPLICATION_CREDENTIALS の設定

1. **サービスアカウントJSONをコピー**
   ```json
   {
     "type": "service_account",
     "project_id": "your-project-id",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "your-service@your-project.iam.gserviceaccount.com",
     "client_id": "...",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token",
     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
     "client_x509_cert_url": "..."
   }
   ```

2. **JSON文字列として設定**
   - 改行を削除し、1行の文字列として設定
   - Vercelの環境変数エディタに貼り付け

## 3. デプロイ実行

### 3.1 自動デプロイ

1. **初回デプロイ**
   - Vercel設定完了後、自動的に初回ビルド・デプロイが開始
   - 進行状況はDashboardで確認可能

2. **継続的デプロイ**
   - `main` ブランチへのプッシュで自動デプロイ
   - 他ブランチはプレビュー環境として自動デプロイ

### 3.2 手動デプロイ（オプション）

```bash
# Vercel CLI経由
npm install -g vercel
vercel --prod
```

## 4. デプロイ後の確認

### 4.1 基本動作確認

1. **フロントエンド確認**
   ```
   https://your-project.vercel.app
   ```

2. **API エンドポイント確認**
   ```bash
   # ヘルスチェック
   curl https://your-project.vercel.app/api/v1/health
   
   # 提案API
   curl "https://your-project.vercel.app/api/v1/suggestions?situation=workplace&duration=5"
   ```

### 4.2 PWA機能確認

1. **Service Worker確認**
   - ブラウザのDevToolsでService Workerの登録を確認

2. **オフライン機能確認**
   - ネットワークをオフラインに設定
   - 基本機能が動作することを確認

3. **インストール機能確認**
   - モバイルブラウザで「ホーム画面に追加」が表示されることを確認

## 5. 監視とメンテナンス

### 5.1 Vercel Analytics

- Vercel Dashboardでトラフィックとパフォーマンスを監視
- Function実行時間とエラー率の確認

### 5.2 環境変数の更新

1. **Vercel Dashboard**
   - Project Settings → Environment Variables
   - 値を更新後、再デプロイが自動実行

2. **再デプロイの確認**
   - Deployments タブで最新のデプロイ状況を確認

## 6. トラブルシューティング

### 6.1 ビルドエラー

**症状**: デプロイ時のビルドが失敗する

**対策**:
```bash
# ローカルでビルドテスト
npm run build

# ログの確認
# Vercel Dashboard → Deployments → 失敗したデプロイ → Build Logs
```

### 6.2 API関数エラー

**症状**: `/api/v1/*` エンドポイントが500エラー

**対策**:
1. **環境変数の確認**
   - `GEMINI_API_KEY` が正しく設定されているか
   - `GOOGLE_APPLICATION_CREDENTIALS` が有効なJSONか

2. **Function Logs確認**
   - Vercel Dashboard → Functions → Runtime Logs

### 6.3 タイムアウトエラー

**症状**: API リクエストが10秒でタイムアウト

**対策**:
- Vercel Functionsの実行時間制限（10秒）内での処理最適化
- Gemini APIのレスポンス時間改善

### 6.4 CORS エラー

**症状**: フロントエンドからAPIへのリクエストが失敗

**対策**:
- `vercel.json` の headers 設定確認
- API関数内のCORS設定確認

## 7. セキュリティ考慮事項

### 7.1 環境変数の管理

- **機密情報**: すべてVercel環境変数で管理
- **コード内ハードコーディング禁止**: APIキーやシークレットをコードに含めない

### 7.2 API制限

- **Gemini API**: 使用量制限とコスト監視
- **Google Cloud TTS**: 月間制限の確認

## 8. パフォーマンス最適化

### 8.1 Function最適化

- **コールドスタート対策**: クライアント初期化の効率化
- **メモリ使用量**: 1GB制限内での処理

### 8.2 CDN活用

- **静的アセット**: Vercel CDNによる高速配信
- **キャッシュ戦略**: `Cache-Control` ヘッダーの適切な設定

## 9. 本番環境情報

### 9.1 URL構造

```
Production:
https://your-project.vercel.app/

API Endpoints:
https://your-project.vercel.app/api/v1/health
https://your-project.vercel.app/api/v1/suggestions
https://your-project.vercel.app/api/v1/tts
```

### 9.2 デプロイメント状況

- **自動デプロイ**: ✅ 設定済み
- **プレビュー環境**: ✅ 設定済み
- **環境変数**: ⏳ 設定待ち
- **独自ドメイン**: ⏳ 必要に応じて設定

---

**作成日**: 2025/06/25
**更新日**: 2025/06/25
**担当者**: Claude Code