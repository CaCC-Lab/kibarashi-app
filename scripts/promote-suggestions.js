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
//
// 二重投入対策:
//   INSERT 前にファイルを committed/ に `.inflight` サフィックスで移動する。
//   INSERT 成功後にサフィックスを外して `.json` に戻す。再実行時は data/approved/ の
//   直下のみ走査するため、`.inflight` のまま残ったファイルは再処理されない。

const fs = require('fs');
const path = require('path');
const { loadEnv } = require('./_lib/loadEnv');
loadEnv();
const { getArg, hasFlag, getSupabase } = require('./_lib/common');
const { VALID: AXIS_VALID } = require('../api/v1/_lib/contextAxes');

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

function coerceAxisColumn(col, value) {
  if (!Array.isArray(value)) return [];
  return value.filter((v) => AXIS_VALID[col].includes(v));
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
    season: coerceAxisColumn('season', c.season),
    weather: coerceAxisColumn('weather', c.weather),
    temperature_band: coerceAxisColumn('temperature_band', c.temperature_band),
    part_of_day: coerceAxisColumn('part_of_day', c.part_of_day),
    day_type: coerceAxisColumn('day_type', c.day_type),
    mood: coerceAxisColumn('mood', c.mood),
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
    const base = path.basename(file);
    const inflightPath = path.join(committedDir, base + '.inflight');
    const finalPath = path.join(committedDir, base);
    let movedToInflight = false;

    try {
      const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
      const specDefault = payload.spec || {};
      const candidates = Array.isArray(payload.candidates) ? payload.candidates : [];
      if (candidates.length === 0) {
        console.log(`  ${base}: 候補0件、スキップ`);
        skippedFiles += 1;
        continue;
      }

      const rows = candidates.map((c) => coerceRow(c, specDefault));
      const validRows = [];
      for (const [i, r] of rows.entries()) {
        const errs = validate(r);
        if (errs.length) {
          console.warn(`  [${base}][${i}] 無効: ${errs.join(', ')}`);
          errRows += 1;
        } else {
          validRows.push(r);
        }
      }

      if (validRows.length === 0) {
        console.log(`  ${base}: 有効候補0件、スキップ`);
        skippedFiles += 1;
        continue;
      }

      if (dryRun) {
        console.log(`  ${base}: ${validRows.length} 件 INSERT 予定`);
        okRows += validRows.length;
        okFiles += 1;
        continue;
      }

      // 1) INSERT前に inflight へ退避（以降 data/approved/ 直下からは見えなくなる）
      fs.renameSync(file, inflightPath);
      movedToInflight = true;

      // 2) INSERT
      const { data, error } = await supabase.from('suggestions_master').insert(validRows).select('id');
      if (error) {
        // INSERT失敗: inflight を元の位置に戻して再処理可能にする
        try { fs.renameSync(inflightPath, file); } catch (_) {
          console.warn(`  ${base}: rollback失敗、${inflightPath} を手動で戻してください`);
        }
        console.error(`  ${base}: 失敗 — ${error.message}`);
        errRows += validRows.length;
        continue;
      }

      // 3) INSERT 成功: サフィックスを外して .json に戻す（失敗してもDBは正、再実行は起きない）
      try {
        fs.renameSync(inflightPath, finalPath);
      } catch (renameErr) {
        console.warn(`  ${base}: rename 失敗 (${renameErr.message})、inflight のまま残ります (DBは投入済み)`);
      }
      console.log(`  ${base}: ${data.length} 件 INSERT`);
      okRows += data.length;
      okFiles += 1;
    } catch (err) {
      // inflight に移動済みで例外が出た場合はロールバックを試みる（未INSERTの場合のみ）
      if (movedToInflight && fs.existsSync(inflightPath) && !fs.existsSync(file)) {
        try { fs.renameSync(inflightPath, file); } catch (_) { /* best-effort */ }
      }
      console.error(`  ${base}: 例外 — ${err.message}`);
      skippedFiles += 1;
    }
  }

  console.log(`\n[promote] 完了: ファイル ok=${okFiles} skip=${skippedFiles} / 行 ok=${okRows} err=${errRows}`);
}

main().catch((err) => {
  console.error('[promote] fatal:', err);
  process.exit(1);
});
