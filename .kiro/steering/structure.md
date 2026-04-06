# Structure Steering

## ディレクトリ構成

```
kibarashi-app/
├── frontend/               # React フロントエンド
│   ├── src/
│   │   ├── components/    # UIコンポーネント
│   │   ├── features/      # 機能別モジュール
│   │   ├── services/      # API通信・外部サービス
│   │   ├── utils/         # ユーティリティ関数
│   │   └── types/         # TypeScript型定義
│   └── public/            # 静的ファイル・PWA設定
├── backend/               # Express バックエンド
│   ├── src/
│   │   ├── api/           # APIエンドポイント
│   │   ├── services/      # ビジネスロジック
│   │   └── utils/         # 共通ユーティリティ
│   └── tests/             # バックエンドテスト
├── packages/
│   └── core-logic/        # 共有ロジック
├── api/                   # Vercel サーバーレス関数
├── tests/                 # E2E・統合テスト
├── scripts/               # ビルド・ユーティリティ
├── infrastructure/        # インフラ設定
├── docs/                  # ドキュメント
├── .kiro/
│   ├── steering/          # 基盤Steering
│   └── specs/             # Feature Spec / Bugfix Spec
└── logs/                  # ログ出力
```

## ファイル命名規則
- コンポーネント: PascalCase.tsx（例: SuggestionCard.tsx）
- ユーティリティ: camelCase.ts（例: formatDate.ts）
- テスト: {対象}.test.ts / {対象}.test.tsx
- 型定義: camelCase.ts（例: charts.ts）
- Spec: .kiro/specs/{feature}/

## モジュール分離方針
- features/ 配下は機能単位で分離
- components/ は再利用可能なUI部品のみ
- services/ は外部API通信を集約
- types/ はプロジェクト横断の型定義
