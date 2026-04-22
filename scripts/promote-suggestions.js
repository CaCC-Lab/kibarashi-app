#!/usr/bin/env node
// data/approved/ に移動した候補JSONを suggestions_master に INSERT する
// 運用フロー:
//   1. generate-suggestions-batch.js で data/pending/*.json を生成
//   2. 人手でレビュー → OK のファイルを data/pending/ → data/approved/ に移動
//   3. このスクリプトで INSERT、処理済みは data/approved/committed/ へ退避
//
// 使い方:
//   node scripts/promote-suggestions.js                # data/approved/*.json を全投入
//   node scripts/promote-suggestions.js --dry-run      # 投入せず件数だけ表示
//   node scripts/promote-suggestions.js --file path/to/one.json
//
// 環境変数:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (または SUPABASE_SERVICE_KEY)

const fs = require('fs');
const path = require('path');
const { loadEnv } = require('./_lib/loadEnv');
loadEnv();
const { createClient } = require('@supabase/supabase-js');

function getArg(flag, fallback = null) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return fallback;
  return process.argv[idx + 1] ?? fallback;
}
function hasFlag(flag) { return process.argv.includes(flag); }

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    console.error('SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY が必要です');
    process.exit(1);
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

function listTargetFiles() {
  const file = getArg('--file');
  if (file) return [path.resolve(file)];
  const dir = path.resolve('data/approved');
  if (!fs.existsSync(dir)) {
    console.error('data/approved/ が存在しません。pending から承認済みファイルを移動してください。');
    process.exit(1);
  }
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => path.join(dir, f));
}

function coerceRow(c, specDefault) {
  const duration = c.duration ?? specDefault.duration;
  return {
    title: String(c.title || '').trim(),
    description: String(c.description || '').trim(),
    duration,
    category: c.category,
    situation: Array.isArray(c.situation) && c.situation.length > 0 ? c.situation : [specDefault.situation],
    age_groups: Array.isArray(c.age_groups) && c.age_groups.length > 0 ? c.age_groups : [specDefault.ageGroup],
    tags: Array.isArray(c.tags) ? c.tags : [],
    steps: Array.isArray(c.steps) ? c.steps : [],
    guide: Array.isArray(c.steps) ? c.steps.join('\n') : '',
    source: c.source || 'ai',
    is_public: typeof c.is_public === 'boolean' ? c.is_public : true,
    quality_score: typeof c.quality_score === 'number' ? c.quality_score : 3.0,
  };
}

function validate(row) {
  const errs = [];
  if (!row.title) errs.push('title 空');
  if (![5, 15, 30].includes(row.duration)) errs.push(`duration 不正: ${row.duration}`);
  if (!['認知的', '行動的'].includes(row.category)) errs.push(`category 不正: ${row.category}`);
  if (!row.situation?.length) errs.push('situation 空');
  if (!row.age_groups?.length) errs.push('age_groups 空');
  if (!row.steps?.length) errs.push('steps 空');
  return errs;
}

async function main() {
  const dryRun = hasFlag('--dry-run');
  const files = listTargetFiles();
  if (files.length === 0) {
    console.log('対象ファイルなし');
    return;
  }
  console.log(`[promote] ${files.length} ファイル処理${dryRun ? ' (dry-run)' : ''}`);

  const supabase = dryRun ? null : getSupabase();
  const committedDir = path.resolve('data/approved/committed');
  if (!dryRun) {
    fs.mkdirSync(committedDir, { recursive: true });
    // 投入前に退避先の書込可否を検証（INSERT後にrename失敗で二重投入を防ぐ）
    try {
      fs.accessSync(committedDir, fs.constants.W_OK);
    } catch (err) {
      console.error(`committedDir に書き込めません: ${committedDir}`);
      console.error(`理由: ${err.message}`);
      process.exit(1);
    }
  }

  let okFiles = 0, skippedFiles = 0;
  let okRows = 0, errRows = 0;

  for (const file of files) {
    try {
      const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
      const specDefault = payload.spec || {};
      const candidates = Array.isArray(payload.candidates) ? payload.candidates : [];
      if (candidates.length === 0) {
        console.log(`  ${path.basename(file)}: 候補0件、スキップ`);
        skippedFiles += 1;
        continue;
      }

      const rows = candidates.map((c) => coerceRow(c, specDefault));
      const validRows = [];
      for (const [i, r] of rows.entries()) {
        const errs = validate(r);
        if (errs.length) {
          console.warn(`  [${path.basename(file)}][${i}] 無効: ${errs.join(', ')}`);
          errRows += 1;
        } else {
          validRows.push(r);
        }
      }

      if (validRows.length === 0) {
        console.log(`  ${path.basename(file)}: 有効候補0件、スキップ`);
        skippedFiles += 1;
        continue;
      }

      if (dryRun) {
        console.log(`  ${path.basename(file)}: ${validRows.length} 件 INSERT 予定`);
        okRows += validRows.length;
      } else {
        const { data, error } = await supabase.from('suggestions_master').insert(validRows).select('id');
        if (error) {
          console.error(`  ${path.basename(file)}: 失敗 — ${error.message}`);
          errRows += validRows.length;
          continue;
        }
        console.log(`  ${path.basename(file)}: ${data.length} 件 INSERT`);
        okRows += data.length;
        fs.renameSync(file, path.join(committedDir, path.basename(file)));
      }
      okFiles += 1;
    } catch (err) {
      console.error(`  ${path.basename(file)}: 例外 — ${err.message}`);
      skippedFiles += 1;
    }
  }

  console.log(`\n[promote] 完了: ファイル ok=${okFiles} skip=${skippedFiles} / 行 ok=${okRows} err=${errRows}`);
}

main().catch((err) => {
  console.error('[promote] fatal:', err);
  process.exit(1);
});
