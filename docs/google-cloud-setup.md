# Google Cloud Platform セットアップガイド

## 1. GCPプロジェクトの作成

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成
   - プロジェクト名: `kibarashi-app` (任意)
   - プロジェクトIDをメモ（後で使用）

## 2. 必要なAPIの有効化

以下のAPIを有効化する：

### Gemini API
```bash
gcloud services enable generativelanguage.googleapis.com
```

### Cloud Text-to-Speech API
```bash
gcloud services enable texttospeech.googleapis.com
```

## 3. 認証情報の設定

### サービスアカウントの作成
```bash
# サービスアカウント作成
gcloud iam service-accounts create kibarashi-app-sa \
  --display-name="Kibarashi App Service Account"

# 必要な権限を付与
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:kibarashi-app-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudtexttospeech.user"

# 認証キーの生成
gcloud iam service-accounts keys create \
  ./gcp-credentials/service-account-key.json \
  --iam-account=kibarashi-app-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### Gemini API キーの取得
1. [Google AI Studio](https://makersuite.google.com/app/apikey)にアクセス
2. APIキーを生成
3. `.env`ファイルに設定

## 4. 環境変数の設定

```bash
# .env.exampleを.envにコピー
cp .env.example .env

# .envファイルを編集
GOOGLE_CLOUD_PROJECT_ID=your-actual-project-id
GEMINI_API_KEY=your-actual-gemini-api-key
```

## 5. ローカル開発環境の確認

```bash
# Google Cloud SDKの認証
gcloud auth application-default login

# プロジェクトの設定
gcloud config set project YOUR_PROJECT_ID

# APIの有効化確認
gcloud services list --enabled
```

## 6. 料金の確認

### 無料枠
- Gemini API: 60 requests/minute (無料枠あり)
- Cloud Text-to-Speech: 月100万文字まで無料

### 推定コスト（Phase 1）
- 開発期間中: ほぼ無料枠内で収まる想定
- 本番運用: 月$10-50程度（利用量による）

## トラブルシューティング

### API有効化エラー
```bash
# プロジェクトIDの確認
gcloud config get-value project

# 課金アカウントの確認
gcloud beta billing projects describe YOUR_PROJECT_ID
```

### 認証エラー
```bash
# 認証情報の確認
echo $GOOGLE_APPLICATION_CREDENTIALS

# 権限の確認
gcloud projects get-iam-policy YOUR_PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:kibarashi-app-sa@*"
```