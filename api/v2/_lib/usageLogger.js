// Non-blocking usage log updater
// The log row is inserted by check_rate_limit RPC (with status_code=0).
// This module updates status_code and response_time_ms after the response.

const { getSupabaseAdmin } = require('./supabaseAdmin.js');

/**
 * Update the most recent usage log entry for this key (non-blocking)
 */
function updateUsageLog({ keyId, statusCode, responseTimeMs }) {
  if (!keyId) return;
  // Fire and forget
  setImmediate(async () => {
    try {
      const supabase = getSupabaseAdmin();
      // Update the latest log entry with status_code=0 (the one RPC just inserted)
      const { data } = await supabase
        .from('api_usage_log')
        .select('id')
        .eq('api_key_id', keyId)
        .eq('status_code', 0)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        await supabase
          .from('api_usage_log')
          .update({ status_code: statusCode, response_time_ms: responseTimeMs })
          .eq('id', data.id);
      }
    } catch (err) {
      console.error('[USAGE_LOG] Failed to update log:', err.message);
    }
  });
}

/**
 * Extract client IP from request
 */
function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.socket?.remoteAddress
    || null;
}

module.exports = { updateUsageLog, getClientIp };
