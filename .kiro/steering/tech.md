# Tech Steering

## 言語・ランタイム
- TypeScript 5.x（strict mode）
- Node.js 20.x
- React 18

## 主要ライブラリ
- Vite（ビルドツール）
- Tailwind CSS（スタイリング）
- Express.js（バックエンド）
- Vitest（ユニット/統合テスト）
- Playwright（E2Eテスト）
- @google/generative-ai（Gemini API）

## コーディング規約
- 型ヒント必須（any型の使用禁止、unknown + 型ガードを使う）
- console.log 禁止（構造化ロギングを使用）
- ESLint + Prettier 準拠

## テストフレームワーク
- フロントエンド: Vitest + React Testing Library
- バックエンド: Vitest
- E2E: Playwright
- API: Mocha

## モノレポ構成
- frontend/ - React フロントエンド
- backend/ - Express バックエンド
- packages/core-logic/ - 共有ロジック
- api/ - Vercel サーバーレス関数
- tests/ - E2E・統合テスト

## 開発フロー
- Canon TDD（テスト先行、tests/変更禁止）
- Living Spec（Kiro Spec 継続同期）
- AI開発フロー v7.8.5b 準拠
