// V2 response formatter
// Wraps data in standardized envelope with metadata

const crypto = require('crypto');

/**
 * Format a successful v2 response
 */
function success(res, data, rateLimitInfo, statusCode = 200) {
  const body = {
    data,
    meta: {
      request_id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      rate_limit: rateLimitInfo ? {
        limit: rateLimitInfo.limit_day || 0,
        remaining: rateLimitInfo.remaining_day || 0,
        reset: rateLimitInfo.reset || 0
      } : undefined
    }
  };

  return res.status(statusCode).json(body);
}

/**
 * Format an error v2 response
 */
function error(res, statusCode, errorObj) {
  const body = {
    error: {
      code: errorObj.code || 'UNKNOWN_ERROR',
      message: errorObj.message || 'An unknown error occurred'
    },
    meta: {
      request_id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    }
  };

  return res.status(statusCode).json(body);
}

module.exports = { success, error };
