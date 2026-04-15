// V2 Usage endpoint - returns API usage stats for the authenticated key

const { authenticate } = require('./_lib/authMiddleware.js');
const { setRateLimitHeaders, setRetryHeaders } = require('./_lib/rateLimiter.js');
const { success, error } = require('./_lib/responseHelper.js');
const { getSupabaseAdmin } = require('./_lib/supabaseAdmin.js');

module.exports = async (req, res) => {
  const allowedOrigin = process.env.V2_CORS_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Expose-Headers', 'X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, Retry-After');
  if (allowedOrigin !== '*') res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return error(res, 405, { code: 'METHOD_NOT_ALLOWED', message: 'Only GET is allowed' });
  }

  const auth = await authenticate(req);
  if (!auth.authorized) {
    if (auth.status === 429) setRetryHeaders(res, auth.rateLimitInfo);
    return error(res, auth.status, auth.error);
  }

  setRateLimitHeaders(res, auth.rateLimitInfo);

  try {
    const supabase = getSupabaseAdmin();
    const keyId = auth.keyInfo.keyId;

    // Get key metadata
    const { data: keyData, error: keyErr } = await supabase
      .from('api_keys')
      .select('key_prefix, plan, request_count, created_at, expires_at')
      .eq('id', keyId)
      .single();

    if (keyErr) throw keyErr;

    // Get today's usage count
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count: todayCount, error: countErr } = await supabase
      .from('api_usage_log')
      .select('*', { count: 'exact', head: true })
      .eq('api_key_id', keyId)
      .gte('created_at', todayStart.toISOString());

    if (countErr) throw countErr;

    // Get rate limits for plan
    const { data: limits, error: limitsErr } = await supabase
      .from('api_rate_limits')
      .select('*')
      .eq('plan', keyData.plan)
      .single();

    if (limitsErr) throw limitsErr;

    return success(res, {
      key_prefix: keyData.key_prefix,
      plan: keyData.plan,
      total_requests: keyData.request_count,
      today_requests: todayCount || 0,
      limits: {
        requests_per_minute: limits.requests_per_minute,
        requests_per_day: limits.requests_per_day,
        allow_gemini: limits.allow_gemini,
        allow_tts: limits.allow_tts
      },
      key_created_at: keyData.created_at,
      key_expires_at: keyData.expires_at
    }, auth.rateLimitInfo);

  } catch (err) {
    console.error('[V2/USAGE] Error:', err.message);
    return error(res, 500, {
      code: 'INTERNAL_ERROR',
      message: 'Failed to retrieve usage data'
    });
  }
};
