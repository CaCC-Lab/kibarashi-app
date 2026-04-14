// Unit tests for rateLimiter
const assert = require('assert');
const { setRateLimitHeaders, setRetryHeaders } = require('./rateLimiter.js');

function createMockRes() {
  const headers = {};
  return {
    headers,
    setHeader(key, value) { headers[key] = value; }
  };
}

describe('rateLimiter', () => {
  describe('setRateLimitHeaders', () => {
    it('should set X-RateLimit headers', () => {
      const res = createMockRes();
      setRateLimitHeaders(res, { limit_day: 500, remaining_day: 423, reset: 1713100800 });

      assert.strictEqual(res.headers['X-RateLimit-Limit'], '500');
      assert.strictEqual(res.headers['X-RateLimit-Remaining'], '423');
      assert.strictEqual(res.headers['X-RateLimit-Reset'], '1713100800');
    });

    it('should not throw when rateLimitInfo is null', () => {
      const res = createMockRes();
      setRateLimitHeaders(res, null);
      assert.deepStrictEqual(res.headers, {});
    });
  });

  describe('setRetryHeaders', () => {
    it('should set Retry-After header', () => {
      const futureReset = Math.ceil(Date.now() / 1000) + 60;
      const res = createMockRes();
      setRetryHeaders(res, { limit: 10, reset: futureReset });

      assert.strictEqual(res.headers['X-RateLimit-Remaining'], '0');
      assert.ok(parseInt(res.headers['Retry-After']) > 0);
    });
  });
});
