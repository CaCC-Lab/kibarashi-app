-- 提案軸拡張 Phase 3
-- 1. intent (介入タイプ): activating / calming / mindful / problem_solving
-- 2. is_universal: 「明示的に汎用」と「AI不確実で空配列」の区別
-- 3. day_type に 'holiday' を許容（PostgreSQL の text[] 上は実装済、API/UI 側で取り扱い）
--
-- 詳細: docs/specs/suggestion-axes-extension.md (Phase 3 セクション)

ALTER TABLE suggestions_master
  ADD COLUMN IF NOT EXISTS intent       text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS is_universal boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_suggestions_master_intent ON suggestions_master USING GIN (intent);

COMMENT ON COLUMN suggestions_master.intent       IS 'activating / calming / mindful / problem_solving';
COMMENT ON COLUMN suggestions_master.is_universal IS 'true = 明示的に汎用提案（どの文脈でも適切）、false = AI 自信なし or 文脈依存';
