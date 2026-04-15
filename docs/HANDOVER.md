# 開発引き継ぎドキュメント（WSL → Mac）

作成日: 2026-04-08

## 現在のプロジェクト状態

### ブランチ
- `main` が最新。全PRマージ済み。

### 動作確認済み構成
- Frontend: React 18 + TypeScript + Vite（localhost:3001）
- Backend: Express + TypeScript（localhost:8081）
- AI Provider: Gemini / Ollama / Dify の3つから `AI_PROVIDER` 環境変数で切替

## AI Provider 設定

```bash
# Gemini（クラウド、デフォルト）
AI_PROVIDER=gemini

# Ollama（ローカルLLM、APIキー不要）
AI_PROVIDER=ollama
OLLAMA_MODEL=gemma4:26b        # デフォルト
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_TIMEOUT=120000

# Dify（ワークフロー外出し、プロンプト調整がWeb UIで可能）
AI_PROVIDER=dify
DIFY_BASE_URL=http://localhost:5001
DIFY_API_KEY=app-xxxxx
DIFY_TIMEOUT=120000
```

### Dify アプリ情報（セルフホスト）
- アプリ名: 気晴らし提案ジェネレーター
- アプリID: `7eac6906-e288-4ba2-809b-095c148254cc`
- モード: completion
- モデル: gemma4:26b（Ollama経由）
- APIキー: `app-jdwsh1dJ9SSeXxR6Mo9rEHsa`（WSL環境用、Mac環境では再生成が必要）

## 重要な設定ファイル

### frontend/.env（gitignore対象、手動作成が必要）
```
VITE_API_URL=http://localhost:8081
VITE_API_TIMEOUT=120000
VITE_APP_NAME=気晴らしレシピ
VITE_ENABLE_PWA=true
VITE_ENABLE_VOICE_GUIDE=true
```

### backend/.env（gitignore対象、手動作成が必要）
```
PORT=8081
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma4:31b-cloud
```

## 実装済み機能一覧

### コア機能
- 状況選択 × 時間選択 → AI提案3件表示
- Gemini / Ollama / Dify による提案生成
- フォールバック（AI失敗時は静的データ）
- 音声ガイド（Google Cloud TTS、オプション）
- ダークモード
- 場所選択（天候連携）

### ゲーミフィケーション（PR #8, #9, #10）
- バッジシステム（6種: 初回実行、3回完了、両カテゴリ、お気に入り、メモ、カスタム）
- 回復ジャーニー（週次サマリー、カテゴリ分析、時間帯傾向）
- お気に入りデッキ（シーン別グループ化）
- 図鑑（試行済み/未試行の一覧）
- デイリーミッション（1日1提案、穏やかな語調）
- 全データ localStorage 管理（DB不要）

### UI
- 実績モーダル（🏅ヘッダーボタン → BadgeModal）
- 統計モーダル（📊ヘッダーボタン → JourneyModal）
- デイリーミッション（ホーム画面に表示）
- バッジ解除通知（アクション後にポップアップ）
- 人間工学的アフォーダンスCSS（afford-card, afford-icon-btn等）

## 未実装（Spec完成済み）

### コミュニティ共有機能（community-sharing）
- Spec: `.kiro/specs/community-sharing/`（requirements/design/tasks完成）
- 要件: ユーザー投稿 → 承認制 → 公開一覧
- 必要: Supabase（PostgreSQL）セットアップ
- 状態: 保留中

## 今後の計画

### Capacitor + iOS 化
- ターゲット: iOS（iPhone）
- ビルド: Mac + Xcode
- PWA: 無効化する（Service Worker削除）
- localStorage: Capacitor でもそのまま動作
- 注意: プッシュ通知等はCapacitorプラグインが必要

### PWA無効化手順
1. `frontend/vite.config.ts` から `VitePWA` プラグインを削除
2. `frontend/public/` のPWAアセット（manifest, service-worker）を削除
3. `frontend/.env` の `VITE_ENABLE_PWA=false` に変更

### Capacitor導入手順（概要）
```bash
cd frontend
npm install @capacitor/core @capacitor/cli
npx cap init "気晴らしレシピ" "com.kibarashi.app"
npm install @capacitor/ios
npx cap add ios
npm run build
npx cap sync
npx cap open ios  # Xcode起動
```

## 開発フロー

v7.8.5b フローを採用（詳細は `AI開発フローv7.8.5b完全版.md`）:
1. Phase 1: Kiro Spec作成
2. Phase 2: feature ブランチ
3. Phase 2.5: Spec Sync Gate
4. Phase 3: テスト作成（Cursor）
5. Phase 4: 実装（Claude Code）
6. Phase 4.5: /simplify
7. Phase 5: レビュー（Agent Teams）
8. Phase 6: PR作成・CI
9. マージ

## CI 注意事項

### core-logic ビルドが必須
CI の全ジョブ（lint, test-frontend, test-backend, build）で `packages/core-logic` のビルドが必要:
```yaml
run: |
  npm ci
  cd packages/core-logic && npm ci && npm run build
  cd ../../frontend && npm ci
  cd ../backend && npm ci
```

### core-logic の JSON データコピー
`packages/core-logic/package.json` の build スクリプト:
```json
"build": "tsc && cp -r src/data dist/data"
```
tsc は JSON を dist/ にコピーしないため、手動コピーが必要。

### GitHub Actions 使用量
無料枠の月間上限に注意。PR作成ごとにCI実行される。

## DifyOps（Dify管理ツール）

```bash
cd /path/to/difyops
uv run dify-admin --json apps list           # アプリ一覧
uv run dify-admin apps config get APP_ID     # 設定取得
uv run dify-admin apps config set APP_ID --file config.json  # 設定更新
```

環境変数（`.env`）:
```
DIFY_URL=http://localhost:5001
DIFY_EMAIL=ryu@test.com
DIFY_PASSWORD=Admin123
```
