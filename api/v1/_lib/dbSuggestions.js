// Supabase suggestions_master からの提案取得
// DB first で高速レスポンスを実現（~65ms）

const { createClient } = require('@supabase/supabase-js');

let supabase = null;

function getSupabase() {
  if (supabase) return supabase;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.log('[DB] Supabase not configured, skipping DB lookup');
    return null;
  }

  supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  return supabase;
}

/**
 * suggestions_master からランダムに3件取得
 * situation配列に含まれ、durationが一致するものを抽出
 */
// v2 API が使う age_group エイリアスを DB の age_groups 値（v1 taxonomy）にマッピング
// v2: job_hunting_new_grad / job_hunting_career / general
// DB: job_seeker / career_changer / office_worker
const AGE_GROUP_ALIAS = {
  job_hunting_new_grad: 'job_seeker',
  job_hunting_career: 'career_changer',
  general: 'office_worker',
};

function normalizeAgeGroup(ageGroup) {
  if (!ageGroup) return null;
  return AGE_GROUP_ALIAS[ageGroup] || ageGroup;
}

// 自動取得可能な軸のフィルタリング仕様:
//   - DB側: 空配列 = 「どの値にもマッチする汎用提案」
//   - 渡された軸値がある行 = マッチ、空配列の行 = 常にマッチ
// Supabase/PostgREST の .or() で (空配列 OR overlaps) を表現する。
const AXIS_COLUMNS = ['season', 'weather', 'temperature_band', 'part_of_day', 'day_type', 'mood', 'intent'];

async function getDbSuggestions(situation, duration, ageGroup, axes = {}) {
  const client = getSupabase();
  if (!client) return null;

  try {
    const startTime = Date.now();

    // situation配列にマッチ、duration一致、公開フラグ、age_groupsが指定と重なる
    let query = client
      .from('suggestions_master')
      .select('id, title, description, duration, category, steps')
      .contains('situation', [situation])
      .eq('duration', duration)
      .eq('is_public', true);

    const dbAgeGroup = normalizeAgeGroup(ageGroup);
    if (dbAgeGroup) {
      // age_groups 配列が指定の年齢層を含むものだけ返す
      query = query.overlaps('age_groups', [dbAgeGroup]);
    }

    // 自動軸: 値が渡されていれば「空配列 OR overlaps(値)」で絞り込み
    // 呼び出し側 (v1/suggestions.js) で CONTEXT_AXES_ENABLED=false のとき空 {} を渡すため、
    // ここではフラグ判定せず値の有無だけで分岐
    for (const col of AXIS_COLUMNS) {
      const value = axes[col];
      if (value && typeof value === 'string') {
        // PostgREST .or() 構文: eq.{} は空配列一致、ov.{val} は overlaps
        query = query.or(`${col}.eq.{},${col}.ov.{${value}}`);
      }
    }

    const { data, error } = await query
      .order('quality_score', { ascending: false })
      .limit(20);

    if (error) {
      console.error('[DB] Query error:', error.message);
      return null;
    }

    if (!data || data.length === 0) {
      console.log('[DB] No suggestions found for:', { situation, duration, ageGroup });
      return null;
    }

    // ランダムに3件選択
    const shuffled = shuffleArray(data);
    const selected = shuffled.slice(0, 3);

    const elapsed = Date.now() - startTime;
    console.log(`[DB] Found ${data.length} suggestions, selected 3 in ${elapsed}ms`);

    return selected.map((s, index) => ({
      id: `db-${s.id}`,
      title: s.title,
      description: s.description,
      duration: s.duration,
      category: s.category,
      steps: Array.isArray(s.steps) ? s.steps : []
    }));

  } catch (err) {
    console.error('[DB] Unexpected error:', err.message);
    return null;
  }
}

function shuffleArray(array) {
  if (!array || array.length === 0) return array;
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

module.exports = { getDbSuggestions, normalizeAgeGroup, AGE_GROUP_ALIAS };
