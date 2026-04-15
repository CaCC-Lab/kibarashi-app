// V2 Suggestions endpoint - API key authentication required
// Reuses v1 logic (Gemini client, cache, fallback)

const { authenticate } = require('./_lib/authMiddleware.js');
const { setRateLimitHeaders, setRetryHeaders } = require('./_lib/rateLimiter.js');
const { success, error } = require('./_lib/responseHelper.js');
const { updateUsageLog } = require('./_lib/usageLogger.js');

// Reuse v1 modules
const { getFallbackSuggestions } = require('../v1/_lib/fallback.js');
const { getCache } = require('../v1/_lib/cache.js');
const { SimpleAPIKeyManager } = require('../v1/_lib/apiKeyManager.js');

let geminiClient = null;
let keyManager = null;
let lastKeyRotation = 0;
const cache = getCache();

function getGeminiClient() {
  if (!geminiClient || Date.now() - lastKeyRotation > 60000) {
    try {
      if (!keyManager) keyManager = new SimpleAPIKeyManager();
      let GeminiClient;
      try {
        ({ GeminiClient } = require('../v1/_lib/gemini.js'));
      } catch (loadErr) {
        console.error('[V2/SUGGESTIONS] Failed to load Gemini module:', loadErr.message);
        return null;
      }
      geminiClient = new GeminiClient(keyManager);
      lastKeyRotation = Date.now();
    } catch (err) {
      console.error('[V2/SUGGESTIONS] Failed to initialize Gemini client:', err.message);
    }
  }
  return geminiClient;
}

module.exports = async (req, res) => {
  const startTime = Date.now();

  // CORS (v2: restrictive - configured via vercel.json or env)
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

  // Authentication
  const auth = await authenticate(req);
  if (!auth.authorized) {
    if (auth.status === 429) setRetryHeaders(res, auth.rateLimitInfo);
    return error(res, auth.status, auth.error);
  }

  setRateLimitHeaders(res, auth.rateLimitInfo);

  try {
    const {
      situation = 'workplace',
      duration = '5',
      ageGroup = 'office_worker',
      skipCache = 'false'
    } = req.query;

    const durationNum = parseInt(duration);
    const validSituations = ['workplace', 'home', 'outside', 'job_hunting'];
    const validDurations = [5, 15, 30];
    const validAgeGroups = ['office_worker', 'job_hunting_new_grad', 'job_hunting_career', 'student', 'general'];

    const normalizedSituation = validSituations.includes(situation) ? situation : 'workplace';
    const normalizedDuration = validDurations.includes(durationNum) ? durationNum : 5;
    const normalizedAgeGroup = validAgeGroups.includes(ageGroup) ? ageGroup : 'office_worker';

    let suggestions = null;
    let source = 'fallback';

    // Cache check
    const cacheKey = cache.generateKey(normalizedSituation, normalizedDuration, normalizedAgeGroup);
    const shouldSkipCache = skipCache === 'true';

    if (!shouldSkipCache) {
      const cached = cache.get(cacheKey);
      if (cached) {
        suggestions = cached;
        source = 'cache';
      }
    }

    // Gemini API (only if plan allows it)
    if (!suggestions && auth.keyInfo.allowGemini) {
      const client = getGeminiClient();
      if (client) {
        try {
          suggestions = await client.generateSuggestions(normalizedSituation, normalizedDuration, normalizedAgeGroup);
          source = 'gemini_api';
          cache.set(cacheKey, suggestions);
        } catch (geminiErr) {
          console.error('[V2/SUGGESTIONS] Gemini error:', geminiErr.message);
        }
      }
    }

    // Fallback
    if (!suggestions) {
      suggestions = getFallbackSuggestions(normalizedSituation, normalizedDuration, normalizedAgeGroup);
      if (suggestions && suggestions.length > 0) {
        suggestions = shuffleArray(suggestions);
      }
    }

    const responseTimeMs = Date.now() - startTime;

    // Update usage log (non-blocking) - row was inserted by RPC
    updateUsageLog({ keyId: auth.keyInfo.keyId, statusCode: 200, responseTimeMs });

    return success(res, {
      suggestions,
      situation: normalizedSituation,
      duration: normalizedDuration,
      ageGroup: normalizedAgeGroup,
      source
    }, auth.rateLimitInfo);

  } catch (err) {
    console.error('[V2/SUGGESTIONS] Unexpected error:', err.message);
    const responseTimeMs = Date.now() - startTime;

    updateUsageLog({ keyId: auth.keyInfo?.keyId, statusCode: 500, responseTimeMs });

    return error(res, 500, {
      code: 'INTERNAL_ERROR',
      message: 'An internal error occurred. Please try again later.'
    });
  }
};

function shuffleArray(array) {
  if (!array || array.length === 0) return array;
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
