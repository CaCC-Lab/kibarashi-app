# 5分気晴らし - 音声ガイド付きストレス解消アプリ

職場の人間関係でストレスを抱える20-40代向けの、シンプルで使いやすい気晴らし提案アプリケーション。

## 🎯 プロジェクトの目的

- **ターゲット**: 職場の人間関係でストレスを抱え、休日をゲーム・YouTube・惰眠で過ごしてしまう20-40代
- **解決する課題**: 既存メンタルヘルスアプリの課金ストレス、継続困難、機能過多による挫折
- **提供価値**: その場で使える、シンプルな気晴らし方法の提案

## ✨ 主な機能（Phase 1 MVP）

### 実装済み機能
- **状況選択**: 職場・家・外出から選択
- **時間選択**: 5分・15分・30分から選択
- **気晴らし提案**: 状況と時間に応じた3つの提案を表示（静的データ使用中）
- **詳細ガイド**: 各提案の詳しい実行方法を表示
- **タイマー機能**: 開始・一時停止・リセット機能付きタイマー
- **進行状況表示**: 視覚的な進行状況バー
- **レスポンシブデザイン**: モバイル・タブレット・デスクトップ対応
- **PWA対応**: オフラインでも基本機能が動作
- **設定ボタン**: 今後の機能拡張に向けたプレースホルダー
- **完全無料**: 広告なし、課金なし、アカウント登録不要

### 今後実装予定
- **AI提案**: Gemini APIを活用した動的な提案生成
- **音声ガイド**: Google Cloud TTSによる音声案内

## 🛠️ 技術スタック

- **フロントエンド**: React 18 + TypeScript, Tailwind CSS, PWA
- **バックエンド**: Node.js + Express.js
- **AI/音声**: Google Gemini API, Google Cloud Text-to-Speech
- **インフラ**: Google Cloud Platform, Firebase Hosting

詳細は [technologystack.md](./technologystack.md) を参照してください。

## 🚀 クイックスタート

### 前提条件

- Node.js 18.x 以上
- npm または yarn
- Docker Desktop（開発環境用）
- Google Cloud アカウント（API利用用）

### 環境構築

```bash
# リポジトリのクローン
git clone [repository-url]
cd kibarashi-app

# 依存関係のインストール
npm run setup

# 環境変数の設定
cp .env.example .env
# .envファイルを編集し、必要なAPI キーを設定

# 開発サーバーの起動
npm run dev

# フロントエンドのみ起動
npm run dev:frontend

# バックエンドのみ起動
npm run dev:backend
```

### 開発環境へのアクセス

- フロントエンド: http://localhost:3000
- バックエンド API: http://localhost:8080
- API ドキュメント: http://localhost:8080/api-docs

## 📁 プロジェクト構造

```
kibarashi-app/
├── frontend/          # Reactフロントエンド
├── backend/           # Node.jsバックエンド  
├── infrastructure/    # インフラ設定
├── docs/             # ドキュメント
└── CLAUDE.md         # Claude Code用ガイド
```

詳細は [directorystructure.md](./directorystructure.md) を参照してください。

## 🧪 テスト

```bash
# ユニットテスト
npm run test:unit

# 統合テスト
npm run test:integration

# E2Eテスト
npm run test:e2e
```

## 🌐 デプロイメント

本番環境へのデプロイは GitHub Actions により自動化されています。
mainブランチへのマージで自動的にデプロイが実行されます。

## 📝 ドキュメント

- [開発仕様書](./音声ガイド付き気晴らしアプリ開発仕様書.md) - 詳細な要件定義とリスク分析
- [CLAUDE.md](./CLAUDE.md) - Claude Code用の開発ガイド
- [TODO.md](./TODO.md) - 開発タスクリスト

## 🤝 コントリビューション

現在このプロジェクトは個人開発のため、外部からのコントリビューションは受け付けていません。

## 📄 ライセンス

このプロジェクトは非公開プロジェクトです。

---

**開発方針**: シンプルさを最優先に、ユーザーのストレスを増やさない設計を心がけています。