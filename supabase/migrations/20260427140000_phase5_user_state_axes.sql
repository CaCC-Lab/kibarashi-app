-- 提案軸拡張 Phase 5: ユーザー入力軸（HomeState 4問アンケートで取得）
-- 詳細: docs/specs/suggestion-axes-extension.md (Phase 5 セクション)

ALTER TABLE suggestions_master
  ADD COLUMN IF NOT EXISTS energy_level   text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS social_context text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS time_pressure  text[] NOT NULL DEFAULT '{}'::text[];

CREATE INDEX IF NOT EXISTS idx_suggestions_master_energy_level   ON suggestions_master USING GIN (energy_level);
CREATE INDEX IF NOT EXISTS idx_suggestions_master_social_context ON suggestions_master USING GIN (social_context);
CREATE INDEX IF NOT EXISTS idx_suggestions_master_time_pressure  ON suggestions_master USING GIN (time_pressure);

COMMENT ON COLUMN suggestions_master.energy_level   IS 'low / medium / high — ユーザーの活動エネルギーレベル';
COMMENT ON COLUMN suggestions_master.social_context IS 'alone / with_others — 一人か他者と一緒か';
COMMENT ON COLUMN suggestions_master.time_pressure  IS 'relaxed / pressed — 余裕があるかギリギリか';
