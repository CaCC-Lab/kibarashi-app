# 提案軸拡張 Spec（季節・天気・気分・平日/週末）

**Status**: Phase 1 実装中（PR: feat/suggestion-axes-phase1）
**Author**: Claude Code (AI)
**Created**: 2026-04-22
**Updated**: 2026-04-23
**Related Memory**: `project_api_vision.md`, `project_api_consumers.md`

## 実装ステータス (2026-04-27)

| 項目 | 現状 | Phase |
|---|---|---|
| 6軸スキーマ + GIN インデックス | ✅ 本番適用済 | Phase 1 |
| API v1/v2 で軸クエリ受理 | ✅ デプロイ済 | Phase 1 |
| フロント自動計算 + 配信 | ✅ デプロイ済 | Phase 1 |
| `CONTEXT_AXES_ENABLED=true` 本番セット | ✅ 適用済 | Phase 1 |
| 既存提案へのAI軸タグ付け（323/390 = 83%） | ✅ 適用済 | Phase 2 |
| 新規生成時の軸タグ自動付与 | ✅ 実装済 | Phase 2 |
| HomeMood → mood 軸の配線 | ✅ デプロイ済 (PR #40) | Phase 2 |
| **介入タイプ軸（activating/calming/mindful/problem_solving）** | 計画中 | **Phase 3** |
| **is_universal フラグ（汎用かAI不確実かの曖昧解消）** | 計画中 | **Phase 3** |
| 祝日判定（japanese-holidays + day_type 拡張） | 計画中 | Phase 3 |
| seasonal_event 拡張テーブル（梅雨・年度・年末年始） | 計画中 | Phase 4 |
| エネルギーレベル軸 / 同居軸 / 時間圧迫軸 | 未着手（UI摩擦あり） | Phase 5 |

## Phase 3 スコープ（Codex / Cursor レビュー反映）

両bot共通の指摘:
- 軸選定は概ね妥当。だが「実行可能性」と「介入タイプ」が見落とし
- 空配列フォールバックの曖昧性（汎用 vs AI不確実）が A/B 検証でノイズに
- 多値タグの過適用がノイズ化（特に mood/weather）

### Phase 3 で対応する3項目（UIフリクション 0 のものから）

#### 3-1: 介入タイプ軸 `intent` (Cursor指摘)
- 値域: `activating` / `calming` / `mindful` / `problem_solving`
- 既存提案を AI で再分類（既存の tag-suggestions-axes.js の延長）
- 「説明責任」が立つ軸: ユーザーに「なぜこの提案？」を返せる

#### 3-2: `is_universal` フラグ (Cursor指摘)
- boolean カラム追加。AI タグ時に「明示的に汎用」と「自信なくて空」を区別
- レコメンドスコアの後段で「汎用は減点」「AI不確実は除外」のような扱い分けが可能に

#### 3-3: 祝日対応 `day_type` 拡張
- 既存 `day_type` enum に `holiday` を追加
- フロントで `japanese-holidays` 等のライブラリで祝日判定
- 連休中・GW・年末年始の特殊体験提供への第一歩

### Phase 3 で扱わない（理由付き）

- **エネルギーレベル軸**: ユーザー明示入力が必要 → HomeMood と同等のUI追加が必要 → 摩擦大
- **同居軸 / 社会的孤立**: プライバシー配慮が複雑、UIで聞きにくい
- **時間圧迫軸**: duration で部分的に表現済み、追加価値が不明確
- **seasonal_event**: テーブル追加が必要、Phase 4 に分離

### マイグレーション計画

```sql
ALTER TABLE suggestions_master
  ADD COLUMN IF NOT EXISTS intent text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS is_universal boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_suggestions_master_intent ON suggestions_master USING GIN (intent);

-- day_type の既存値を変更しない。新値 'holiday' を許容する CHECK は加えない
-- （PostgreSQL の text[] には enum 制約がないため、validation は API 側で行う）
```

### API変更
- `intent` クエリパラメータ追加（v1/v2 共通）
- `day_type=holiday` を valid 値に追加

### フロント変更
- `dayType` 計算ヘルパーに祝日判定追加（`japanese-holidays` パッケージ）
- intent は当初フロントから送らず、サーバ後段スコア用にDBに持つだけでもOK

### 完了基準
- 既存390件のうち200件以上に `intent` 軸が付与される
- 「祝日に開いたとき特別な提案」が動くことを実機確認
- A/B で「汎用提案だらけ」状態と「文脈特化が混ざる」状態のヒット内容差が見える

## 1. 目的 (Why)

現状、気晴らし提案のフィルタ軸は `age_group × situation × duration` の3次元のみ。
同じ組合せでも「雨の日にオフィスで5分」と「晴れの日にオフィスで5分」では適切な提案が異なり、
既存データでも差分表現ができない。追加軸を導入することで:

- 既存159件の活用度を高め、AIフォールバック率を下げる（DBヒット率向上）
- 季節・気象イベントに応じた文脈性のある提案が可能に
- A/Bで作ったカバレッジ分析の穴を「軸追加で埋まるもの」「本当に提案不足」に分解できる

## 2. 現状の構造

- `suggestions_master.situation` : `text[]` 複数該当可
- `suggestions_master.age_groups` : `text[]` 複数該当可
- `suggestion_generation_cache.input_weather_condition` : 既に存在（キャッシュキー用、未活用）
- API v1 `GET /api/v1/suggestions?situation=&duration=&ageGroup=` が主経路
- API v2 は認証済み外部API（wellness-recovery, FlowSync が利用）

## 3. 新規軸の定義

### 3.1 追加する軸（すべて optional / additive）

| 軸 | 型 | 値域 | 派生可能か |
|---|---|---|---|
| season | text | `spring` / `summer` / `autumn` / `winter` | サーバ日付から自動決定可 |
| weather | text | `sunny` / `cloudy` / `rainy` / `snowy` / `hot` / `cold` | 既存の useWeather から取得可 |
| mood | text | `tired` / `anxious` / `irritated` / `lonely` / `bored` / `sad` | UI 上で明示選択 |
| part_of_day | text | `morning` / `daytime` / `evening` / `night` | サーバ時刻から自動決定可 |
| day_type | text | `weekday` / `weekend` / `holiday` | サーバ日付 + 祝日判定で自動 |

### 3.2 設計原則

- **全て nullable / optional**: 既存159件は何も更新不要、空=全条件にマッチ
- **配列カラム**: 1提案が複数値に対応するケース（例: season=['spring','autumn']）を許容
- **自動派生優先**: season/part_of_day/day_type は常にサーバ側で判定しクエリに合成
- **UI選択は mood のみ**: 軸を増やしてもユーザー操作は変えない（HomeMood の既存 mood 選択と統合）

## 4. スキーマ変更

### 4.1 マイグレーション（additive）

```sql
ALTER TABLE suggestions_master
  ADD COLUMN season text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN weather text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN mood text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN part_of_day text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN day_type text[] NOT NULL DEFAULT '{}'::text[];

CREATE INDEX idx_suggestions_master_season      ON suggestions_master USING GIN (season);
CREATE INDEX idx_suggestions_master_weather     ON suggestions_master USING GIN (weather);
CREATE INDEX idx_suggestions_master_mood        ON suggestions_master USING GIN (mood);
CREATE INDEX idx_suggestions_master_part_of_day ON suggestions_master USING GIN (part_of_day);
CREATE INDEX idx_suggestions_master_day_type    ON suggestions_master USING GIN (day_type);
```

`NOT NULL DEFAULT '{}'` により「NULL = 全条件マッチ」と「空配列 = 全条件マッチ」の
2種類の表現が混在することを防ぐ。

### 4.2 既存データの扱い

- デフォルトは空配列 = 「どの条件でもマッチする汎用提案」
- 空配列はマッチ条件から除外する（`.overlaps()` でない場合はスキップ）
- バッチ更新は後回し。新規生成分から徐々にタグ付け

## 5. API 変更

### 5.1 クエリパラメータ（v1/v2 共通、追加はすべて optional）

```http
GET /api/v1/suggestions?
    situation=workplace&
    duration=5&
    ageGroup=office_worker&
    season=spring&          # 新規
    weather=rainy&          # 新規
    mood=tired&             # 新規
    partOfDay=morning&      # 新規（自動派生が基本）
    dayType=weekday         # 新規（自動派生が基本）
```

### 5.2 dbSuggestions.js の変更点

- 既存 `.contains('situation', [situation])` に加え、渡された軸すべてについて `.overlaps(col, [val])` を追加
- 空配列カラムは「全条件一致」として扱うため `.or(`${col}.eq.{}, ${col}.ov.{${val}}`)` 相当のロジック
- スコア順は変わらず `quality_score DESC`

### 5.3 v2 レスポンスへの影響

- `data.suggestions[]` には新軸が付いて返る（additive）
- 既存クライアント（wellness-recovery, FlowSync）は未知フィールドを無視するので破壊的変更なし
- **念のため**: v2 PR 作成前に両プロジェクトのメンテナに「追加フィールドが来る」旨を通知

## 6. フロントエンド影響

### 6.1 既存UIへの最小影響パス

- `useSuggestions` のクエリ組立時に以下を自動付与:
  - `season` ← `new Date().getMonth()` で判定
  - `partOfDay` ← `new Date().getHours()` で判定
  - `dayType` ← 平日/週末 + 祝日判定ライブラリ（`japanese-holidays` 等）
  - `weather` ← 既存 `useWeather` から取得
  - `mood` ← 既存 `HomeMood` で選択済みなら付与、未選択なら省略

### 6.2 UI追加は原則なし

- `mood` は `appearance.homeVariant === 'mood'` で既に選べている
- それ以外は自動派生なのでUIフィールドは増やさない
- 設定画面に「季節・天気を提案に反映する」トグルは将来検討（プライバシー配慮のため）

## 7. AI生成プロンプトへの影響

- `ollama.js` / `gemini.js` の `createPrompt()` に渡す context を拡張
- バッチ生成スクリプト（`scripts/generate-suggestions-batch.js`）も新軸を受け取れるよう `--season`, `--weather`, `--mood` フラグを追加
- 既存プロンプトテンプレートは後方互換のまま

## 8. 影響を受ける外部API利用者

メモリ `project_api_consumers.md` に記録の通り:

- **wellness-recovery** (internal plan): 新フィールドは無視されるので影響なし。ただし「mood連動」機能を彼らも入れる可能性があるのでアナウンス要
- **FlowSync** (pro plan): 同上

## 9. 段階的ロールアウト

| Phase | 作業 | 検証 |
|---|---|---|
| Phase 1 | マイグレーション（ADD COLUMN のみ） + インデックス | ステージングで既存クエリが壊れていないこと |
| Phase 2 | API v1 の dbSuggestions.js でクエリ受理（渡されても無視しない） | 既存アプリは軸を送らないので挙動不変 |
| Phase 3 | フロントから自動軸を付与 | 既存 UI 無変更、DB ヒット率が変動するか計測 |
| Phase 4 | AI生成プロンプトに軸を反映 | 新規生成分のタグ充足率 |
| Phase 5 | 既存159件の手動タグ付けガイド作成 | scripts 追加で promote 時にタグ補完 |
| Phase 6 | v2 ドキュメント更新 + 外部API利用者へアナウンス | openapi.yaml 更新 |

## 10. 計測指標

- DBヒット率（AIフォールバック率の減少）
- 軸ごとのクエリ件数分布
- タグ付与率（ALL_SUGGESTIONS 中の軸別カバレッジ）

## 11. Out of Scope（別Spec行き）

- 祝日判定ライブラリの導入（別途選定）
- `user_saved_suggestions` のレコメンド（mood 履歴からの学習）
- 季節ごとの提案ページ・キャンペーンUI
- 軸の重み付けスコアリング

## 12. リスク・検討事項

- **軸が増えすぎてDBヒット率が逆に下がる**: 空配列=全マッチのフォールバックで緩和
- **mood の選択肢決定**: 現状 HomeMood で定義済みの `MoodId` と揃える必要あり
- **外部API利用者への破壊的影響**: additive なので想定なし、だがアナウンスは必須
- **既存159件のタグ付け負荷**: 人力では重い。AIで一括タグ付けスクリプトを別途検討

## 13. 次ステップ（承認後）

1. Phase 1 のマイグレーションを別PRで実装
2. `scripts/backfill-suggestion-axes.js` のドラフト（既存159件をAIでタグ付け）
3. dbSuggestions.js の軸対応PR

---

**レビュー観点**: 軸の選定は妥当か / マイグレーションが additive で安全か / 外部API利用者への影響が許容範囲か
