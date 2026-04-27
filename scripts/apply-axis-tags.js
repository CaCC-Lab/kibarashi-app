#!/usr/bin/env node
// data/axis-tags/approved/ にあるレビュー済みタグを suggestions_master に UPDATE する。
// 運用フロー:
//   1. tag-suggestions-axes.js で data/axis-tags/pending/*.json を生成
//   2. 人手レビュー → OK のファイルを data/axis-tags/approved/ に移動
//   3. このスクリプトで UPDATE、処理済みは data/axis-tags/approved/committed/ へ退避
//
// 使い方:
//   node scripts/apply-axis-tags.js                # 全件適用
//   node scripts/apply-axis-tags.js --dry-run      # 件数のみ表示
//   node scripts/apply-axis-tags.js --file path/to/one.json
//
// 環境変数: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY)

const fs = require('fs');
const path = require('path');
const { loadEnv } = require('./_lib/loadEnv');
loadEnv();
const { getArg, hasFlag, getSupabase } = require('./_lib/common');
const { VALID } = require('../api/v1/_lib/contextAxes');

function listFiles() {
  const file = getArg('--file');
  if (file) return [path.resolve(file)];
  const dir = path.resolve('data/axis-tags/approved');
  if (!fs.existsSync(dir)) {
    console.error('data/axis-tags/approved/ が存在しません');
    process.exit(1);
  }
  return fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => path.join(dir, f));
}

function validateAxes(axes) {
  const errs = [];
  // 既知キー以外（誤入力など）が混じっていたら拒否（DBの未知列指定で SQL エラーを防ぐ）
  const known = new Set(Object.keys(VALID));
  for (const k of Object.keys(axes || {})) {
    if (!known.has(k)) errs.push(`未知のキー: ${k}`);
  }
  for (const col of Object.keys(VALID)) {
    if (!Array.isArray(axes[col])) {
      errs.push(`${col} が配列ではない`);
      continue;
    }
    for (const v of axes[col]) {
      if (!VALID[col].includes(v)) errs.push(`${col} に不正値: ${v}`);
    }
  }
  return errs;
}

function pickAxes(axes) {
  // 既知の軸カラムだけを抽出（余分なキーをDBに送らない）
  const out = {};
  for (const col of Object.keys(VALID)) out[col] = axes[col];
  return out;
}

function isAllEmpty(axes) {
  return Object.keys(VALID).every((c) => Array.isArray(axes[c]) && axes[c].length === 0);
}

async function main() {
  const dryRun = hasFlag('--dry-run');
  const files = listFiles();
  if (files.length === 0) {
    console.log('対象ファイルなし'); return;
  }
  console.log(`[apply] ${files.length} ファイル処理${dryRun ? ' (dry-run)' : ''}`);

  const supabase = dryRun ? null : getSupabase();
  const committedDir = path.resolve('data/axis-tags/approved/committed');
  if (!dryRun) {
    fs.mkdirSync(committedDir, { recursive: true });
    try { fs.accessSync(committedDir, fs.constants.W_OK); }
    catch (err) { console.error(`committedDir に書き込めません: ${err.message}`); process.exit(1); }
  }

  let okFiles = 0, skippedFiles = 0;
  let okRows = 0, errRows = 0;

  for (const file of files) {
    const base = path.basename(file);
    const inflightPath = path.join(committedDir, base + '.inflight');
    let movedToInflight = false;

    try {
      const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
      const tagged = Array.isArray(payload.tagged) ? payload.tagged : [];
      if (tagged.length === 0) {
        console.log(`  ${base}: 0件、スキップ`);
        skippedFiles += 1;
        continue;
      }

      const valid = [];
      for (const t of tagged) {
        if (t.error) { console.warn(`  [${base}] id=${t.id}: 失敗ログ、スキップ`); errRows += 1; continue; }
        if (!t.id || !t.axes) { errRows += 1; continue; }
        const errs = validateAxes(t.axes);
        if (errs.length) { console.warn(`  [${base}] id=${t.id}: ${errs.join(', ')}`); errRows += 1; continue; }
        valid.push(t);
      }

      if (valid.length === 0) {
        console.log(`  ${base}: 有効0件、スキップ`); skippedFiles += 1; continue;
      }

      if (dryRun) {
        console.log(`  ${base}: ${valid.length} 件 UPDATE 予定`);
        okRows += valid.length;
        okFiles += 1;
        continue;
      }

      // 二重適用防止のためファイルを inflight に先行退避
      fs.renameSync(file, inflightPath);
      movedToInflight = true;

      // 1行ずつ UPDATE（PostgRESTのバルクUPDATEは値が異なるため）
      let fileOk = 0, fileErr = 0, fileSkip = 0;
      for (const t of valid) {
        // 既存タグを誤って空に上書きしないよう、全空 axes は skip
        if (isAllEmpty(t.axes)) {
          console.log(`    id=${t.id}: 全軸が空のためスキップ（既存タグ保護）`);
          fileSkip += 1;
          continue;
        }
        const safeAxes = pickAxes(t.axes);
        // .select('id') を付けて UPDATE が実際に対象行に当たったかを検出
        const { data, error } = await supabase
          .from('suggestions_master')
          .update(safeAxes)
          .eq('id', t.id)
          .select('id');
        if (error) {
          console.error(`    id=${t.id}: ${error.message}`);
          fileErr += 1;
        } else if (!Array.isArray(data) || data.length === 0) {
          console.warn(`    id=${t.id}: UPDATE 対象なし（id が DB に存在しない可能性）`);
          fileErr += 1;
        } else {
          fileOk += 1;
        }
      }

      okRows += fileOk;
      errRows += fileErr;
      // 全件失敗ならソースを approved/ に戻して再処理可能にする
      // 部分成功時のみ committed/ に確定（promote-suggestions と挙動を揃える）
      if (fileOk > 0) {
        try {
          fs.renameSync(inflightPath, path.join(committedDir, base));
        } catch (e) {
          console.warn(`  ${base}: rename 失敗 (${e.message})、inflight のまま残ります`);
        }
        console.log(`  ${base}: ${fileOk}/${valid.length} 件 UPDATE${fileSkip ? ` (skip ${fileSkip})` : ''}${fileErr ? ` (err ${fileErr})` : ''}`);
        okFiles += 1;
      } else {
        // 全失敗: inflight を approved/ に戻す
        try {
          fs.renameSync(inflightPath, file);
          console.warn(`  ${base}: 全件失敗のため approved/ に差し戻しました`);
        } catch (e) {
          console.warn(`  ${base}: ロールバック失敗 (${e.message}) — ${inflightPath} を手動で戻してください`);
        }
        skippedFiles += 1;
      }
    } catch (err) {
      if (movedToInflight && fs.existsSync(inflightPath) && !fs.existsSync(file)) {
        try { fs.renameSync(inflightPath, file); } catch { /* best effort */ }
      }
      console.error(`  ${base}: 例外 — ${err.message}`);
      skippedFiles += 1;
    }
  }

  console.log(`\n[apply] 完了: ファイル ok=${okFiles} skip=${skippedFiles} / 行 ok=${okRows} err=${errRows}`);
}

main().catch((err) => { console.error('[apply] fatal:', err); process.exit(1); });
