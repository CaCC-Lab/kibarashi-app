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

---

## AI開発フロー v7.8.5b 制約

### Canon TDD制約
- 実装PRではテストファイルを**変更禁止**
- 既存テストを通す実装を作成する
- テストが間違っていると思っても、まず実装で対応を試みる

### Living Spec 前提
- Kiro Spec は一回生成して終わりではなく、継続的に更新・同期する
- requirements.md が変わったら、design.md と tasks.md の同期完了を確認してから実装へ進む
- requirements/design/tasks が未同期なら、仕様解釈を進めてはならない

### Canon TDD例外（Spec起点のみ）
- 例外トリガー：Specの誤り、要件変更、テスト自体のバグ
- **実装側からの例外発動は禁止**
- 例外手順：
  1. requirements.md 修正
  2. design.md Refine
  3. tasks.md Update tasks
  4. 必要なら完了タスク再判定
  5. テスト修正（Cursor）
  6. FLOW_LOG記録
  7. tests/変更禁止に復帰

### Spec Sync Gate
- Phase 3 以降に進む前に、requirements/design/tasks の同期状態を確認する
- 以下のいずれかが未実施なら、実装を開始してはならない
  - requirements 更新後の design Refine
  - design 更新後の tasks Update
  - 必要時の完了タスク再判定

### Cursor Cloud Agent への委譲ルール
- Cloud Agentに委譲する場合、スコープは「タスク定義済みの機械的置換・横断反映」に限定
- Cloud Agent の MUST NOT：secrets操作、依存追加（未承認）、DB操作、大規模リファクタ、tests変更

### /simplify 実行ルール（Phase 4.5）
- 実装コミット後、レビュー前に `/simplify` を実行する（SHOULD）
- `/simplify` は機能を変えずに再利用性・品質・効率性を改善する
- `/simplify` 実行後、`git diff` で修正内容を必ず目視確認する（MUST）
- 意図しない変更があれば `git checkout` で戻す
- 確認後 `git commit -m "refactor: /simplify で品質改善"` でコミット

### 参照ルール
- 実装時は テストファイル と .kiro/specs/ を参照
- 既存コードも参照可

## MCP利用ルール

- Spec の正本は `.kiro/specs/` と `.kiro/steering/` である
- Context7 は外部仕様確認のために使う
- Playwright MCP は UI / ブラウザ / 実行確認のために使う
- Computer Use は Playwright MCP のフォールバックとして使う（DOM外UI / ネイティブUI 限定）
- Computer Use で機密情報を入力しない、Cookie同意 / 規約同意 / 決済等の同意要求操作を自動実行しない
- Computer Use で本番破壊的操作をしない
- Sentry MCP は本番障害の証拠収集のために使う
- MCP の結果だけで requirements / design / tasks / bugfix.md を確定しない
- 仕様差分が見つかった場合は実装を続けず Phase 1 に戻る
- テストは明示された例外手順または Bugfix Spec 以外では変更しない
- 破壊的操作は local / dev / staging を原則とし、本番は明示承認が必要

## コーディング規約

- TypeScript strict mode
- any型禁止（unknown + 型ガードを使う）
- console.log 禁止（構造化ロギングを使用）
- ESLint + Prettier 準拠

## 禁止事項

- any型の使用
- console.log の使用（開発時デバッグ以外）
- テストファイルの変更（Canon TDD制約）
- 外部APIキーのハードコード
- bare catch（catch (e: unknown) を使う）
- requirements/design/tasks 未同期状態での実装開始

## ローカルレビュー手順（v7.7：Agent Teams並列化）

### 前提
- 環境変数 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` が有効であること

### Phase 5 実行手順

#### Step 1: Agent Teams 並列レビュー

以下の3つのteammateを同時にspawnしてレビューを並列実行する：

**Teammate: security-reviewer**
- /security-review を実行
- 検出観点: SQLi, XSS, 認証・認可, データ処理, 依存関係
- P0以上があれば即報告

**Teammate: logic-reviewer**
- セルフレビュー（review Skill相当）を実行
- 検出観点: 可読性, バグ可能性, パフォーマンス, セキュリティ, テスト
- 問題があれば優先度つきで報告

**Teammate: supplement-reviewer**
- REVIEW_SUPPLEMENT.md の観点でレビュー
- 検出観点: 仕様・意図, 設計・保守性, AI可読性, 回帰リスク, テスト・運用
- ※セキュリティは security-reviewer が担当するため対象外
- 問題があれば優先度つきで報告

#### Step 2: 指摘統合
- 3つのteammateの結果を統合
- 重複指摘を排除し、P0/P1/P2で整理
- teammatesをシャットダウン

#### Step 3: 修正
- P0 → 必須修正（tests/変更禁止）
- P1 → 推奨修正
- P2 → 判断して対応/スキップ

#### Step 4: 外部ツールクロスチェック
1. /coderabbit:review uncommitted を実行、指摘があれば修正
2. Pane2（Codex）へ「mainとの差分レビュー」を依頼
3. Codex指摘があれば修正

#### Step 4.5（SHOULD）: Runtime / Debug Investigation
- レビューで「テストは通るが挙動が怪しい」「原因不明の不具合」が指摘された場合に発動
- まず Playwright MCP で再現条件とUI挙動を固定する
- Playwright で固定困難なUIは Computer Use で補完する
- 必要なら Pane 1（Cursor）で Debug Mode を起動
- 該当する指摘がなければスキップ

#### Step 5: 完了宣言
- すべてパスしたら「コミット可能」と宣言
- コミットメッセージ案を3つ提示

### フォールバック
Agent Teams 起動失敗時は以下の逐次手順で実行：
1. /security-review → 修正
2. /coderabbit:review uncommitted → 修正
3. セルフレビュー → 修正
4. Pane2 Codex → 修正
5. REVIEW_SUPPLEMENT.md 補完レビュー → 修正
6. 「コミット可能」宣言