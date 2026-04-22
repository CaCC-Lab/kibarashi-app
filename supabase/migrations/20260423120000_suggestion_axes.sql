-- 提案軸拡張 Phase 1: 自動取得可能な軸を追加
-- 既存データは空配列のままで「全条件マッチ」として扱うため後方互換
-- 詳細: docs/specs/suggestion-axes-extension.md

ALTER TABLE suggestions_master
  ADD COLUMN IF NOT EXISTS season           text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS weather          text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS temperature_band text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS part_of_day      text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS day_type         text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS mood             text[] NOT NULL DEFAULT '{}'::text[];

-- 配列フィルタ用 GIN インデックス
CREATE INDEX IF NOT EXISTS idx_suggestions_master_season           ON suggestions_master USING GIN (season);
CREATE INDEX IF NOT EXISTS idx_suggestions_master_weather          ON suggestions_master USING GIN (weather);
CREATE INDEX IF NOT EXISTS idx_suggestions_master_temperature_band ON suggestions_master USING GIN (temperature_band);
CREATE INDEX IF NOT EXISTS idx_suggestions_master_part_of_day      ON suggestions_master USING GIN (part_of_day);
CREATE INDEX IF NOT EXISTS idx_suggestions_master_day_type         ON suggestions_master USING GIN (day_type);
CREATE INDEX IF NOT EXISTS idx_suggestions_master_mood             ON suggestions_master USING GIN (mood);

-- 値域コメント（実アプリのクライアント側ロジックと揃える）
COMMENT ON COLUMN suggestions_master.season           IS 'spring / summer / autumn / winter';
COMMENT ON COLUMN suggestions_master.weather          IS 'sunny / cloudy / rainy / snowy';
COMMENT ON COLUMN suggestions_master.temperature_band IS 'cold / cool / mild / warm / hot';
COMMENT ON COLUMN suggestions_master.part_of_day      IS 'morning / daytime / evening / night';
COMMENT ON COLUMN suggestions_master.day_type         IS 'weekday / weekend';
COMMENT ON COLUMN suggestions_master.mood             IS 'tired / anxious / irritated / lonely / bored / sad / calm';
