// 当日アクティブな seasonal_events を返すエンドポイント
// 使い方:
//   GET /api/v1/seasonal-events            → 今日アクティブなイベント
//   GET /api/v1/seasonal-events?date=YYYY-MM-DD → 指定日のアクティブイベント
//
// レスポンス: { activeEvents: [{ code, name_ja, start_date, end_date }, ...] }

const { createClient } = require('@supabase/supabase-js');

let supabase = null;
function getSupabase() {
  if (supabase) return supabase;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return supabase;
}

function isValidIsoDate(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
}

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const dateRaw = req.query?.date;
  let date;
  if (dateRaw && !isValidIsoDate(dateRaw)) {
    return res.status(400).json({ error: 'date must be YYYY-MM-DD' });
  }
  // デフォルト日付は JST（Asia/Tokyo）。toISOString() は UTC を返すため
  // JST 0:00〜9:00 は前日扱いになる問題を避ける。
  date = dateRaw || new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo' }).format(new Date());

  const client = getSupabase();
  if (!client) {
    // Supabase 未設定時は空配列（フォールバック挙動を維持）
    return res.status(200).json({ activeEvents: [], date, source: 'fallback' });
  }

  try {
    const { data, error } = await client
      .from('seasonal_events')
      .select('code, name_ja, start_date, end_date, description')
      .lte('start_date', date)
      .gte('end_date', date)
      .order('start_date', { ascending: true });

    if (error) {
      console.error('[seasonal-events] query error:', error.message);
      return res.status(500).json({ error: 'query failed' });
    }

    // 同じ code が複数年で見つかる可能性は理論上ない（日付フィルタで絞ってる）が、
    // 念のため code でユニーク化（最初に出会ったレコードを採用）
    const seen = new Set();
    const dedup = [];
    for (const ev of data || []) {
      if (seen.has(ev.code)) continue;
      seen.add(ev.code);
      dedup.push(ev);
    }

    return res.status(200).json({
      activeEvents: dedup,
      date,
      source: 'database',
    });
  } catch (err) {
    // 内部詳細はサーバログだけに残し、クライアントには汎用メッセージのみ返す
    console.error('[seasonal-events] unexpected:', err.message);
    return res.status(500).json({ error: 'internal_error' });
  }
};
