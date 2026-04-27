# 気晴らし提案カタログ拡充ツール

`suggestions_master` の件数を増やすための 3 本組スクリプト。

## 前提
- `.env` に以下が必要:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY` (`SUPABASE_SERVICE_KEY` でも可)
  - 生成時: `OLLAMA_BASE_URL` / `OLLAMA_MODEL` / `OLLAMA_API_KEY` (provider=ollama の場合)
  - あるいは `GEMINI_API_KEY` (provider=gemini の場合)

### 本番Supabaseに接続するには
ローカルの `backend/.env` は `127.0.0.1:54321` を指している。本番を見るには:

```bash
vercel env pull .env.vercel          # 本番の環境変数を取得（要vercelログイン）
npm run suggestions:analyze -- --threshold 3
```

`scripts/_lib/loadEnv.js` は `.env.vercel` を最優先で読むので、以降のコマンドは通常通り動く。
`.env.vercel` は `.gitignore` 済み。

## 運用フロー

```text
  ┌─── analyze ───┐     ┌── generate ──┐     ┌── (human review) ──┐     ┌── promote ──┐
  │  coverage.json │ ─→  │  pending/*.json │ ─→ │  approved/*.json   │ ─→  │ suggestions_master │
  └────────────────┘     └─────────────────┘    └────────────────────┘     └────────────────────┘
```

### 1. カバレッジ分析 (A)
```bash
npm run suggestions:analyze -- --threshold 3
# → data/analysis/suggestion-coverage.json を出力
```
`age_group × situation × duration × category` の期待セル数とギャップを一覧化。

### 2. AIバッチ生成 (B)
```bash
# 単発
npm run suggestions:generate -- \
  --age-group student --situation studying --duration 5 \
  --category 認知的 --count 10 --provider ollama

# ギャップ一括（推奨）
npm run suggestions:generate -- \
  --from-gaps data/analysis/suggestion-coverage.json \
  --min-count 3 --count 5 --limit 20 --provider ollama
# → data/pending/<timestamp>-<ag>-<sit>-<dur>[-<cat>].json
```
DBには書き込まない。候補ファイルをレビュー後に手動で `data/approved/` へ移動する。

### 3. プロモート (C)
```bash
# ドライラン（件数確認のみ）
npm run suggestions:promote -- --dry-run

# 本番投入
npm run suggestions:promote
# → suggestions_master に INSERT、処理済みは data/approved/committed/ へ退避
```

## レビュー観点（人手チェックするときの最低ライン）
- タイトルが 20 文字以内で、既存と重複していないか
- steps が具体的で実行可能か
- 道具・事前準備が本当に不要か
- 「短時間で完結」条件を満たしているか
- age_groups / situation がズレていないか（LLMは誤分類することがある）

## スキーマ拡張との関係
新軸（season/weather/temperature_band/part_of_day/day_type/mood）は Phase 1 で導入済み
（`docs/specs/suggestion-axes-extension.md`）。`generate-suggestions-batch.js` は AI に軸タグも
出力させ、`promote-suggestions.js` は対応カラムを INSERT に含める。

## 既存提案への軸タグ付け（Phase 2）

```bash
# 1. AIで軸を提案（DBは変更しない、JSONに出力）
npm run suggestions:tag-axes -- --only-untagged --limit 50 --provider ollama
# → data/axis-tags/pending/<timestamp>.json

# 2. 人手レビュー → OK のファイルを data/axis-tags/approved/ へ移動

# 3. DBに UPDATE を適用
npm run suggestions:apply-axes -- --dry-run    # 件数確認
npm run suggestions:apply-axes                 # 本番適用
# → data/axis-tags/approved/committed/ へ退避
```

判定方針: 迷ったら空配列（=どの軸値にもマッチする汎用提案）。
明確に屋外限定・夜間限定など条件がある場合のみ値を入れる。
