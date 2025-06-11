# Azure デプロイメントガイド

## 推奨デプロイ構成

Azureを契約済みなので、以下の構成を推奨します：

### オプション1: Azure Static Web Apps（推奨・最も簡単）

フロントエンドとバックエンドを統合管理できる最新のサービスです。

#### 前提条件
- Azure CLIのインストール
- GitHubリポジトリとの連携

#### デプロイ手順

1. **Azure CLIでログイン**
```bash
az login
```

2. **リソースグループの作成（まだない場合）**
```bash
az group create --name kibarashi-rg --location japaneast
```

3. **Static Web Appの作成**
```bash
az staticwebapp create \
  --name kibarashi-app \
  --resource-group kibarashi-rg \
  --source https://github.com/CaCC-Lab/kibarashi-app \
  --location eastasia \
  --branch main \
  --app-location "/frontend" \
  --api-location "/backend" \
  --output-location "dist"
```

4. **環境変数の設定**
```bash
# バックエンド環境変数
az staticwebapp appsettings set \
  --name kibarashi-app \
  --resource-group kibarashi-rg \
  --setting-names \
    GEMINI_API_KEY="your-gemini-api-key" \
    GOOGLE_APPLICATION_CREDENTIALS="path-to-credentials" \
    NODE_ENV="production"
```

5. **GitHub Actionsワークフローが自動生成される**
- `.github/workflows/azure-static-web-apps-*.yml`が作成されます
- pushするだけで自動デプロイ

### オプション2: App Service（フロントエンド）+ App Service（バックエンド）

より柔軟な構成が必要な場合はこちら。

#### バックエンドのデプロイ

1. **App Serviceプランの作成**
```bash
az appservice plan create \
  --name kibarashi-plan \
  --resource-group kibarashi-rg \
  --location japaneast \
  --sku F1 \
  --is-linux
```

2. **Web Appの作成**
```bash
az webapp create \
  --resource-group kibarashi-rg \
  --plan kibarashi-plan \
  --name kibarashi-backend \
  --runtime "NODE:20-lts"
```

3. **環境変数の設定**
```bash
az webapp config appsettings set \
  --resource-group kibarashi-rg \
  --name kibarashi-backend \
  --settings \
    GEMINI_API_KEY="your-gemini-api-key" \
    GOOGLE_APPLICATION_CREDENTIALS="path-to-credentials" \
    NODE_ENV="production" \
    PORT="8080"
```

4. **デプロイ（ZIP deploy）**
```bash
cd backend
npm run build
zip -r backend.zip . -x "node_modules/*" ".git/*"
az webapp deployment source config-zip \
  --resource-group kibarashi-rg \
  --name kibarashi-backend \
  --src backend.zip
```

#### フロントエンドのデプロイ

1. **Static Web Appとして作成**
```bash
az staticwebapp create \
  --name kibarashi-frontend \
  --resource-group kibarashi-rg \
  --source https://github.com/CaCC-Lab/kibarashi-app \
  --location eastasia \
  --branch main \
  --app-location "/frontend" \
  --output-location "dist"
```

2. **環境変数の設定**
```bash
az staticwebapp appsettings set \
  --name kibarashi-frontend \
  --resource-group kibarashi-rg \
  --setting-names \
    VITE_API_URL="https://kibarashi-backend.azurewebsites.net"
```

### オプション3: Container Instances（Docker利用）

Dockerを使いたい場合。

1. **Azure Container Registryの作成**
```bash
az acr create \
  --resource-group kibarashi-rg \
  --name kibarashiacr \
  --sku Basic
```

2. **Dockerイメージのビルドとプッシュ**
```bash
cd backend
az acr build \
  --registry kibarashiacr \
  --image kibarashi-backend:latest .
```

3. **Container Instanceの作成**
```bash
az container create \
  --resource-group kibarashi-rg \
  --name kibarashi-backend \
  --image kibarashiacr.azurecr.io/kibarashi-backend:latest \
  --dns-name-label kibarashi-backend \
  --ports 8080 \
  --environment-variables \
    GEMINI_API_KEY="your-gemini-api-key" \
    NODE_ENV="production"
```

## 推奨構成の比較

| サービス | 料金 | メリット | デメリット |
|---------|------|---------|-----------|
| Static Web Apps | 無料〜 | 統合管理、自動CI/CD | API機能に制限 |
| App Service | F1無料〜 | 完全なNode.js対応 | 個別管理が必要 |
| Container Instances | 従量課金 | Docker対応、柔軟 | 常時起動でコスト増 |

## CORS設定

バックエンドの`backend/src/server.ts`でCORS設定を更新：

```typescript
const corsOptions = {
  origin: [
    'https://kibarashi-app.azurestaticapps.net',
    'https://kibarashi-frontend.azurestaticapps.net',
    'http://localhost:3000' // 開発用
  ],
  credentials: true
};
```

## カスタムドメインの設定（オプション）

```bash
az staticwebapp hostname add \
  --name kibarashi-app \
  --resource-group kibarashi-rg \
  --hostname "kibarashi.example.com"
```

## 監視とログ

1. **Application Insightsの有効化**
```bash
az monitor app-insights component create \
  --app kibarashi-insights \
  --location japaneast \
  --resource-group kibarashi-rg
```

2. **ログの確認**
```bash
# App Serviceのログ
az webapp log tail \
  --name kibarashi-backend \
  --resource-group kibarashi-rg

# Container Instancesのログ
az container logs \
  --resource-group kibarashi-rg \
  --name kibarashi-backend
```

## トラブルシューティング

### よくある問題

1. **ビルドエラー**
   - Node.jsバージョンを確認（20.x必須）
   - `package.json`の`engines`フィールドを設定

2. **環境変数が反映されない**
   - App Service再起動: `az webapp restart`
   - Static Web Apps再デプロイ

3. **CORS エラー**
   - バックエンドのCORS設定を確認
   - フロントエンドのURLを許可リストに追加

### デバッグコマンド

```bash
# リソースの一覧
az resource list --resource-group kibarashi-rg

# App Serviceの状態確認
az webapp show --name kibarashi-backend --resource-group kibarashi-rg

# URLの確認
echo "Backend: https://kibarashi-backend.azurewebsites.net"
echo "Frontend: https://kibarashi-app.azurestaticapps.net"
```

## 次のステップ

1. GitHubリポジトリとの連携設定
2. 自動デプロイの確認
3. Application Insightsでの監視設定
4. カスタムドメインの設定（必要に応じて）