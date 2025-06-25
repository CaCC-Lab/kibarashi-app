# ローカル開発環境セットアップガイド

## 概要

Vercel Functions対応後のローカル開発環境の構築と運用方法について説明します。

## 前提条件

- Node.js 20.x 以上
- npm 10.x 以上
- Git
- Google Cloud Platform アカウント
- Gemini API キー

## 1. 開発環境の種類

### 1.1 推奨: Vercel Dev Server

**メリット**:
- 本番環境と同じ構成
- フロントエンド + API統合
- 自動リロード機能
- Vercel Functions完全対応

**用途**: メイン開発環境

### 1.2 個別起動方式

**メリット**:
- デバッグしやすい
- 従来の開発フロー
- ポート分離

**用途**: デバッグや特定の開発作業

## 2. Vercel Dev Server セットアップ（推奨）

### 2.1 初期設定

```bash
# リポジトリクローン
git clone https://github.com/your-username/kibarashi-app.git
cd kibarashi-app

# Vercel CLI インストール
npm install -g vercel

# 依存関係の一括インストール
npm run setup
```

### 2.2 環境変数設定

```bash
# フロントエンド環境変数
cp frontend/.env.example frontend/.env

# frontend/.env を編集
nano frontend/.env
```

**設定例**:
```env
# API設定
VITE_API_URL=http://localhost:3000
VITE_API_TIMEOUT=30000

# アプリケーション設定
VITE_APP_NAME=5分気晴らし
VITE_APP_VERSION=1.0.0

# PWA設定
VITE_ENABLE_PWA=true
VITE_ENABLE_OFFLINE=true

# 音声設定
VITE_ENABLE_VOICE_GUIDE=true
VITE_DEFAULT_VOICE_SPEED=1.0

# デバッグ設定
VITE_ENABLE_DEBUG=true
VITE_LOG_LEVEL=info
```

### 2.3 Vercel環境変数設定

```bash
# Vercel環境変数の追加
vercel env add GEMINI_API_KEY
# → プロンプトでAPI キーを入力

vercel env add GOOGLE_APPLICATION_CREDENTIALS
# → プロンプトでGCPサービスアカウントJSONを入力（1行文字列）
```

### 2.4 開発サーバー起動

```bash
# Vercel Dev Server起動
vercel dev

# アクセス先
# フロントエンド: http://localhost:3000
# API: http://localhost:3000/api/v1/*
```

## 3. 個別起動方式セットアップ

### 3.1 フロントエンド個別起動

```bash
cd frontend
npm install
npm run dev

# アクセス先: http://localhost:3000
```

### 3.2 API個別起動

```bash
cd api
npm install

# 環境変数設定
export GEMINI_API_KEY="your_api_key"
export GOOGLE_APPLICATION_CREDENTIALS='{"type":"service_account",...}'

# Vercel Functions Dev起動
npx vercel dev --listen 3001

# アクセス先: http://localhost:3001/api/v1/*
```

### 3.3 API URL設定調整

**frontend/.env の調整**:
```env
VITE_API_URL=http://localhost:3001
```

## 4. 開発ワークフロー

### 4.1 日常的な開発手順

```bash
# 1. 最新コードの取得
git pull origin main

# 2. 依存関係の更新確認
npm run setup

# 3. 開発サーバー起動
vercel dev

# 4. ブラウザでアクセス
# http://localhost:3000
```

### 4.2 API開発

```bash
# API関数の編集
# api/v1/suggestions.ts
# api/v1/tts.ts
# api/v1/health.ts

# 保存すると自動的にホットリロード
```

### 4.3 フロントエンド開発

```bash
# Reactコンポーネントの編集
# frontend/src/components/
# frontend/src/features/

# 保存すると自動的にホットリロード
```

## 5. デバッグ手法

### 5.1 API関数のデバッグ

```typescript
// api/v1/suggestions.ts
console.log('Debug: suggestions request', req.query);

// Vercel Dev Serverのログで確認
```

### 5.2 フロントエンドのデバッグ

```typescript
// frontend/src/components/
console.log('Debug: component state', state);

// ブラウザのDevToolsで確認
```

### 5.3 ネットワークトラフィック確認

```bash
# API リクエストの確認
curl "http://localhost:3000/api/v1/health"
curl "http://localhost:3000/api/v1/suggestions?situation=workplace&duration=5"
```

## 6. テスト実行

### 6.1 全体テスト

```bash
# ルートディレクトリで実行
npm test
```

### 6.2 個別テスト

```bash
# フロントエンドテスト
cd frontend
npm test

# カバレッジ付きテスト
npm run test:coverage

# テストファイル単体実行
npm test -- --run src/components/Button.test.tsx
```

### 6.3 ビルドテスト

```bash
# 本番ビルドテスト
npm run build

# フロントエンド個別ビルド
cd frontend
npm run build

# ビルド結果の確認
npm run preview
```

## 7. ホットリロードとライブ更新

### 7.1 Vercel Dev Serverの機能

- **フロントエンド**: 保存時に自動リロード
- **API関数**: 保存時に自動再起動
- **環境変数**: 手動再起動が必要

### 7.2 手動再起動が必要な場合

```bash
# 環境変数変更時
Ctrl+C
vercel dev

# vercel.json変更時
Ctrl+C
vercel dev
```

## 8. 環境変数管理

### 8.1 開発環境での設定方法

**方法1: Vercel CLI（推奨）**
```bash
vercel env add VARIABLE_NAME
vercel env ls  # 設定済み環境変数の確認
```

**方法2: .envファイル（フロントエンドのみ）**
```bash
# frontend/.env
VITE_API_URL=http://localhost:3000
```

### 8.2 環境変数の優先順位

1. Vercel環境変数（API関数用）
2. process.env（システム環境変数）
3. .envファイル（フロントエンドのみ）

## 9. トラブルシューティング

### 9.1 Vercel Dev Server起動失敗

**症状**: `vercel dev` でエラー

**対策**:
```bash
# Vercelログイン確認
vercel whoami

# 再ログイン
vercel login

# プロジェクト再リンク
vercel link
```

### 9.2 API関数の500エラー

**症状**: `/api/v1/*` が500エラー

**対策**:
```bash
# 環境変数確認
vercel env ls

# ログ確認
# Vercel Dev Serverのコンソール出力を確認

# 関数の個別テスト
curl -v "http://localhost:3000/api/v1/health"
```

### 9.3 フロントエンドのAPI接続エラー

**症状**: フロントエンドからAPIにアクセスできない

**対策**:
```bash
# 環境変数確認
grep VITE_API_URL frontend/.env

# APIエンドポイント直接確認
curl "http://localhost:3000/api/v1/health"

# CORS設定確認
# ブラウザのDevTools → Network タブでエラー詳細確認
```

### 9.4 依存関係エラー

**症状**: npm install でエラー

**対策**:
```bash
# node_modules削除
rm -rf node_modules package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json
rm -rf api/node_modules api/package-lock.json

# 再インストール
npm run setup
```

## 10. パフォーマンス最適化

### 10.1 開発サーバーの高速化

```bash
# Node.js最大メモリ増加
export NODE_OPTIONS="--max-old-space-size=4096"
vercel dev
```

### 10.2 ホットリロード最適化

```bash
# 不要なファイル監視除外
# .vercelignore に追加
node_modules
.git
*.log
```

## 11. VS Code統合

### 11.1 推奨拡張機能

- **Vercel**: プロジェクト管理
- **TypeScript Hero**: 自動インポート
- **ES7+ React/Redux/React-Native snippets**: React開発
- **Tailwind CSS IntelliSense**: スタイリング

### 11.2 デバッグ設定

`.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Vercel Dev",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/vercel",
      "args": ["dev"],
      "console": "integratedTerminal"
    }
  ]
}
```

## 12. 開発ベストプラクティス

### 12.1 コミット前チェック

```bash
# テスト実行
npm test

# ビルド確認
npm run build

# リント確認
npm run lint

# フォーマット確認
npm run format
```

### 12.2 ブランチ戦略

```bash
# 機能開発ブランチ
git checkout -b feature/new-feature
git commit -m "feat: 新機能の実装"
git push origin feature/new-feature

# mainにマージ後、Vercelで自動デプロイ
```

---

**作成日**: 2025/06/25
**更新日**: 2025/06/25
**担当者**: Claude Code