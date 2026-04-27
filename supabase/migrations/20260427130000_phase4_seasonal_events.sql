-- 提案軸拡張 Phase 4: seasonal_events
-- 期間スロット型のイベント定義テーブル + suggestions_master との関連付け
-- 詳細: docs/specs/suggestion-axes-extension.md (Phase 4 セクション)

CREATE TABLE IF NOT EXISTS seasonal_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code        text NOT NULL,                 -- 'rainy_season' / 'gw' / 'obon' / 'year_end_new_year' / 'fiscal_year_change' / 'pollen_high' / 'heat_wave'
  name_ja     text NOT NULL,                 -- 表示・説明用「梅雨」
  start_date  date NOT NULL,                 -- 例: '2026-06-08'
  end_date    date NOT NULL,                 -- 例: '2026-07-19'（含む）
  description text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT seasonal_events_dates_check CHECK (start_date <= end_date),
  -- 同じ code で同じ start_date は重複させない（再投入の冪等性確保）
  CONSTRAINT seasonal_events_code_start_unique UNIQUE (code, start_date)
);

CREATE INDEX IF NOT EXISTS idx_seasonal_events_dates ON seasonal_events (start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_seasonal_events_code  ON seasonal_events (code);

ALTER TABLE suggestions_master
  ADD COLUMN IF NOT EXISTS seasonal_events text[] NOT NULL DEFAULT '{}'::text[];

CREATE INDEX IF NOT EXISTS idx_suggestions_master_seasonal_events
  ON suggestions_master USING GIN (seasonal_events);

COMMENT ON TABLE  seasonal_events                        IS '期間ベースの季節/年中行事イベント。複数年に渡るため (code, start_date) で重複制御';
COMMENT ON COLUMN seasonal_events.code                   IS 'rainy_season / gw / obon / year_end_new_year / fiscal_year_change / pollen_high / heat_wave';
COMMENT ON COLUMN suggestions_master.seasonal_events     IS '紐付くイベント code の配列（年は持たない）。空配列=どの期間でもマッチ（汎用）';

-- 初期データ: 2026年と2027年の代表イベント
INSERT INTO seasonal_events (code, name_ja, start_date, end_date, description) VALUES
  -- 2026
  ('rainy_season',       '梅雨',              '2026-06-08', '2026-07-19', '関東地方の平年的な梅雨期間'),
  ('gw',                 'ゴールデンウィーク', '2026-04-29', '2026-05-05', '昭和の日からこどもの日'),
  ('obon',               'お盆',              '2026-08-13', '2026-08-16', 'お盆休み期間'),
  ('year_end_new_year',  '年末年始',          '2026-12-28', '2027-01-03', '仕事納めから三が日'),
  ('fiscal_year_change', '年度替わり',        '2026-03-15', '2026-04-15', '年度末・新年度の変化期'),
  ('pollen_high',        '花粉ピーク',        '2026-02-15', '2026-04-30', 'スギ・ヒノキ花粉のピーク期'),
  ('heat_wave',          '猛暑期',            '2026-07-20', '2026-08-31', '熱中症警戒の高温期'),
  -- 2027
  ('rainy_season',       '梅雨',              '2027-06-08', '2027-07-19', NULL),
  ('gw',                 'ゴールデンウィーク', '2027-04-29', '2027-05-05', NULL),
  ('obon',               'お盆',              '2027-08-13', '2027-08-16', NULL),
  ('year_end_new_year',  '年末年始',          '2027-12-28', '2028-01-03', NULL),
  ('fiscal_year_change', '年度替わり',        '2027-03-15', '2027-04-15', NULL),
  ('pollen_high',        '花粉ピーク',        '2027-02-15', '2027-04-30', NULL),
  ('heat_wave',          '猛暑期',            '2027-07-20', '2027-08-31', NULL)
ON CONFLICT (code, start_date) DO NOTHING;
