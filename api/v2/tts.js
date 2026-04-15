// V2 TTS endpoint - Pro/Internal plans only

const { authenticate } = require('./_lib/authMiddleware.js');
const { setRateLimitHeaders, setRetryHeaders } = require('./_lib/rateLimiter.js');
const { success, error } = require('./_lib/responseHelper.js');
const { updateUsageLog } = require('./_lib/usageLogger.js');

module.exports = async (req, res) => {
  const startTime = Date.now();

  const allowedOrigin = process.env.V2_CORS_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Expose-Headers', 'X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, Retry-After');
  if (allowedOrigin !== '*') res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return error(res, 405, { code: 'METHOD_NOT_ALLOWED', message: 'Only POST is allowed' });
  }

  // Authentication
  const auth = await authenticate(req);
  if (!auth.authorized) {
    if (auth.status === 429) setRetryHeaders(res, auth.rateLimitInfo);
    return error(res, auth.status, auth.error);
  }

  setRateLimitHeaders(res, auth.rateLimitInfo);

  // Scope check: TTS requires Pro or Internal plan
  if (!auth.keyInfo.allowTts) {
    updateUsageLog({ keyId: auth.keyInfo.keyId, statusCode: 403, responseTimeMs: Date.now() - startTime });
    return error(res, 403, {
      code: 'PLAN_UPGRADE_REQUIRED',
      message: 'TTS is available on Pro and Internal plans only'
    });
  }

  try {
    const { text, voice = 'ja-JP-Standard-A', speed = 1.0 } = req.body || {};

    if (!text || typeof text !== 'string') {
      return error(res, 400, {
        code: 'INVALID_REQUEST',
        message: 'Request body must include a "text" field (string)'
      });
    }

    if (text.length > 1000) {
      return error(res, 400, {
        code: 'TEXT_TOO_LONG',
        message: 'Text must be 1000 characters or less'
      });
    }

    // Google Cloud TTS call
    const ttsApiKey = process.env.GOOGLE_CLOUD_TTS_KEY;
    if (!ttsApiKey) {
      return error(res, 503, {
        code: 'TTS_UNAVAILABLE',
        message: 'TTS service is not configured'
      });
    }

    const axios = require('axios');
    const ttsResponse = await axios.post(
      'https://texttospeech.googleapis.com/v1/text:synthesize',
      {
        input: { text },
        voice: { languageCode: 'ja-JP', name: voice },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: Math.max(0.5, Math.min(2.0, parseFloat(speed) || 1.0))
        }
      },
      {
        timeout: 10000,
        headers: { 'X-Goog-Api-Key': ttsApiKey }
      }
    );

    const responseTimeMs = Date.now() - startTime;

    updateUsageLog({ keyId: auth.keyInfo.keyId, statusCode: 200, responseTimeMs });

    return success(res, {
      audioContent: ttsResponse.data.audioContent,
      encoding: 'MP3',
      voice,
      text_length: text.length
    }, auth.rateLimitInfo);

  } catch (err) {
    const safeMessage = (err.message || '').replace(/key=[^&\s]*/gi, 'key=REDACTED');
    console.error('[V2/TTS] Error:', safeMessage);
    const responseTimeMs = Date.now() - startTime;

    updateUsageLog({ keyId: auth.keyInfo?.keyId, statusCode: 500, responseTimeMs });

    return error(res, 500, {
      code: 'TTS_ERROR',
      message: 'Failed to generate speech. Please try again later.'
    });
  }
};
