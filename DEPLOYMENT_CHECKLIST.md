# デプロイメントチェックリスト

## 🔧 必要な環境変数

### GitHubシークレット（必須）
- [ ] `AZURE_STATIC_WEB_APPS_API_TOKEN`
  - 取得方法: Azureポータル → Static Web Apps → デプロイトークン

### Azure Static Web Apps 環境変数（必須）
- [ ] `GEMINI_API_KEY`
  - 取得方法: [Google AI Studio](https://makersuite.google.com/app/apikey)
  - 用途: Gemini APIによる気晴らし提案生成

- [ ] `VITE_API_URL`
  - 本番環境: `https://[your-app-name].azurestaticapps.net/api`
  - 用途: フロントエンドからバックエンドAPIへの接続

### Azure Static Web Apps 環境変数（オプション）
- [ ] `NODE_ENV`
  - 値: `production`
  - 用途: 本番環境設定の有効化

- [ ] `CORS_ORIGIN`
  - 値: `https://[your-app-name].azurestaticapps.net`
  - 用途: CORS許可ドメインの設定

- [ ] `GCP_TTS_ENABLED`
  - 値: `true`（TTSを使用する場合）
  - 用途: Google Cloud Text-to-Speech機能の有効化

- [ ] `GOOGLE_APPLICATION_CREDENTIALS_JSON`
  - 取得方法: GCPサービスアカウントキーを1行に圧縮
  - 用途: Google Cloud TTS認証（TTSを使用する場合のみ）

## 📋 デプロイ前チェックリスト

### 1. ローカル動作確認
- [ ] `npm install` でエラーなし
- [ ] `npm run dev` で正常起動
- [ ] `npm run build` でビルド成功
- [ ] `npm test` でテスト成功

### 2. 環境変数設定
- [ ] `.env` ファイルをローカルで作成・設定
- [ ] GEMINI_API_KEYが有効であることを確認
- [ ] API呼び出しが正常に動作することを確認

### 3. GitHubリポジトリ準備
- [ ] すべての変更をコミット
- [ ] mainブランチが最新状態
- [ ] 不要なファイルが.gitignoreされている

### 4. Azure準備
- [ ] Azureアカウントにログイン
- [ ] リソースグループ作成済み
- [ ] Azure CLIインストール済み

## 🚀 デプロイ手順

### 1. Azure Static Web Apps作成
```bash
# Azureにログイン
az login

# リソースグループ作成
az group create --name kibarashi-rg --location japaneast

# Static Web Apps作成
az staticwebapp create \
  --name kibarashi-app \
  --resource-group kibarashi-rg \
  --source https://github.com/CaCC-Lab/kibarashi-app \
  --location eastasia \
  --branch main \
  --app-location "/frontend" \
  --api-location "/backend" \
  --output-location "dist" \
  --token YOUR_GITHUB_PERSONAL_ACCESS_TOKEN
```

### 2. 環境変数設定
```bash
# 必須環境変数
az staticwebapp appsettings set \
  --name kibarashi-app \
  --resource-group kibarashi-rg \
  --setting-names \
    GEMINI_API_KEY="your-actual-gemini-api-key" \
    VITE_API_URL="https://kibarashi-app.azurestaticapps.net/api" \
    NODE_ENV="production"

# TTS使用時（オプション）
az staticwebapp appsettings set \
  --name kibarashi-app \
  --resource-group kibarashi-rg \
  --setting-names \
    GCP_TTS_ENABLED="true" \
    GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type":"service_account",...}'
```

### 3. GitHubシークレット設定
1. GitHubリポジトリ → Settings → Secrets and variables → Actions
2. `AZURE_STATIC_WEB_APPS_API_TOKEN` を追加

### 4. デプロイ確認
- GitHub Actions タブでワークフロー実行状況を確認
- デプロイ完了後、以下のURLでアクセス: `https://kibarashi-app.azurestaticapps.net`

## 🔍 デプロイ後確認

### 基本動作確認
- [ ] トップページが表示される
- [ ] 状況選択が機能する
- [ ] 時間選択が機能する
- [ ] 気晴らし提案が表示される
- [ ] タイマーが正常に動作する

### PWA機能確認
- [ ] PWAとしてインストール可能
- [ ] オフラインで基本機能が動作
- [ ] アイコンが正しく表示される

### API機能確認
- [ ] Gemini APIからの提案生成が動作
- [ ] エラー時にフォールバック提案が表示
- [ ] 音声機能が動作（TTSが有効な場合）

### パフォーマンス確認
- [ ] Lighthouse スコア 90以上
- [ ] 初回読み込み3秒以内
- [ ] レスポンシブデザインが機能

## ⚠️ トラブルシューティング

### ビルドエラー
- Node.jsバージョンを確認（20.x以上必要）
- package-lock.jsonを削除して再インストール

### APIエラー
- GEMINI_API_KEYが正しく設定されているか確認
- CORS設定を確認
- ブラウザのコンソールでエラーを確認

### デプロイエラー
- GitHub Actionsのログを確認
- Azure Static Web Appsのログストリームを確認
- 環境変数が正しく設定されているか確認

## 📞 サポート

問題が解決しない場合：
1. [GitHub Issues](https://github.com/CaCC-Lab/kibarashi-app/issues)で報告
2. Azure Portalのサポートリクエストを作成
3. ログとエラーメッセージを含めて詳細を提供