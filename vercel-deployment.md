# Vercelデプロイメントガイド

## デプロイ方法

### 1. フロントエンドのデプロイ

1. **Vercelアカウントでプロジェクトを作成**
   - https://vercel.com でログイン
   - "New Project"をクリック
   - GitHubリポジトリを接続

2. **ビルド設定**
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Output Directory: `dist`

3. **環境変数の設定**
   ```
   VITE_API_URL=https://your-backend-api.com
   ```

### 2. バックエンドのデプロイ（別途必要）

バックエンドは以下のサービスでのデプロイを推奨：

#### オプション1: Render（無料プランあり・推奨）
- https://render.com でアカウント作成
- Web Serviceとして`backend`ディレクトリをデプロイ
- 環境変数を設定
- **メリット**: 無料プラン、自動デプロイ、簡単設定
- **デメリット**: 無料プランはスリープあり（15分間アクセスなしで停止）

#### オプション2: Railway
- https://railway.app でアカウント作成
- GitHubリポジトリを接続
- Root directoryを`backend`に設定
- **メリット**: 高速デプロイ、使いやすいUI
- **デメリット**: 無料プランは月$5のクレジットのみ

#### オプション3: Fly.io
- https://fly.io でアカウント作成
- Dockerfileを使用してデプロイ
```bash
cd backend
fly launch
fly deploy
```
- **メリット**: グローバルエッジ配信、高性能
- **デメリット**: 初期設定がやや複雑

#### オプション4: Google Cloud Run
```bash
# Dockerイメージをビルド
cd backend
docker build -t gcr.io/YOUR_PROJECT_ID/kibarashi-backend .

# Cloud Runにデプロイ
gcloud run deploy kibarashi-backend \
  --image gcr.io/YOUR_PROJECT_ID/kibarashi-backend \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated
```
- **メリット**: 自動スケーリング、従量課金
- **デメリット**: GCP設定が必要

#### オプション5: Heroku（有料のみ）
- https://heroku.com でアカウント作成
- Heroku CLIを使用してデプロイ
```bash
cd backend
heroku create kibarashi-backend
git push heroku main
```
- **メリット**: 実績豊富、安定性高い
- **デメリット**: 無料プラン廃止、最低$7/月

#### オプション6: DigitalOcean App Platform
- https://www.digitalocean.com でアカウント作成
- App Platformで新規アプリ作成
- GitHubリポジトリを接続
- **メリット**: シンプル、$5/月から
- **デメリット**: 無料プランなし

#### オプション7: Cyclic.sh
- https://cyclic.sh でアカウント作成
- GitHubリポジトリを接続
- **メリット**: 完全無料、簡単設定
- **デメリット**: 制限が多い（ファイルシステム書き込み不可）

#### オプション8: Deta Space
- https://deta.space でアカウント作成
- Deta CLIでデプロイ
- **メリット**: 完全無料、NoSQL DB付き
- **デメリット**: まだベータ版

#### オプション9: Netlify Functions（サーバーレス化が必要）
- Netlifyでバックエンドもホスト
- Express.jsをNetlify Functionsに変換必要
- **メリット**: フロントエンドと同じプラットフォーム
- **デメリット**: 大幅なコード変更必要

#### オプション10: AWS（EC2/ECS/Lambda）
- EC2: 仮想サーバー
- ECS: コンテナサービス
- Lambda: サーバーレス
- **メリット**: 高い柔軟性、エンタープライズ向け
- **デメリット**: 設定が複雑、コスト管理必要

#### オプション11: Azure（複数の選択肢）

##### Azure App Service（推奨）
```bash
# Azure CLIでデプロイ
cd backend
az webapp up --name kibarashi-backend --runtime "NODE:20-lts"
```
- **メリット**: 簡単デプロイ、自動スケーリング、無料プランあり
- **デメリット**: 無料プランは1日60分のCPU時間制限

##### Azure Container Instances
```bash
# Dockerイメージをビルド&プッシュ
cd backend
az acr build --registry myregistry --image kibarashi-backend .

# コンテナインスタンスをデプロイ
az container create --resource-group myResourceGroup \
  --name kibarashi-backend \
  --image myregistry.azurecr.io/kibarashi-backend:latest \
  --dns-name-label kibarashi-backend \
  --ports 8080
```
- **メリット**: Dockerネイティブ、シンプル
- **デメリット**: 常時起動でコスト発生

##### Azure Functions（サーバーレス）
- Express.jsをAzure Functions用に変換必要
- **メリット**: 従量課金、自動スケーリング
- **デメリット**: コード変更必要

##### Azure Static Web Apps（フルスタック）
- フロントエンドとバックエンドを統合デプロイ
- APIはAzure Functions統合
- **メリット**: 無料プラン充実、GitHub Actions統合
- **デメリット**: Express.jsの変更必要

### 3. 必要な環境変数

#### フロントエンド（Vercel）
- `VITE_API_URL`: バックエンドAPIのURL
- `VITE_API_TIMEOUT`: APIタイムアウト（オプション、デフォルト: 30000）

#### バックエンド（Cloud Run等）
- `GEMINI_API_KEY`: Gemini APIキー（必須）
- `GOOGLE_APPLICATION_CREDENTIALS`: GCPサービスアカウントキーのパス
- `PORT`: サーバーポート（デフォルト: 8080）
- `CORS_ORIGIN`: フロントエンドのURL（Vercelのドメイン）
- `NODE_ENV`: production

### 4. デプロイ後の確認事項

1. **CORS設定の確認**
   - バックエンドでVercelドメインを許可

2. **HTTPS通信の確認**
   - APIエンドポイントがHTTPSであることを確認

3. **PWA機能の確認**
   - Service Workerが正しく登録されているか
   - オフライン時の動作確認

4. **音声機能の確認**
   - TTSが正しく動作するか
   - 音声ファイルの再生確認

### 5. トラブルシューティング

#### ビルドエラーの場合
- Node.jsバージョンを確認（20.x推奨）
- 依存関係のインストールを確認

#### API通信エラーの場合
- CORS設定を確認
- 環境変数が正しく設定されているか確認
- APIエンドポイントのURLを確認

#### PWAが動作しない場合
- HTTPSで配信されているか確認
- manifest.jsonのパスを確認
- Service Workerのスコープを確認