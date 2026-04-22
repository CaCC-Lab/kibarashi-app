#!/usr/bin/env node
// 気晴らし提案のAIバッチ生成スクリプト
// Ollama Cloud (または Gemini) を使ってギャップセル向けの候補を生成し、
// data/pending/ に JSON として書き出す。DBには自動挿入せず、人手レビュー後に別経路で投入。
//
// 使い方:
//   単発:
//     node scripts/generate-suggestions-batch.js \
//       --age-group student --situation studying --duration 5 \
//       [--category 認知的] [--count 10] [--provider ollama|gemini]
//
//   ギャップ一括:
//     node scripts/generate-suggestions-batch.js --from-gaps data/analysis/suggestion-coverage.json \
//       [--min-count 3] [--count 5] [--limit 20]
//
// 環境変数:
//   OLLAMA_BASE_URL, OLLAMA_MODEL, OLLAMA_API_KEY, OLLAMA_TIMEOUT   (provider=ollama)
//   GEMINI_API_KEY                                                  (provider=gemini)

const fs = require('fs');
const path = require('path');
const { loadEnv } = require('./_lib/loadEnv');
loadEnv();
const { getArg, hasFlag } = require('./_lib/common');

const AGE_GROUP_LABEL = {
  office_worker: '20-40代の社会人',
  student: '学生（大学生・専門学校生）',
  middle_school: '中学生',
  housewife: '主婦・主夫',
  elderly: 'シニア世代',
  job_seeker: '就職活動中の学生',
  career_changer: '転職活動中の社会人',
};

const SITUATION_LABEL = {
  workplace: '職場',
  home: '自宅',
  outside: '外出先',
  studying: '勉強中',
  school: '学校',
  commuting: '通学中・電車やバスの中',
  job_hunting: '就活・転職活動の合間（面接前や書類作成の疲れなど）',
};

function buildPrompt({ ageGroup, situation, duration, category, count }) {
  const target = AGE_GROUP_LABEL[ageGroup] || ageGroup;
  const place = SITUATION_LABEL[situation] || situation;
  const catHint = category ? `\n- カテゴリ: ${category}（この種類のみ生成）` : '\n- カテゴリ: 認知的と行動的をバランス良く混ぜる';

  return `あなたは気晴らし・ストレスケアの専門家です。
以下の条件で、既存の提案と重複しない新しい気晴らしを ${count} 件提案してください。

【条件】
- 対象: ${target}
- 場所: ${place}
- 所要時間: ${duration}分で完結${catHint}
- 特別な道具・事前準備が不要
- ストレス解消や気分転換に効果的（科学的根拠がある手法を優先）
- ありきたりでなく具体的で実行しやすい内容

【出力仕様】
必ず JSON 配列のみを返してください。説明文・前置きは一切不要です。

[
  {
    "title": "提案のタイトル（20文字以内）",
    "description": "簡潔な説明（50文字以内）",
    "category": "認知的" または "行動的",
    "steps": ["ステップ1", "ステップ2", "ステップ3", "ステップ4", "ステップ5"],
    "tags": ["短いタグ1", "短いタグ2"]
  }
]

- steps は 3〜6 ステップ
- tags は 1〜3 個（例: 呼吸法, 瞑想, 軽い運動）
- title は具体的な動詞で始める（例: 「3分だけ窓の外を眺める」）
`;
}

async function callOllama(prompt) {
  // baseUrl は末尾 /api を削る（OLLAMA_BASE_URL=https://ollama.com/api でも動くよう正規化）
  const baseUrl = (process.env.OLLAMA_BASE_URL || 'https://ollama.com')
    .replace(/\/+$/, '')
    .replace(/\/api$/, '');
  const model = process.env.OLLAMA_MODEL || 'gemma4:31b-cloud';
  const apiKey = process.env.OLLAMA_API_KEY || '';
  const timeout = parseInt(process.env.OLLAMA_TIMEOUT || '120000', 10);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const res = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers,
    signal: controller.signal,
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'あなたは気晴らし提案の専門家です。回答は JSON 配列のみ。' },
        { role: 'user', content: prompt },
      ],
      stream: false,
      options: { temperature: 0.9, num_predict: 6144 },
    }),
  });
  clearTimeout(timeoutId);
  if (!res.ok) throw new Error(`Ollama ${res.status}: ${res.statusText}`);
  const json = await res.json();
  return json?.message?.content || '';
}

async function callGemini(prompt) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY 未設定');
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const client = new GoogleGenerativeAI(key);
  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { temperature: 0.9, maxOutputTokens: 8192, responseMimeType: 'application/json' },
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

function parseJsonArray(text) {
  const tryParse = (s) => {
    try { return JSON.parse(s); } catch { return null; }
  };
  let parsed = tryParse(text);
  if (!parsed) {
    const block = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (block) parsed = tryParse(block[1].trim());
  }
  if (!parsed) {
    const arr = text.match(/\[[\s\S]*\]/);
    if (arr) parsed = tryParse(arr[0].replace(/,(\s*[}\]])/g, '$1'));
  }
  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.suggestions)) return parsed.suggestions;
  throw new Error('JSON配列が抽出できませんでした');
}

function normalize(items, spec) {
  return items.map((x) => ({
    title: String(x.title || '').slice(0, 40).trim(),
    description: String(x.description || '').slice(0, 120).trim(),
    duration: spec.duration,
    category: ['認知的', '行動的'].includes(x.category) ? x.category : (spec.category || '認知的'),
    situation: [spec.situation],
    age_groups: [spec.ageGroup],
    tags: Array.isArray(x.tags) ? x.tags.slice(0, 5).map((t) => String(t).slice(0, 20)) : [],
    steps: Array.isArray(x.steps) ? x.steps.slice(0, 6).map((s) => String(s).trim()) : [],
    source: 'ai',
    quality_score: 3.0,
    is_public: true,
  })).filter((x) => x.title && x.steps.length >= 2);
}

async function generateOne(spec, provider) {
  const prompt = buildPrompt(spec);
  const text = provider === 'gemini' ? await callGemini(prompt) : await callOllama(prompt);
  const items = parseJsonArray(text);
  return normalize(items, spec);
}

function writeCandidates(candidates, spec) {
  const outDir = path.resolve('data/pending');
  fs.mkdirSync(outDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const file = path.join(outDir, `${ts}-${spec.ageGroup}-${spec.situation}-${spec.duration}${spec.category ? '-' + spec.category : ''}.json`);
  fs.writeFileSync(file, JSON.stringify({ spec, generatedAt: new Date().toISOString(), candidates }, null, 2));
  return file;
}

async function runSingle(opts) {
  const spec = {
    ageGroup: opts.ageGroup,
    situation: opts.situation,
    duration: parseInt(opts.duration, 10),
    category: opts.category || null,
    count: parseInt(opts.count || '10', 10),
  };
  console.log(`[gen] ${spec.ageGroup} × ${spec.situation} × ${spec.duration}分${spec.category ? ' × ' + spec.category : ''}  count=${spec.count}`);
  const items = await generateOne(spec, opts.provider);
  const file = writeCandidates(items, spec);
  console.log(`[gen] ${items.length} 件生成 → ${file}`);
}

async function runFromGaps(opts) {
  const jsonPath = opts.fromGaps;
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const minCount = parseInt(opts.minCount || '3', 10);
  const perCell = parseInt(opts.count || '5', 10);
  const limit = parseInt(opts.limit || '10', 10);
  const provider = opts.provider;

  const targets = (data.gaps || [])
    .filter((g) => g.count < minCount)
    .sort((a, b) => a.count - b.count)
    .slice(0, limit);

  console.log(`[gen] ${targets.length} セルを処理 (min-count=${minCount}, per-cell=${perCell})`);

  let okCells = 0;
  for (const t of targets) {
    const spec = {
      ageGroup: t.ageGroup,
      situation: t.situation,
      duration: t.duration,
      category: t.category,
      count: perCell,
    };
    try {
      console.log(`  → ${spec.ageGroup} × ${spec.situation} × ${spec.duration}分 × ${spec.category}`);
      const items = await generateOne(spec, provider);
      const file = writeCandidates(items, spec);
      console.log(`    ${items.length} 件 → ${path.basename(file)}`);
      okCells += 1;
    } catch (err) {
      console.error(`    失敗: ${err.message}`);
    }
  }
  console.log(`[gen] ${okCells}/${targets.length} セル完了`);
}

async function main() {
  const provider = getArg('--provider', 'ollama');
  if (!['ollama', 'gemini'].includes(provider)) {
    console.error('--provider は ollama か gemini');
    process.exit(1);
  }

  if (hasFlag('--from-gaps')) {
    await runFromGaps({
      fromGaps: getArg('--from-gaps'),
      minCount: getArg('--min-count'),
      count: getArg('--count'),
      limit: getArg('--limit'),
      provider,
    });
    return;
  }

  const ageGroup = getArg('--age-group');
  const situation = getArg('--situation');
  const duration = getArg('--duration');
  if (!ageGroup || !situation || !duration) {
    console.error('必須: --age-group <id> --situation <id> --duration <5|15|30>');
    console.error('または: --from-gaps <path/to/coverage.json>');
    process.exit(1);
  }
  const durationNum = parseInt(duration, 10);
  if (![5, 15, 30].includes(durationNum)) {
    console.error(`--duration は 5 / 15 / 30 のいずれか (指定: ${duration})`);
    process.exit(1);
  }
  const category = getArg('--category');
  if (category && !['認知的', '行動的'].includes(category)) {
    console.error(`--category は 認知的 / 行動的 のいずれか (指定: ${category})`);
    process.exit(1);
  }

  await runSingle({
    ageGroup, situation, duration,
    category,
    count: getArg('--count'),
    provider,
  });
}

main().catch((err) => {
  console.error('[gen] fatal:', err);
  process.exit(1);
});
