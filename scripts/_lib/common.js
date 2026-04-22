// 3本のスクリプトで共有するユーティリティ
const { createClient } = require('@supabase/supabase-js');

function getArg(flag, fallback = null) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return fallback;
  return process.argv[idx + 1] ?? fallback;
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    console.error('SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY (または SUPABASE_SERVICE_KEY) が必要です');
    process.exit(1);
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

module.exports = { getArg, hasFlag, getSupabase };
