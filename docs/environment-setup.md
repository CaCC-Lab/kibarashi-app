# 5分気晴らしアプリ 環境構築手順書

## 概要

本ドキュメントは、5分気晴らしアプリ（kibarashi-app）の開発環境を構築するための詳細な手順を説明します。Windows、macOS、Linux（WSL含む）環境での構築方法を網羅しています。

## 目次

1. [前提条件](#前提条件)
2. [必要なソフトウェア](#必要なソフトウェア)
3. [プロジェクトのセットアップ](#プロジェクトのセットアップ)
4. [Google Cloud Platform設定](#google-cloud-platform設定)
5. [環境変数の設定](#環境変数の設定)
6. [開発環境の起動](#開発環境の起動)
7. [動作確認](#動作確認)
8. [IDE設定](#ide設定)
9. [トラブルシューティング](#トラブルシューティング)

## 前提条件

### システム要件

- **OS**: Windows 10/11（WSL2推奨）、macOS 11以降、Ubuntu 20.04以降
- **メモリ**: 8GB以上（推奨: 16GB）
- **ストレージ**: 10GB以上の空き容量
- **インターネット接続**: 必須（依存関係のダウンロード用）

### 必要なアカウント

- GitHubアカウント
- Google Cloudアカウント（無料枠で開始可能）
- Vercelアカウント（オプション、デプロイ時に必要）

## 必要なソフトウェア

### 1. Git

```bash
# Windows (Git Bash推奨)
# https://git-scm.com/download/win からダウンロード

# macOS
brew install git

# Linux/WSL
sudo apt update && sudo apt install git

# バージョン確認（2.30以上推奨）
git --version
```

### 2. Node.js（v18.x以上）

```bash
# Node Version Manager (nvm) を使用（推奨）

# macOS/Linux/WSL
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Windows (nvm-windows)
# https://github.com/coreybutler/nvm-windows からダウンロード
nvm install 20.11.0
nvm use 20.11.0

# バージョン確認
node --version  # v20.x.x
npm --version   # 10.x.x
```

### 3. Docker（オプション、推奨）

```bash
# Docker Desktop
# https://www.docker.com/products/docker-desktop/ からダウンロード

# Linux
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# バージョン確認
docker --version
docker-compose --version
```

### 4. VS Code（推奨エディタ）

```bash
# https://code.visualstudio.com/ からダウンロード

# 推奨拡張機能（後述）
```

## プロジェクトのセットアップ

### 1. リポジトリのクローン

```bash
# プロジェクトディレクトリを作成
mkdir -p ~/projects
cd ~/projects

# リポジトリをクローン
git clone https://github.com/your-username/kibarashi-app.git
cd kibarashi-app

# 開発ブランチを作成
git checkout -b develop
```

### 2. 依存関係のインストール

```bash
# ルートディレクトリで実行
npm install

# フロントエンドの依存関係
cd frontend
npm install

# バックエンドの依存関係
cd ../backend
npm install

# ルートに戻る
cd ..
```

### 3. 初期ビルドの実行

```bash
# すべてのプロジェクトをビルド
npm run build

# または個別にビルド
npm run build:frontend
npm run build:backend
```

## Google Cloud Platform設定

### 1. プロジェクトの作成

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成（例: `kibarashi-app-dev`）
3. プロジェクトIDをメモ（後で使用）

### 2. 必要なAPIの有効化

```bash
# gcloud CLIのインストール（オプション）
# https://cloud.google.com/sdk/docs/install

# プロジェクトを設定
gcloud config set project YOUR_PROJECT_ID

# 必要なAPIを有効化
gcloud services enable generativelanguage.googleapis.com
gcloud services enable texttospeech.googleapis.com
```

または、コンソールから手動で有効化：

1. APIs & Services > Enable APIs and Services
2. 以下のAPIを検索して有効化：
   - Generative Language API（Gemini）
   - Cloud Text-to-Speech API

### 3. APIキーの作成

#### Gemini API キー

1. [Google AI Studio](https://makersuite.google.com/app/apikey)にアクセス
2. "Create API Key"をクリック
3. APIキーを安全に保存（3つ作成推奨）

#### Cloud Text-to-Speech API キー

1. Google Cloud Console > APIs & Services > Credentials
2. "Create Credentials" > "API Key"
3. APIキーを制限（推奨）：
   - Application restrictions: HTTP referrers
   - API restrictions: Cloud Text-to-Speech API only

### 4. サービスアカウント（オプション）

より安全な認証方法として：

```bash
# サービスアカウントを作成
gcloud iam service-accounts create kibarashi-dev \
    --display-name="Kibarashi Dev Service Account"

# キーファイルを生成
gcloud iam service-accounts keys create \
    ./backend/gcp-credentials/service-account-key.json \
    --iam-account=kibarashi-dev@YOUR_PROJECT_ID.iam.gserviceaccount.com

# 必要な権限を付与
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:kibarashi-dev@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/cloudtexttospeech.user"
```

## 環境変数の設定

### 1. バックエンド環境変数

```bash
# backend/.env.example をコピー
cd backend
cp .env.example .env

# .env ファイルを編集
# エディタで開いて必要な値を設定
```

`backend/.env` の設定例：

```bash
# サーバー設定
PORT=8080
NODE_ENV=development

# CORS設定
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# Google Cloud Platform
GOOGLE_CLOUD_PROJECT_ID=your-project-id

# Gemini API（複数キー推奨）
GEMINI_API_KEY_1=AIzaSy...最初のキー
GEMINI_API_KEY_2=AIzaSy...2番目のキー
GEMINI_API_KEY_3=AIzaSy...3番目のキー
GEMINI_MODEL=gemini-pro
GEMINI_KEY_ROTATION_ENABLED=true

# Google Cloud Text-to-Speech
TTS_LANGUAGE_CODE=ja-JP
TTS_VOICE_NAME=ja-JP-Neural2-B

# Redis設定（Dockerを使用する場合）
REDIS_HOST=localhost
REDIS_PORT=6379

# ログ設定
LOG_LEVEL=debug
```

### 2. フロントエンド環境変数

```bash
# frontend/.env.example をコピー
cd ../frontend
cp .env.example .env

# .env ファイルを編集
```

`frontend/.env` の設定例：

```bash
# API設定
VITE_API_URL=http://localhost:8080
VITE_API_VERSION=v1

# 機能フラグ
VITE_ENABLE_VOICE=true
VITE_ENABLE_OFFLINE=true

# デバッグ
VITE_DEBUG_MODE=true
```

### 3. 環境変数の検証

```bash
# ルートディレクトリに戻る
cd ..

# 環境変数チェックスクリプトを実行
npm run check:env
```

## 開発環境の起動

### 方法1: Dockerを使用（推奨）

```bash
# すべてのサービスを起動
docker-compose up -d

# ログを確認
docker-compose logs -f

# 特定のサービスのみ起動
docker-compose up -d frontend backend

# サービスの停止
docker-compose down
```

### 方法2: ローカルで直接実行

```bash
# ターミナル1: バックエンドを起動
cd backend
npm run dev

# ターミナル2: フロントエンドを起動
cd frontend
npm run dev

# ターミナル3: Redisを起動（オプション）
redis-server
```

### 方法3: 統合開発コマンド

```bash
# ルートディレクトリで実行
npm run dev

# これは以下を同時に実行：
# - フロントエンド開発サーバー
# - バックエンド開発サーバー
# - ファイル監視
```

## 動作確認

### 1. 基本的な動作確認

```bash
# フロントエンドの確認
open http://localhost:3000

# バックエンドAPIの確認
curl http://localhost:8080/api/v1/health

# 期待されるレスポンス
{
  "status": "healthy",
  "timestamp": "2025-01-07T12:00:00.000Z",
  "version": "1.0.0",
  "environment": "development"
}
```

### 2. 機能テスト

#### A. 提案APIのテスト

```bash
# 提案を取得
curl "http://localhost:8080/api/v1/suggestions?situation=workplace&duration=5"

# 期待されるレスポンス（3つの提案）
{
  "suggestions": [
    {
      "id": "...",
      "title": "深呼吸エクササイズ",
      "description": "...",
      "duration": 5,
      "category": "認知的"
    },
    // ... 2つ以上の提案
  ]
}
```

#### B. PWAインストールテスト

1. Chrome DevToolsを開く（F12）
2. Application タブ > Service Workers
3. Service Workerが登録されていることを確認
4. アドレスバーにインストールアイコンが表示されることを確認

### 3. テストスイートの実行

```bash
# すべてのテストを実行
npm test

# フロントエンドテストのみ
npm run test:frontend

# バックエンドテストのみ
npm run test:backend

# カバレッジレポート付き
npm run test:coverage
```

## IDE設定

### VS Code推奨設定

1. **必須拡張機能**をインストール：

```bash
# 拡張機能の一括インストール
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension bradlc.vscode-tailwindcss
code --install-extension formulahendry.auto-rename-tag
code --install-extension aaron-bond.better-comments
```

2. **ワークスペース設定**（`.vscode/settings.json`）:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ],
  "files.exclude": {
    "**/node_modules": true,
    "**/.next": true,
    "**/dist": true
  }
}
```

3. **デバッグ設定**（`.vscode/launch.json`）:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Frontend Debug",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/frontend"
    },
    {
      "name": "Backend Debug",
      "type": "node",
      "request": "launch",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/backend/src/server.js",
      "envFile": "${workspaceFolder}/backend/.env"
    }
  ]
}
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. npm install エラー

```bash
# エラー: EACCES permissions error
解決方法:
# npmのグローバルディレクトリを変更
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# エラー: node-gyp rebuild failed
解決方法:
# ビルドツールをインストール
# Windows
npm install --global windows-build-tools
# macOS
xcode-select --install
# Linux
sudo apt-get install build-essential
```

#### 2. ポート競合

```bash
# エラー: Port 3000/8080 is already in use
解決方法:
# 使用中のプロセスを確認
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# プロセスを終了
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# または別のポートを使用
PORT=3001 npm run dev
```

#### 3. Docker関連

```bash
# エラー: Cannot connect to Docker daemon
解決方法:
# Docker Desktopが起動していることを確認
# Linuxの場合、ユーザーをdockerグループに追加
sudo usermod -aG docker $USER
newgrp docker

# エラー: docker-compose: command not found
解決方法:
# Docker Composeをインストール
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 4. API接続エラー

```bash
# エラー: Failed to fetch from API
解決方法:
1. バックエンドが起動していることを確認
2. CORSの設定を確認（.env の CORS_ORIGIN）
3. APIのURLが正しいことを確認（frontend/.env）
4. ブラウザの開発者ツールでネットワークタブを確認
```

#### 5. Google API エラー

```bash
# エラー: API key not valid
解決方法:
1. APIキーが正しくコピーされているか確認
2. APIが有効化されているか確認
3. APIキーの制限設定を確認

# エラー: Quota exceeded
解決方法:
1. 複数のAPIキーをローテーション使用
2. Google Cloud Consoleで使用量を確認
3. 必要に応じて有料プランにアップグレード
```

### 開発のヒント

1. **ホットリロード**が効かない場合：
   ```bash
   # node_modulesを削除して再インストール
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **TypeScriptエラー**が消えない場合：
   ```bash
   # TypeScriptサーバーを再起動
   # VS Code: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
   ```

3. **テストが遅い**場合：
   ```bash
   # 特定のテストだけ実行
   npm test -- --testNamePattern="UserService"
   
   # ウォッチモードで開発
   npm test -- --watch
   ```

## 次のステップ

環境構築が完了したら：

1. [開発ガイドライン](./development-guidelines.md)を読む
2. [アーキテクチャ設計書](./architecture.md)を確認
3. [TODO.md](../TODO.md)で現在のタスクを確認
4. featureブランチを作成して開発開始

```bash
# 新機能の開発を開始
git checkout -b feature/your-feature-name
```

## サポート

問題が解決しない場合：

1. [トラブルシューティングガイド](./troubleshooting-guide.md)を確認
2. プロジェクトのIssuesを検索
3. 新しいIssueを作成（詳細なエラーログを含める）

---

最終更新: 2025-01-07