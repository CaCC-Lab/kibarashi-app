# 5分気晴らしアプリ API仕様書

このディレクトリには、5分気晴らしアプリのOpenAPI 3.0.3仕様書が含まれています。

## 概要

本API仕様書は、ストレス解消のための気晴らし提案APIの完全な定義を提供します。

## 構造

```
openapi/
├── openapi.yaml                  # メインの仕様書ファイル
├── paths/                        # APIエンドポイント定義
│   ├── health.yaml              # ヘルスチェック
│   ├── suggestions.yaml         # 基本的な気晴らし提案
│   ├── enhanced-suggestions.yaml # 拡張提案（音声ガイド付き）
│   └── tts.yaml                 # テキスト音声変換
├── components/                   # 再利用可能なコンポーネント
│   ├── schemas/                 # データモデル定義
│   ├── responses/               # 共通レスポンス定義
│   └── parameters/              # 共通パラメータ定義
└── README.md                    # このファイル
```

## 主要機能

### 1. 気晴らし提案 (`/suggestions`)
- 状況（職場・家・外出）と時間（5分・15分・30分）に基づいた提案
- Gemini APIを使用した動的な提案生成
- フォールバック対応

### 2. 拡張提案 (`/enhanced-suggestions`)
- 音声ガイドスクリプト付きの詳細な提案
- 画面表示用と音声ガイド用の情報を分離
- アクセシビリティ対応

### 3. 音声読み上げ (`/tts`)
- Google Cloud Text-to-Speech統合
- カスタマイズ可能な音声設定
- Base64エンコードされた音声データ返却

## 使用方法

### 1. 仕様書の閲覧

```bash
# Swagger UIでの閲覧（要Docker）
docker run -p 8080:8080 -e SWAGGER_JSON=/spec/openapi.yaml -v $(pwd):/spec swaggerapi/swagger-ui

# ReDocでの閲覧
npx @redocly/cli preview-docs openapi.yaml
```

### 2. 検証

```bash
# OpenAPI仕様の検証
npx @redocly/openapi-cli lint openapi.yaml

# または
npm run validate:openapi
```

### 3. コード生成

```bash
# TypeScript型定義の生成
npx openapi-typescript openapi.yaml --output ../../frontend/src/types/api.d.ts

# APIクライアントの生成
npx @openapitools/openapi-generator-cli generate \
  -i openapi.yaml \
  -g typescript-axios \
  -o ../../frontend/src/services/generated
```

### 4. モックサーバー

```bash
# Prismを使用したモックサーバーの起動
npx @stoplight/prism-cli mock openapi.yaml -p 4010
```

## APIエンドポイント

### 基本URL
- 本番環境: `https://api.kibarashi-app.com/api/v1`
- ステージング: `https://kibarashi-app.vercel.app/api/v1`
- ローカル: `http://localhost:8080/api/v1`

### エンドポイント一覧

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/health` | ヘルスチェック |
| GET | `/suggestions` | 気晴らし提案の取得 |
| GET | `/enhanced-suggestions` | 拡張提案の取得 |
| POST | `/tts` | テキスト音声変換 |

## レート制限

- `/suggestions`: 15分間に100リクエストまで
- `/tts`: 15分間に50リクエストまで

## エラーハンドリング

すべてのエラーレスポンスは以下の3要素を含みます：
1. **何が起きたか** - エラーの概要
2. **なぜ起きたか** - エラーの原因
3. **どうすればよいか** - 解決方法

## 開発者向け情報

### 仕様書の更新

1. 該当するYAMLファイルを編集
2. 検証スクリプトを実行
3. 型定義を再生成
4. テストを実行

### CI/CD統合

GitHub Actionsで以下が自動実行されます：
- OpenAPI仕様の検証
- 型定義の生成と検証
- APIドキュメントの自動更新

## 関連ドキュメント

- [API実装ガイド](../api-implementation-guide.md)
- [認証・認可設計](../auth-design.md)
- [エラーハンドリングガイド](../error-handling-guide.md)

## バージョン履歴

- v1.1.0 (2025-01-07): 拡張提案API追加、音声ガイド機能実装
- v1.0.0 (2024-12-01): 初版リリース