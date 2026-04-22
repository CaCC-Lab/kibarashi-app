#!/usr/bin/env node
// suggestions_master のカバレッジ分析
// age_group × situation × duration × category の分布とギャップセルを出力
//
// 使い方:
//   node scripts/analyze-suggestions-coverage.js [--json <out.json>] [--threshold 3]
//
// 環境変数:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (もしくは SUPABASE_SERVICE_KEY)

const fs = require('fs');
const path = require('path');
const { loadEnv } = require('./_lib/loadEnv');
loadEnv();
const { createClient } = require('@supabase/supabase-js');

const AGE_GROUPS = [
  'office_worker', 'student', 'middle_school', 'housewife',
  'elderly', 'job_seeker', 'career_changer',
];

const AGE_GROUP_SITUATIONS = {
  office_worker: ['workplace', 'home', 'outside'],
  student: ['studying', 'school', 'home', 'commuting'],
  middle_school: ['school', 'home', 'outside'],
  housewife: ['home', 'outside'],
  elderly: ['home', 'outside'],
  job_seeker: ['job_hunting', 'home', 'outside', 'workplace'],
  career_changer: ['job_hunting', 'workplace', 'home', 'outside'],
};

const DURATIONS = [5, 15, 30];
const CATEGORIES = ['認知的', '行動的'];

function getArg(flag, fallback = null) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return fallback;
  return process.argv[idx + 1] ?? fallback;
}

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    console.error('Error: SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY (または SUPABASE_SERVICE_KEY) が必要です');
    process.exit(1);
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

async function fetchAll(supabase) {
  const all = [];
  const pageSize = 1000;
  let from = 0;
  while (true) {
    let data, error;
    try {
      ({ data, error } = await supabase
        .from('suggestions_master')
        .select('id, duration, category, situation, age_groups, quality_score, is_public')
        .eq('is_public', true)
        .range(from, from + pageSize - 1));
    } catch (err) {
      console.error('Supabase request threw:', err.message);
      if (err.cause) console.error('  cause:', err.cause.code || '', err.cause.message || err.cause);
      const url = process.env.SUPABASE_URL || '';
      console.error(`  SUPABASE_URL: ${url.replace(/^(https?:\/\/[^.]+).*/, '$1…')}`);
      console.error('  → URL の到達性、ネットワーク、credentials を確認してください');
      process.exit(1);
    }
    if (error) {
      console.error('Supabase query error:', error.message);
      if (error.details) console.error('  details:', error.details);
      if (error.hint) console.error('  hint:', error.hint);
      process.exit(1);
    }
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

function buildHeatmap(rows) {
  const map = new Map();
  const keyOf = (ag, sit, dur, cat) => `${ag}|${sit}|${dur}|${cat}`;

  for (const r of rows) {
    const ages = Array.isArray(r.age_groups) ? r.age_groups : [];
    const sits = Array.isArray(r.situation) ? r.situation : [];
    for (const ag of ages) {
      for (const sit of sits) {
        const k = keyOf(ag, sit, r.duration, r.category);
        const entry = map.get(k) || { ageGroup: ag, situation: sit, duration: r.duration, category: r.category, count: 0 };
        entry.count += 1;
        map.set(k, entry);
      }
    }
  }
  return map;
}

function buildExpectedCells() {
  const cells = [];
  for (const ag of AGE_GROUPS) {
    const sits = AGE_GROUP_SITUATIONS[ag] || [];
    for (const sit of sits) {
      for (const dur of DURATIONS) {
        for (const cat of CATEGORIES) {
          cells.push({ ageGroup: ag, situation: sit, duration: dur, category: cat });
        }
      }
    }
  }
  return cells;
}

function summarize(map, expected, threshold) {
  const cells = expected.map((c) => {
    const k = `${c.ageGroup}|${c.situation}|${c.duration}|${c.category}`;
    const count = map.get(k)?.count ?? 0;
    return { ...c, count, isGap: count < threshold };
  });
  const gaps = cells.filter((c) => c.isGap);
  const covered = cells.length - gaps.length;
  return { cells, gaps, covered, total: cells.length };
}

function printTable(cells) {
  const byAgeGroup = new Map();
  for (const c of cells) {
    const k = `${c.ageGroup}|${c.situation}|${c.duration}`;
    const e = byAgeGroup.get(k) || { ageGroup: c.ageGroup, situation: c.situation, duration: c.duration, 認知的: 0, 行動的: 0 };
    e[c.category] = c.count;
    byAgeGroup.set(k, e);
  }
  const header = ['age_group', 'situation', 'duration', '認知的', '行動的', '合計'];
  console.log(header.join('\t'));
  for (const ag of AGE_GROUPS) {
    for (const sit of AGE_GROUP_SITUATIONS[ag] || []) {
      for (const dur of DURATIONS) {
        const row = byAgeGroup.get(`${ag}|${sit}|${dur}`) || { 認知的: 0, 行動的: 0 };
        const total = (row.認知的 || 0) + (row.行動的 || 0);
        console.log([ag, sit, dur, row.認知的 || 0, row.行動的 || 0, total].join('\t'));
      }
    }
  }
}

async function main() {
  const outJson = getArg('--json', 'data/analysis/suggestion-coverage.json');
  const threshold = parseInt(getArg('--threshold', '3'), 10);
  if (!Number.isInteger(threshold) || threshold < 1) {
    console.error(`--threshold は1以上の整数 (指定: ${getArg('--threshold')})`);
    process.exit(1);
  }

  const supabase = getSupabase();
  console.log('[analyze] fetching suggestions_master...');
  const rows = await fetchAll(supabase);
  console.log(`[analyze] fetched ${rows.length} rows`);

  const heatmap = buildHeatmap(rows);
  const expected = buildExpectedCells();
  const { cells, gaps, covered, total } = summarize(heatmap, expected, threshold);

  console.log('\n=== カバレッジ概要 ===');
  console.log(`期待セル数: ${total}  (age_group × situation × duration × category)`);
  console.log(`充足 (count >= ${threshold}): ${covered}  / ギャップ: ${gaps.length}`);
  console.log(`カバレッジ率: ${((covered / total) * 100).toFixed(1)}%\n`);

  console.log('=== 分布表（count>=1 を充足扱いにしたい場合は --threshold 1）===');
  printTable(cells);

  console.log('\n=== ギャップセル（上位20件）===');
  const topGaps = gaps.slice().sort((a, b) => a.count - b.count).slice(0, 20);
  for (const g of topGaps) {
    console.log(`  [${g.count}] ${g.ageGroup} × ${g.situation} × ${g.duration}分 × ${g.category}`);
  }
  if (gaps.length > 20) console.log(`  ... 他 ${gaps.length - 20} 件`);

  const outPath = path.resolve(outJson);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        totalRows: rows.length,
        threshold,
        summary: { total, covered, gaps: gaps.length, coverageRate: covered / total },
        cells,
        gaps,
      },
      null,
      2
    )
  );
  console.log(`\n[analyze] wrote ${outPath}`);
}

main().catch((err) => {
  console.error('[analyze] fatal:', err);
  process.exit(1);
});
