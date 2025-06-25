# 5分気晴らし - 音声ガイド付きストレス解消アプリ

職場の人間関係でストレスを抱える20-40代向けの、シンプルで使いやすい気晴らし提案アプリケーション。

## 🎯 プロジェクトの目的

- **ターゲット**: 職場の人間関係でストレスを抱え、休日をゲーム・YouTube・惰眠で過ごしてしまう20-40代
- **解決する課題**: 既存メンタルヘルスアプリの課金ストレス、継続困難、機能過多による挫折
- **提供価値**: その場で使える、シンプルな気晴らし方法の提案

## ✨ 主な機能（Phase 1 MVP）

### 実装済み機能

- **AI提案**: Gemini APIを活用した動的な気晴らし提案生成
- **状況選択**: 職場・家・外出から選択
- **時間選択**: 5分・15分・30分から選択（時間に応じた提案内容）
- **音声ガイド**: Gemini TTSによる高品質な音声案内（オプション）
- **ブラウザ音声フォールバック**: Gemini TTS利用不可時は自動切り替え
- **詳細ガイド**: 各提案の詳しい実行方法と手順を表示
- **タイマー機能**: 開始・一時停止・リセット機能付きタイマー（音声連動）
- **ダークモード**: システム設定連動、手動切り替え可能
- **アニメーション**: スムーズなフェードイン・スライドイン効果
- **アクセシビリティ**: キーボードナビゲーション、ARIAラベル対応
- **PWA対応**: オフラインでも基本機能が動作、ホーム画面への追加可能
- **レスポンシブデザイン**: モバイルファースト設計、カード高さ統一
- **パフォーマンス最適化**: 動的インポート、バンドル分割実装済み
- **テスト環境**: Vitest統一、モック完全排除、全テスト成功（419/424テスト成功、5件スキップ）
- **ESモジュール対応**: フロントエンド/バックエンド共にESM採用
- **完全無料**: 広告なし、課金なし、アカウント登録不要

### Phase 2 実装済み機能

- **お気に入り機能**: 提案の保存、エクスポート機能付き
- **履歴機能**: 実行履歴の記録、フィルタリング、統計表示、評価・メモ機能
- **設定画面**: ダークモード切り替え、音声エンジン選択、データ管理機能
- **カラーパレット変更とUI改善**: 新デザインシステム導入、WCAG AA準拠のアクセシブルカラー、人間工学に基づくUI最適化
- **統計機能**: 時間帯・曜日・月別の利用パターン分析、Chart.jsによるグラフ可視化
- **カスタム気晴らし**: ユーザー独自の提案登録・編集・削除機能、エクスポート/インポート対応
- **統合データ管理**: 全データの一括エクスポート/インポート機能、デバイス間移行サポート、バックアップ機能
- **UI/UX改善**: モーダル視認性改善、ダークモード対応強化（継続課題あり）

### Phase 3 実装済み機能

- **CI/CD設定**: GitHub Actionsによる自動テスト・ビルド・デプロイパイプライン
- **セキュリティスキャン**: Trivy脆弱性スキャン、依存関係チェック自動化
- **Vercel Functions対応**: Express.js → Serverless Functions 移行完了
  - **API構造変更**: 個別関数化（suggestions, tts, health）
  - **自動URL切り替え**: 環境に応じたAPI endpoint自動設定
  - **最適化設定**: Vercel設定ファイル、環境変数管理

### 今後実装予定（Phase 3 残タスク）
- **Vercel プロジェクト作成**: Web UI経由でのGitHub連携
- **本番デプロイ**: 環境変数設定と初回デプロイ実行

### 研究・検証課題

- **Gemini API最適化**: YAML形式プロンプトの効果検証
- **ダークモード視認性**: WCAG AAA基準対応とコントラスト比最適化

## 🛠️ 技術スタック

- **フロントエンド**: React 18 + TypeScript, Vite, Tailwind CSS, PWA
- **バックエンド**: Vercel Functions (Serverless) + TypeScript
- **AI/音声**: Google Gemini API (提案生成・TTS)
- **テスト**: Vitest (Frontend/Backend統一), モック使用完全排除
- **インフラ**: Vercel (Hosting + Functions), Google Cloud Platform

詳細は [technologystack.md](./technologystack.md) を参照してください。

**CI/CD**: GitHub Actions, Vercel Deployment, Trivy Security Scanner

詳細は [CI/CD設定ガイド](./docs/CI_CD_SETUP.md) を参照してください。

## 🚀 クイックスタート

### 前提条件

- Node.js 18.x 以上
- npm または yarn
- Docker Desktop（開発環境用）
- Google Cloud アカウント（API利用用）

### 環境構築

#### 方法1: Vercel Dev（推奨）

```bash
# リポジトリのクローン
git clone https://github.com/CaCC-Lab/kibarashi-app.git
cd kibarashi-app

# Vercel CLI のインストール
npm install -g vercel

# 依存関係のインストール
npm run setup

# 環境変数の設定
cp frontend/.env.example frontend/.env
# frontend/.envファイルを編集し、必要なAPI キーを設定

# Vercel Dev Server起動（フロントエンド + API統合）
vercel dev
# → http://localhost:3000 (フロントエンド + API)
```

#### 方法2: 個別起動

```bash
# 依存関係のインストール（フロントエンド）
cd frontend
npm install

# 依存関係のインストール（API）
cd ../api
npm install

# 環境変数の設定
cp ../frontend/.env.example ../frontend/.env
# .envファイルを編集し、必要なAPI キーを設定

# フロントエンド起動（ターミナル1）
cd frontend
npm run dev
# → http://localhost:3000

# APIサーバー起動（ターミナル2）
cd api
npx vercel dev
# → http://localhost:3000/api
```

### 開発環境へのアクセス

- **推奨**: http://localhost:3000 (Vercel Dev - フロントエンド + API統合)
- API エンドポイント: http://localhost:3000/api/v1/*
- ヘルスチェック: http://localhost:3000/api/v1/health

### 動作確認状況（2025/06/14）

- ✅ ローカル環境での動作確認完了
- ✅ フロントエンド・バックエンド連携確認
- ✅ Gemini API連携確認
- ✅ PWA機能確認
- ✅ 全体テスト成功率95.5%（406/425 tests passing）

## 📁 プロジェクト構造

```
kibarashi-app/
├── frontend/          # Reactフロントエンド
├── backend/           # 従来のExpress.jsバックエンド（保持）
├── api/              # Vercel Functions（新）
│   └── v1/           # APIエンドポイント
│       ├── suggestions.ts    # 気晴らし提案API
│       ├── tts.ts           # 音声合成API
│       └── health.ts        # ヘルスチェックAPI
├── infrastructure/    # インフラ設定
├── docs/             # ドキュメント
├── vercel.json       # Vercel設定
└── CLAUDE.md         # Claude Code用ガイド
```

詳細は [directorystructure.md](./directorystructure.md) を参照してください。

## 🧪 テスト

### テストポリシー

**重要**: このプロジェクトではモックの使用を一切禁止しています。

- すべてのテストは実際のサービス・APIを使用
- Vitest に統一（Frontend/Backend共通）
- テスト成功率: 95.5%（406/425 tests passing）
- 詳細は [TEST_GUIDELINES.md](./TEST_GUIDELINES.md) を参照

### テストコマンド

```bash
# フロントエンドテスト
cd frontend && npm test

# フロントエンドテストカバレッジ
cd frontend && npm run test:coverage

# バックエンドテスト
cd backend && npm test

# ビルドテスト
npm run build

# 本番ビルド
cd frontend && npm run build
cd backend && npm run build
```

## 🌐 デプロイメント

### Vercel デプロイ手順

#### 1. Vercel Web UIでのプロジェクト作成

1. [Vercel](https://vercel.com) にアクセス
2. "Continue with GitHub" でログイン
3. "Add New Project" → "Import Git Repository"
4. `kibarashi-app` リポジトリを選択・インポート

#### 2. 環境変数の設定

Vercel ダッシュボード → Project Settings → Environment Variables:

```
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_APPLICATION_CREDENTIALS={"type":"service_account",...}
```

#### 3. 自動デプロイ

- mainブランチにプッシュで自動デプロイ
- プレビュー環境は他ブランチで自動作成

### API エンドポイント構造

本番環境:
```
https://your-project.vercel.app/api/v1/suggestions
https://your-project.vercel.app/api/v1/tts
https://your-project.vercel.app/api/v1/health
```

開発環境:
```
http://localhost:3000/api/v1/suggestions
http://localhost:3000/api/v1/tts
http://localhost:3000/api/v1/health
```

## 📝 ドキュメント

- [開発仕様書](./音声ガイド付き気晴らしアプリ開発仕様書.md) - 詳細な要件定義とリスク分析
- [CLAUDE.md](./CLAUDE.md) - Claude Code用の開発ガイド
- [TODO.md](./TODO.md) - 開発タスクリスト

## 🤝 コントリビューション

現在このプロジェクトは個人開発のため、外部からのコントリビューションは受け付けていません。

## 📄 ライセンス

このプロジェクトは非公開プロジェクトです。

## 🎨 主な実装のポイント

### 人間工学に基づいたUI設計

- 3タップ以内で目的達成
- 視覚的フィードバックの充実
- カード高さの統一による整った見た目
- 音声生成中のローディング表示

### エラーハンドリング

- CSP（Content Security Policy）の適切な設定
- CORS設定の最適化
- Gemini TTS失敗時のブラウザTTSフォールバック
- ユーザーフレンドリーなエラーメッセージ

### パフォーマンス最適化

- React.lazy()による動的インポート
- バンドルサイズ: vendor (137KB), main (12KB)
- クリティカルCSSのインライン化
- Web Vitals監視機能

### 統合データ管理

- 全データ（お気に入り・履歴・カスタム気晴らし）の一括エクスポート/インポート
- デバイス間データ移行サポート（置換・マージモード）
- JSONファイルによるバックアップとリストア機能
- データ検証とバージョン管理による安全なインポート
- 重複チェック機能付きマージ処理

---

**開発方針**: シンプルさを最優先に、ユーザーのストレスを増やさない設計を心がけています。

最終更新: 2025/06/25 - Vercel Functions対応完了（API構造変更、Serverless Functions移行、デプロイ準備完了）
