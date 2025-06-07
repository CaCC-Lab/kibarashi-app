# ディレクトリ構成定義書

このファイルは「5分気晴らし」アプリケーションのディレクトリ構造と配置ルールを定義します。
**重要**: この構造は厳守してください。新しいファイルは必ず適切な場所に配置してください。

## プロジェクト全体構造

```
kibarashi-app/
├── frontend/                 # Reactフロントエンドアプリケーション
├── backend/                  # Node.js/Expressバックエンドサーバー
├── infrastructure/           # インフラストラクチャ設定
├── docs/                     # プロジェクトドキュメント
├── .env.example             # 環境変数のテンプレート
├── .gitignore               # Git除外設定
├── docker-compose.yml       # Docker Compose設定
├── package.json             # ルートパッケージ設定（スクリプト用）
├── README.md                # プロジェクト概要
├── CLAUDE.md                # Claude Code用ガイド
├── TODO.md                  # タスク管理
├── technologystack.md       # 技術スタック定義
└── directorystructure.md    # このファイル
```

## フロントエンド構造 (/frontend)

```
frontend/
├── src/
│   ├── components/          # 再利用可能なUIコンポーネント
│   │   ├── common/         # 汎用コンポーネント
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── ErrorMessage.tsx
│   │   ├── layout/         # レイアウトコンポーネント
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── MainLayout.tsx
│   │   └── audio/          # 音声関連コンポーネント
│   │       ├── AudioPlayer.tsx
│   │       └── VoiceGuide.tsx
│   ├── features/           # 機能別モジュール
│   │   ├── suggestion/     # 気晴らし提案機能
│   │   │   ├── SuggestionList.tsx
│   │   │   ├── SuggestionCard.tsx
│   │   │   └── useSuggestions.ts
│   │   ├── situation/      # 状況選択機能
│   │   │   ├── SituationSelector.tsx
│   │   │   └── useSituation.ts
│   │   └── duration/       # 時間選択機能
│   │       ├── DurationSelector.tsx
│   │       └── useDuration.ts
│   ├── services/           # API通信・外部サービス
│   │   ├── api/           # APIクライアント
│   │   │   ├── client.ts
│   │   │   ├── suggestions.ts
│   │   │   └── tts.ts
│   │   └── storage/       # ローカルストレージ
│   │       └── localStorage.ts
│   ├── utils/             # ユーティリティ関数
│   │   ├── constants.ts   # 定数定義
│   │   ├── helpers.ts     # ヘルパー関数
│   │   └── validators.ts  # バリデーション
│   ├── types/             # TypeScript型定義
│   │   ├── index.ts       # 共通型定義
│   │   ├── api.ts         # API関連の型
│   │   └── suggestion.ts  # 提案関連の型
│   ├── styles/            # グローバルスタイル
│   │   └── globals.css    # Tailwind CSSインポート
│   ├── App.tsx            # メインアプリコンポーネント
│   ├── index.tsx          # エントリーポイント
│   └── vite-env.d.ts      # Vite型定義
├── public/                 # 静的ファイル
│   ├── manifest.json      # PWAマニフェスト
│   ├── robots.txt         # クローラー設定
│   ├── icons/             # アプリアイコン
│   └── offline.html       # オフラインページ
├── tests/                  # テストファイル
│   ├── unit/              # ユニットテスト
│   ├── integration/       # 統合テスト
│   └── setup.ts           # テスト設定
├── .env.example           # フロントエンド環境変数
├── .eslintrc.json         # ESLint設定
├── .prettierrc            # Prettier設定
├── index.html             # HTMLテンプレート
├── package.json           # 依存関係
├── tsconfig.json          # TypeScript設定
└── vite.config.ts         # Viteビルド設定
```

## バックエンド構造 (/backend)

```
backend/
├── src/
│   ├── api/               # APIエンドポイント
│   │   ├── routes/        # ルート定義
│   │   │   ├── index.ts
│   │   │   ├── suggestions.ts
│   │   │   └── tts.ts
│   │   ├── controllers/   # コントローラー
│   │   │   ├── suggestionController.ts
│   │   │   └── ttsController.ts
│   │   └── middleware/    # ミドルウェア
│   │       ├── auth.ts    # 認証（Phase 2）
│   │       ├── cors.ts    # CORS設定
│   │       ├── errorHandler.ts
│   │       └── rateLimit.ts
│   ├── services/          # ビジネスロジック
│   │   ├── gemini/        # Gemini API連携
│   │   │   ├── client.ts
│   │   │   └── promptBuilder.ts
│   │   ├── tts/           # Text-to-Speech
│   │   │   └── googleTTS.ts
│   │   └── suggestion/    # 提案ロジック
│   │       ├── generator.ts
│   │       └── fallbackData.ts
│   ├── utils/             # 共通ユーティリティ
│   │   ├── logger.ts      # ロギング設定
│   │   ├── config.ts      # 設定管理
│   │   └── validators.ts  # 入力検証
│   ├── types/             # TypeScript型定義
│   │   └── index.ts
│   ├── data/              # 静的データ
│   │   └── suggestions.json
│   └── server.ts          # サーバーエントリーポイント
├── tests/                  # テストファイル
│   ├── unit/
│   ├── integration/
│   └── fixtures/          # テストデータ
├── .env.example           # バックエンド環境変数
├── .eslintrc.json         # ESLint設定
├── .prettierrc            # Prettier設定
├── nodemon.json           # Nodemon設定
├── package.json           # 依存関係
└── tsconfig.json          # TypeScript設定
```

## インフラストラクチャ構造 (/infrastructure)

```
infrastructure/
├── docker/                 # Docker設定
│   ├── frontend/          # フロントエンド用
│   │   └── Dockerfile
│   ├── backend/           # バックエンド用
│   │   └── Dockerfile
│   └── nginx/             # リバースプロキシ
│       ├── Dockerfile
│       └── nginx.conf
├── gcp/                   # Google Cloud設定
│   ├── terraform/         # Infrastructure as Code
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── functions/         # Cloud Functions
│   │   └── index.js
│   └── scripts/           # デプロイスクリプト
│       ├── deploy.sh
│       └── setup.sh
└── .github/               # GitHub Actions
    └── workflows/
        ├── ci.yml         # CI pipeline
        └── deploy.yml     # CD pipeline
```

## ドキュメント構造 (/docs)

```
docs/
├── api/                   # API仕様書
│   ├── openapi.yaml      # OpenAPI定義
│   └── postman/          # Postmanコレクション
├── architecture/          # アーキテクチャ図
│   ├── system.drawio     # システム構成図
│   └── sequence.drawio   # シーケンス図
├── guides/                # 開発ガイド
│   ├── setup.md          # セットアップガイド
│   ├── deployment.md     # デプロイガイド
│   └── troubleshooting.md
└── decisions/             # 技術選定記録
    └── adr/              # Architecture Decision Records
```

## 命名規則

### ファイル名
- **コンポーネント**: PascalCase (例: `SuggestionCard.tsx`)
- **hooks**: camelCase with "use" prefix (例: `useSuggestions.ts`)
- **utilities**: camelCase (例: `localStorage.ts`)
- **定数**: camelCase (例: `constants.ts`)
- **型定義**: camelCase (例: `suggestion.ts`)

### ディレクトリ名
- すべて小文字
- 複数単語はハイフン区切り（kebab-case）
- 単数形を使用（例: `component` not `components`）

### エクスポート
- **default export**: ページコンポーネント、メインコンポーネント
- **named export**: ユーティリティ関数、型定義、定数

## ファイル配置のルール

### 新しいコンポーネント
1. 再利用可能な汎用コンポーネント → `/frontend/src/components/common/`
2. 特定機能に紐づくコンポーネント → `/frontend/src/features/[機能名]/`
3. レイアウト関連 → `/frontend/src/components/layout/`

### 新しいAPI関連コード
1. エンドポイント定義 → `/backend/src/api/routes/`
2. ビジネスロジック → `/backend/src/services/`
3. 外部API連携 → `/backend/src/services/[サービス名]/`

### テストファイル
- ユニットテスト: 対象ファイルと同じ構造で `/tests/unit/` 配下
- 統合テスト: 機能単位で `/tests/integration/` 配下

### 設定ファイル
- プロジェクトルート: 全体設定（.gitignore, docker-compose.yml）
- 各サブプロジェクト: 個別設定（package.json, tsconfig.json）

## インポートパスのルール

### 絶対パス（推奨）
```typescript
// frontend/src/tsconfig.json で baseUrl と paths を設定
import { Button } from '@/components/common/Button';
import { useSuggestions } from '@/features/suggestion/useSuggestions';
import { API_BASE_URL } from '@/utils/constants';
```

### 相対パス（同一機能内のみ）
```typescript
// 同じfeature内でのインポート
import { SuggestionCard } from './SuggestionCard';
```

## 禁止事項

1. **ルートディレクトリへの直接ファイル追加**（設定ファイル以外）
2. **深すぎるネスト**（4階層以上は避ける）
3. **機能横断的なインポート**（features間の直接参照）
4. **ビジネスロジックのコンポーネント内実装**
5. **環境依存の値のハードコーディング**

---

このディレクトリ構造に従うことで、コードの保守性と開発効率が向上します。
新しいファイルを追加する際は、必ずこのガイドラインに従ってください。