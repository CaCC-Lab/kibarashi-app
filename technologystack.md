# 技術スタック定義書

このファイルは「5分気晴らし」アプリケーションで使用する技術・ライブラリ・バージョンを定義します。
**重要**: ここに記載されたバージョンや技術スタックは、いかなる理由があっても勝手に変更してはいけません。

## フロントエンド

### コアテクノロジー
- **React**: 18.2.0
- **TypeScript**: 5.3.3
- **React Router**: 6.21.1

### UIフレームワーク
- **Tailwind CSS**: 3.4.0
- **@headlessui/react**: 1.7.17（アクセシブルなUIコンポーネント）
- **@heroicons/react**: 2.0.18（アイコンセット）

### PWA関連
- **workbox-webpack-plugin**: 7.0.0
- **workbox-precaching**: 7.0.0
- **workbox-routing**: 7.0.0

### 状態管理
- **Context API**: React内蔵（追加ライブラリなし）

### ビルドツール
- **Vite**: 5.0.10（Create React App の代替）
- **@vitejs/plugin-react**: 4.2.1

### 開発ツール
- **ESLint**: 8.56.0
- **Prettier**: 3.1.1
- **@typescript-eslint/parser**: 6.17.0
- **@typescript-eslint/eslint-plugin**: 6.17.0

## バックエンド

### コアテクノロジー
- **Node.js**: 20.10.0 LTS
- **Express.js**: 4.18.2
- **TypeScript**: 5.3.3

### ミドルウェア
- **cors**: 2.8.5
- **helmet**: 7.1.0（セキュリティヘッダー）
- **express-rate-limit**: 7.1.5（レート制限）
- **compression**: 1.7.4

### バリデーション
- **zod**: 3.22.4（スキーマバリデーション）

### ロギング
- **winston**: 3.11.0
- **morgan**: 1.10.0（HTTPリクエストロガー）

### 開発ツール
- **nodemon**: 3.0.2
- **ts-node**: 10.9.2
- **@types/node**: 20.10.6
- **@types/express**: 4.17.21

## AI・音声処理

### Google Cloud SDK
- **@google-cloud/text-to-speech**: 5.0.1
- **@google-ai/generativelanguage**: 1.1.0（Gemini API）

### 音声処理
- **Web Audio API**: ブラウザ内蔵（追加ライブラリなし）

## データベース（Phase 2以降）

### PostgreSQL
- **PostgreSQL**: 16.1
- **pg**: 8.11.3（Node.js ドライバー）
- **@types/pg**: 8.10.9

### Redis
- **Redis**: 7.2.3
- **ioredis**: 5.3.2
- **@types/ioredis**: 5.0.0

## テスティング

### ユニットテスト
- **Jest**: 29.7.0
- **@testing-library/react**: 14.1.2
- **@testing-library/jest-dom**: 6.1.6
- **@testing-library/user-event**: 14.5.2

### APIテスト
- **supertest**: 6.3.3
- **@types/supertest**: 6.0.2

### E2Eテスト（Phase 2以降）
- **Playwright**: 1.40.1

## インフラストラクチャ

### コンテナ化
- **Docker**: 24.0.7
- **Docker Compose**: 2.23.3

### Google Cloud Platform
- **Firebase Hosting**: 最新版
- **Cloud Functions**: Node.js 20 ランタイム
- **Cloud Storage**: 標準ストレージクラス

### CI/CD
- **GitHub Actions**: 最新版
- **act**: 0.2.57（ローカルでのActions実行）

## 環境変数

以下の環境変数が必要です（.env.exampleを参照）：

```bash
# Google Cloud
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json

# Gemini API
GEMINI_API_KEY=your-gemini-api-key

# Server
PORT=8080
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## パッケージマネージャー

- **npm**: 10.2.5（Node.js 20.10.0 に同梱）
- **lockfileVersion**: 3

## サポートブラウザ

### 必須サポート
- Chrome/Edge: 最新2バージョン
- Safari: 最新2バージョン（iOS含む）
- Firefox: 最新2バージョン

### PWAサポート
- Chrome/Edge: フル機能
- Safari: 制限付きサポート（プッシュ通知なし）
- Firefox: 基本機能のみ

## セキュリティポリシー

### HTTPSの使用
- 本番環境では必須
- 開発環境ではオプション

### Content Security Policy
```
default-src 'self';
script-src 'self' 'unsafe-inline' https://apis.google.com;
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
font-src 'self';
connect-src 'self' https://*.googleapis.com;
media-src 'self' https://storage.googleapis.com;
```

## 更新履歴

- 2025/01/06: 初版作成

---

**重要な注意事項**:
1. このファイルに記載されたバージョンは固定です。アップグレードが必要な場合は必ず事前承認を得てください。
2. 新しい依存関係の追加も同様に事前承認が必要です。
3. セキュリティパッチは例外として、速やかに適用することができます。