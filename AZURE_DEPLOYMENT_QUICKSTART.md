# Azure Static Web Apps クイックスタートガイド

## 前提条件
- Azureアカウント（契約済み）
- Azure CLIのインストール
- GitHubリポジトリ: https://github.com/CaCC-Lab/kibarashi-app

## 5分でデプロイする手順

### 1. Azure CLIでログイン
```bash
az login
```

### 2. リソースグループの作成
```bash
az group create --name kibarashi-rg --location japaneast
```

### 3. Static Web Appの作成とGitHub連携
```bash
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

**注意**: `YOUR_GITHUB_PERSONAL_ACCESS_TOKEN`を実際のGitHubパーソナルアクセストークンに置き換えてください。
トークンの作成: https://github.com/settings/tokens/new (repo権限が必要)

### 4. 環境変数の設定
```bash
# 必須の環境変数を設定
az staticwebapp appsettings set \
  --name kibarashi-app \
  --resource-group kibarashi-rg \
  --setting-names \
    GEMINI_API_KEY="your-gemini-api-key" \
    VITE_API_URL="https://kibarashi-app.azurestaticapps.net/api"
```

### 5. デプロイの確認
デプロイが完了すると、以下のURLでアクセス可能になります：
```
https://kibarashi-app.azurestaticapps.net
```

## 環境変数の追加方法

### Azure Portal経由（推奨）
1. Azure Portalにログイン
2. "Static Web Apps" → "kibarashi-app"を選択
3. 左メニューの「構成」をクリック
4. 「アプリケーション設定」で環境変数を追加

### CLI経由
```bash
az staticwebapp appsettings set \
  --name kibarashi-app \
  --resource-group kibarashi-rg \
  --setting-names KEY="value"
```

## Google Cloud認証情報の設定

Google Cloud TTSを使用する場合、サービスアカウントキーが必要です：

1. GCPコンソールでサービスアカウントキーをJSON形式でダウンロード
2. JSONの内容を1行に圧縮（改行を削除）
3. 環境変数として設定：

```bash
# JSONファイルの内容を1行に圧縮
GOOGLE_CREDS=$(cat path/to/credentials.json | tr -d '\n')

# 環境変数として設定
az staticwebapp appsettings set \
  --name kibarashi-app \
  --resource-group kibarashi-rg \
  --setting-names GOOGLE_APPLICATION_CREDENTIALS_JSON="$GOOGLE_CREDS"
```

## トラブルシューティング

### デプロイステータスの確認
```bash
# Static Web Appの情報を表示
az staticwebapp show --name kibarashi-app --resource-group kibarashi-rg

# GitHub Actionsのログを確認
# https://github.com/CaCC-Lab/kibarashi-app/actions
```

### ログの確認
Azure Portal → Static Web Apps → "kibarashi-app" → 「ログ ストリーム」

### よくあるエラー

1. **ビルドエラー**
   - Node.jsバージョンを確認（package.jsonで20.x指定）
   - 依存関係のインストールエラーを確認

2. **API呼び出しエラー**
   - CORS設定を確認
   - 環境変数が正しく設定されているか確認

3. **認証エラー**
   - GEMINI_API_KEYが正しいか確認
   - Google Cloud認証情報が正しいか確認

## 次のステップ

1. カスタムドメインの設定
2. Application Insightsの有効化（監視）
3. ステージング環境の設定
4. 自動バックアップの設定