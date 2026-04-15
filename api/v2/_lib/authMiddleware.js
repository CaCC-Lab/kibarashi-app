// API Key authentication middleware for v2 endpoints
// Authorization: Bearer kb_live_xxx → SHA-256 → api_keys.key_hash lookup

const crypto = require('crypto');
const { getSupabaseAdmin } = require('./supabaseAdmin.js');
const { getClientIp } = require('./usageLogger.js');

function hashKey(apiKey) {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Authenticate API key and check rate limits via Supabase RPC.
 * Returns { authorized, keyInfo, rateLimitInfo, error } object.
 */
async function authenticate(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader) {
    return {
      authorized: false,
      status: 401,
      error: {
        code: 'MISSING_API_KEY',
        message: 'Authorization header is required. Use: Authorization: Bearer kb_live_xxx'
      }
    };
  }

  const match = authHeader.match(/^Bearer\s+(kb_live_[a-zA-Z0-9]{32})$/);
  if (!match) {
    return {
      authorized: false,
      status: 401,
      error: {
        code: 'INVALID_API_KEY_FORMAT',
        message: 'Invalid API key format. Expected: Bearer kb_live_<32 alphanumeric chars>'
      }
    };
  }

  const apiKey = match[1];
  const keyHash = hashKey(apiKey);

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_key_hash: keyHash,
      p_endpoint: req.url || '',
      p_method: req.method || 'GET',
      p_ip_address: getClientIp(req)
    });

    if (error) {
      console.error('[AUTH] Supabase RPC error:', error.message);
      return {
        authorized: false,
        status: 500,
        error: {
          code: 'AUTH_SERVICE_ERROR',
          message: 'Authentication service temporarily unavailable'
        }
      };
    }

    if (!data.allowed) {
      if (data.reason === 'invalid_key') {
        return {
          authorized: false,
          status: 401,
          error: {
            code: 'INVALID_API_KEY',
            message: 'API key is invalid, inactive, or expired'
          }
        };
      }

      // Rate limit exceeded
      return {
        authorized: false,
        status: 429,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Rate limit exceeded (${data.reason === 'rate_limit_minute' ? 'per-minute' : 'daily'} limit)`
        },
        rateLimitInfo: {
          limit: data.limit,
          current: data.current,
          reset: data.reset
        }
      };
    }

    return {
      authorized: true,
      keyInfo: {
        keyId: data.key_id,
        plan: data.plan,
        scopes: data.scopes,
        ownerName: data.owner_name,
        allowGemini: data.allow_gemini,
        allowTts: data.allow_tts
      },
      rateLimitInfo: data.rate_limit
    };
  } catch (err) {
    console.error('[AUTH] Unexpected error:', err.message);
    return {
      authorized: false,
      status: 500,
      error: {
        code: 'AUTH_SERVICE_ERROR',
        message: 'Authentication service temporarily unavailable'
      }
    };
  }
}

module.exports = { authenticate, hashKey };
