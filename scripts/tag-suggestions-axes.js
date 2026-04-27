#!/usr/bin/env node
// 既存 suggestions_master 行に軸タグ（season/weather/temperature_band/part_of_day/day_type/mood）を
// AI で提案するスクリプト。DB は変更しない。出力 JSON を人手レビュー後 apply-axis-tags.js で適用。
//
// 使い方:
//   node scripts/tag-suggestions-axes.js [--limit N] [--only-untagged] [--provider ollama|gemini]
//
// 出力:
//   data/axis-tags/pending/<timestamp>.json  (人手レビューして data/axis-tags/approved/ に移動)
//
// 環境変数:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (または SUPABASE_SERVICE_KEY)
//   OLLAMA_BASE_URL, OLLAMA_MODEL, OLLAMA_API_KEY  (provider=ollama)
//   GEMINI_API_KEY                                  (provider=gemini)

const fs = require('fs');
const path = require('path');
const { loadEnv } = require('./_lib/loadEnv');
loadEnv();
const { getArg, hasFlag, getSupabase } = require('./_lib/common');
const { VALID } = require('../api/v1/_lib/contextAxes');

function buildPrompt(row) {
  return `あなたは気晴らし・ストレスケアの専門家です。
以下の気晴らし提案について、どんな状況に適しているかを軸ごとに分類してください。

【提案】
タイトル: ${row.title}
説明: ${row.description}
カテゴリ: ${row.category}
所要時間: ${row.duration}分
ステップ: ${(row.steps || []).join(' / ')}

【軸と値域】
- season: ${VALID.season.join(' / ')}（複数可。年中通用なら空配列）
- weather: ${VALID.weather.join(' / ')}（複数可。屋内などで天気不問なら空配列）
- temperature_band: ${VALID.temperature_band.join(' / ')}（複数可。気温不問なら空配列）
- part_of_day: ${VALID.part_of_day.join(' / ')}（複数可。一日中OKなら空配列）
- day_type: ${VALID.day_type.join(' / ')}（複数可。両方OKなら空配列）
- mood: ${VALID.mood.join(' / ')}（複数可。汎用なら空配列）
- intent: ${VALID.intent.join(' / ')}（介入タイプ。activating=元気回復、calming=落ち着き、mindful=今に集中、problem_solving=思考整理。複数可、不明なら空配列）
- seasonal_events: ${VALID.seasonal_events.join(' / ')}（特定イベント期に強くフィットする提案のみタグ付け、汎用なら空配列）

【is_universal フラグ】
true = 「いつ・どこで・誰でも・どんな気分でも」適切な普遍的な提案だと明確に判断できる場合のみ
false = 文脈依存の提案、または判断に迷う場合（=空配列軸が多くても is_universal=true にしない）

【判定方針】
- 該当が明確な場合のみ値を入れる。迷ったら空配列（=どの値にもマッチする）
- 「散歩」「外で深呼吸」など屋外限定 → weather に sunny/cloudy 等を入れる
- 「就寝前」「朝起きて」など時間帯限定 → part_of_day に night/morning を入れる
- 「リラックス」「瞑想」など普遍的 → 軸は全部空 + is_universal=true
- intent は提案の核となる介入タイプを1〜2個

【出力】
必ず以下の JSON のみを返してください。説明文は不要。

{
  "season": [],
  "weather": [],
  "temperature_band": [],
  "part_of_day": [],
  "day_type": [],
  "mood": [],
  "intent": [],
  "seasonal_events": [],
  "is_universal": false
}
`;
}

async function callOllama(prompt) {
  const baseUrl = (process.env.OLLAMA_BASE_URL || 'https://ollama.com').replace(/\/+$/, '').replace(/\/api$/, '');
  const model = process.env.OLLAMA_MODEL || 'gemma4:31b-cloud';
  const apiKey = process.env.OLLAMA_API_KEY || '';
  const timeout = parseInt(process.env.OLLAMA_TIMEOUT || '120000', 10);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  try {
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'あなたは気晴らし軸タグ付けの専門家。出力はJSONのみ。' },
          { role: 'user', content: prompt },
        ],
        stream: false,
        options: { temperature: 0.3, num_predict: 1024 },
      }),
    });
    if (!res.ok) throw new Error(`Ollama ${res.status}: ${res.statusText}`);
    const json = await res.json();
    return json?.message?.content || '';
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callGemini(prompt) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY 未設定');
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const client = new GoogleGenerativeAI(key);
  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { temperature: 0.3, maxOutputTokens: 2048, responseMimeType: 'application/json' },
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

function parseJson(text) {
  const tryParse = (s) => { try { return JSON.parse(s); } catch { return null; } };
  let parsed = tryParse(text);
  if (!parsed) {
    const block = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (block) parsed = tryParse(block[1].trim());
  }
  if (!parsed) {
    const obj = text.match(/\{[\s\S]*\}/);
    if (obj) parsed = tryParse(obj[0]);
  }
  if (!parsed || typeof parsed !== 'object') throw new Error('JSON が抽出できませんでした');
  return parsed;
}

function normalize(parsed) {
  const out = {};
  for (const col of Object.keys(VALID)) {
    const raw = Array.isArray(parsed[col]) ? parsed[col] : [];
    out[col] = raw.filter((v) => VALID[col].includes(v));
  }
  out.is_universal = parsed.is_universal === true;
  return out;
}

async function fetchTargets(supabase, { limit, onlyUntagged }) {
  let query = supabase
    .from('suggestions_master')
    .select('id, title, description, duration, category, steps, season, weather, temperature_band, part_of_day, day_type, mood, intent, seasonal_events, is_universal')
    .eq('is_public', true)
    .order('created_at', { ascending: false });
  // --only-untagged のときは DB 側で limit せず、クライアント絞り込み後に limit を適用する
  // （DB 側で limit すると未タグ行が limit に届かず空 batch になり Phase 2 ループが止まる）
  if (limit && !onlyUntagged) query = query.limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error('[tag] fetch error:', error.message);
    process.exit(1);
  }
  if (!onlyUntagged) return data;
  // 「未タグ」=「全配列カラムが空 かつ is_universal=false」
  // is_universal=true は明示的に汎用と判断済みなので再タグ付け対象外
  const untagged = data.filter((r) =>
    !r.is_universal &&
    Object.keys(VALID).every((c) => !Array.isArray(r[c]) || r[c].length === 0)
  );
  return limit ? untagged.slice(0, limit) : untagged;
}

async function main() {
  const provider = getArg('--provider', 'ollama');
  if (!['ollama', 'gemini'].includes(provider)) {
    console.error('--provider は ollama か gemini'); process.exit(1);
  }
  const limit = getArg('--limit') ? parseInt(getArg('--limit'), 10) : null;
  const onlyUntagged = hasFlag('--only-untagged');

  const supabase = getSupabase();
  console.log(`[tag] fetching suggestions${onlyUntagged ? ' (untagged only)' : ''}...`);
  const rows = await fetchTargets(supabase, { limit, onlyUntagged });
  console.log(`[tag] ${rows.length} 行を処理 (provider=${provider})`);

  const tagged = [];
  let okCount = 0;
  for (const [i, row] of rows.entries()) {
    try {
      console.log(`  [${i + 1}/${rows.length}] ${String(row.title || '').slice(0, 30)}`);
      const text = provider === 'gemini' ? await callGemini(buildPrompt(row)) : await callOllama(buildPrompt(row));
      const axes = normalize(parseJson(text));
      tagged.push({ id: row.id, title: row.title, axes });
      okCount += 1;
    } catch (err) {
      console.error(`    失敗: ${err.message}`);
      tagged.push({ id: row.id, title: row.title, error: err.message });
    }
  }

  const outDir = path.resolve('data/axis-tags/pending');
  fs.mkdirSync(outDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const file = path.join(outDir, `${ts}.json`);
  fs.writeFileSync(file, JSON.stringify({ generatedAt: new Date().toISOString(), provider, count: tagged.length, tagged }, null, 2));
  console.log(`[tag] ${okCount}/${rows.length} 件成功 → ${file}`);
  console.log('[tag] 次の手順: ファイルをレビュー → data/axis-tags/approved/ に移動 → apply-axis-tags.js 実行');
}

main().catch((err) => { console.error('[tag] fatal:', err); process.exit(1); });
