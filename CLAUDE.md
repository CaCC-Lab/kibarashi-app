# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**5分気晴らし - 音声ガイド付きストレス解消アプリ**

職場の人間関係でストレスを抱える20-40代をターゲットとした、シンプルで使いやすい気晴らし提案アプリケーション。Gemini APIによるAI提案生成とGoogle Cloud TTSによる音声ガイド機能が特徴。

## 開発フェーズと優先度

### Phase 1 (MVP) - 現在の開発フェーズ
- 状況選択（職場・家・外出）× 時間選択（5分・15分・30分）
- 即座に3つの気晴らし提案を表示
- Gemini APIで基本的な提案生成
- Google Cloud TTSで音声ガイド機能（オプション）
- **完全無料、アカウント登録なし、記録なし**

### 新ターゲット層の追加（Phase B/C の代替）
- **就職活動中の人（20-24歳）**: 面接前の緊張緩和、不採用後の気持ち転換、ES作成疲れのリフレッシュに特化
- **転職活動中の人（25-49歳）**: 現職との両立ストレス解消、キャリア不安の軽減、長期活動のモチベーション維持に対応
- 実装計画書: `/docs/target-jobhunting-implementation-plan.md`

### 重要な開発方針
1. **シンプルさを最優先** - 機能過多を避け、3タップ以内で目的達成
2. **音声機能はオプション** - 音声なしでも価値のあるUI/UX設計
3. **PWA対応** - アプリストア経由せず配布可能
4. **オフライン対応** - 提案データをローカル保存

## 技術スタック

### フロントエンド
- React 18 + TypeScript
- Tailwind CSS (レスポンシブデザイン)
- PWA (Service Worker対応)
- Web Audio API (音声再生制御)

### バックエンド (Phase 1では最小限)
- Node.js + Express.js
- PostgreSQL (Phase 2以降で使用)
- Redis (Phase 2以降で使用)

### AI・音声
- Google Gemini API (気晴らし提案生成)
- Google Cloud Text-to-Speech (音声ガイド)

### インフラ
- Google Cloud Platform
- Cloud Functions (サーバーレス処理)
- Firebase Hosting (静的ファイル配信)
- Cloud Storage (音声ファイル保存)

### 開発ツール
- Docker (コンテナ化)
- GitHub Actions (CI/CD)
- Jest + React Testing Library (テスト)

## プロジェクト構造（推奨）

```
kibarashi-app/
├── frontend/               # Reactフロントエンド
│   ├── src/
│   │   ├── components/    # UIコンポーネント
│   │   ├── features/      # 機能別モジュール
│   │   ├── services/      # API通信・外部サービス
│   │   ├── utils/         # ユーティリティ関数
│   │   └── types/         # TypeScript型定義
│   ├── public/           # 静的ファイル・PWA設定
│   └── tests/            # テストファイル
├── backend/              # Node.jsバックエンド
│   ├── src/
│   │   ├── api/          # APIエンドポイント
│   │   ├── services/     # ビジネスロジック
│   │   └── utils/        # 共通ユーティリティ
│   └── tests/
├── infrastructure/       # インフラ設定
│   ├── docker/
│   └── gcp/
└── docs/                # ドキュメント
```

## 開発コマンド

```bash
# 初期セットアップ (プロジェクトルートで実行)
npm run setup

# フロントエンド開発
cd frontend
npm install
npm run dev        # 開発サーバー起動 (http://localhost:3000)
npm run build      # 本番ビルド
npm run test       # テスト実行
npm run lint       # ESLint実行
npm run format     # Prettier実行

# バックエンド開発
cd backend
npm install
npm run dev        # 開発サーバー起動 (http://localhost:8080)
npm run build      # TypeScriptビルド
npm run test       # テスト実行
npm run lint       # ESLint実行

# Docker開発環境
docker-compose up -d     # 全サービス起動
docker-compose down      # 全サービス停止
docker-compose logs -f   # ログ確認

# テスト実行
npm run test:unit        # ユニットテスト
npm run test:integration # 統合テスト
npm run test:e2e        # E2Eテスト
```

## API設計指針

### Phase 1 エンドポイント
```
GET  /api/v1/suggestions?situation={place}&duration={minutes}
     - 気晴らし提案を3つ返す
     - Gemini APIを使用して生成

POST /api/v1/tts
     - テキストを音声に変換
     - Google Cloud TTSを使用
```

### レスポンス形式
```typescript
interface SuggestionResponse {
  suggestions: Array<{
    id: string;
    title: string;
    description: string;
    duration: number; // 分
    category: '認知的' | '行動的';
    steps?: string[];
  }>;
}
```

## 重要な実装上の注意点

### 1. エラーハンドリング
- Gemini API/TTS APIの失敗時はフォールバック提案を表示
- ユーザーフレンドリーなエラーメッセージ（3要素：何が起きたか・なぜ起きたか・どうすればよいか）

### 2. パフォーマンス最適化
- 提案データのキャッシュ戦略（Redis使用前はローカルストレージ）
- 音声ファイルの事前生成とCDN配信
- React.lazy()による動的インポート

### 3. アクセシビリティ
- キーボードナビゲーション対応
- スクリーンリーダー対応
- 高コントラストモード

### 4. PWA要件
- Service Workerによるオフライン対応
- インストール可能なアプリマニフェスト
- HTTPSでの配信必須

## 気晴らし提案データ構造

開発仕様書に含まれる「気晴らし方法の具体例」を参考に、以下のカテゴリで提案を構成：

### 認知的気晴らし（頭の中で行う）
- 思い出にひたる、自分をねぎらう、身体感覚に注意を向ける等

### 行動的気晴らし（具体的な行動を伴う）
- 誰かと交流する、食べたり飲んだり、体を動かす等

### 就活・転職活動者向け特別カテゴリ
- **面接前の緊張緩和**: 呼吸法、アファメーション、クイックストレッチ
- **不採用後の気持ち転換**: 感情受容、小さな達成感、気分転換の豆知識
- **書類作成疲れのリフレッシュ**: 目の体操、リラックス音楽、短時間瞑想
- **長期活動のモチベーション維持**: 名言、自己承認ワーク、未来イメージング

## テスト戦略

### ユニットテスト
- コンポーネント単体の動作確認
- ビジネスロジックの検証
- カバレッジ目標: 80%以上

### 統合テスト
- API連携の確認
- 音声再生機能の動作確認

### E2Eテスト
- ユーザーシナリオ全体の動作確認
- PWAインストールフローの検証

## デプロイメントプロセス

1. GitHubへのpushで自動テスト実行
2. mainブランチへのマージでステージング環境へ自動デプロイ
3. 手動承認後、本番環境へデプロイ
4. Cloud Functionsの更新は個別にデプロイ

## 開発時の注意事項

1. **リスク認識**: 開発仕様書に記載されたリスク分析を常に意識
2. **段階的実装**: Phase 1の機能に集中し、過度な機能追加を避ける
3. **ユーザー視点**: ストレスを抱えた状態でも使いやすいUI/UX
4. **API依存**: Gemini API/TTSの利用制限とコストを常に監視
5. **セキュリティ**: APIキーの管理、HTTPS通信の徹底