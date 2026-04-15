// Rate limit header helpers for v2 responses

/**
 * Set rate limit headers on response
 */
function setRateLimitHeaders(res, rateLimitInfo) {
  if (!rateLimitInfo) return;

  res.setHeader('X-RateLimit-Limit', String(rateLimitInfo.limit_day || 0));
  res.setHeader('X-RateLimit-Remaining', String(rateLimitInfo.remaining_day || 0));
  res.setHeader('X-RateLimit-Reset', String(rateLimitInfo.reset || 0));
}

/**
 * Set rate limit headers for 429 responses
 */
function setRetryHeaders(res, rateLimitInfo) {
  if (!rateLimitInfo) return;

  res.setHeader('X-RateLimit-Limit', String(rateLimitInfo.limit || 0));
  res.setHeader('X-RateLimit-Remaining', '0');
  res.setHeader('X-RateLimit-Reset', String(rateLimitInfo.reset || 0));

  const retryAfter = Math.max(1, Math.ceil((rateLimitInfo.reset || 0) - Date.now() / 1000));
  res.setHeader('Retry-After', String(retryAfter));
}

module.exports = { setRateLimitHeaders, setRetryHeaders };
