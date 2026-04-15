// Unit tests for responseHelper
const assert = require('assert');
const { success, error } = require('./responseHelper.js');

// Mock response object
function createMockRes() {
  const res = {
    statusCode: null,
    body: null,
    status(code) { res.statusCode = code; return res; },
    json(data) { res.body = data; return res; }
  };
  return res;
}

describe('responseHelper', () => {
  describe('success', () => {
    it('should wrap data in envelope with meta', () => {
      const res = createMockRes();
      const rateLimitInfo = { limit_day: 500, remaining_day: 423, reset: 1713100800 };

      success(res, { foo: 'bar' }, rateLimitInfo);

      assert.strictEqual(res.statusCode, 200);
      assert.deepStrictEqual(res.body.data, { foo: 'bar' });
      assert.ok(res.body.meta.request_id);
      assert.ok(res.body.meta.timestamp);
      assert.strictEqual(res.body.meta.rate_limit.limit, 500);
      assert.strictEqual(res.body.meta.rate_limit.remaining, 423);
    });

    it('should use custom status code', () => {
      const res = createMockRes();
      success(res, {}, null, 201);
      assert.strictEqual(res.statusCode, 201);
    });

    it('should omit rate_limit when not provided', () => {
      const res = createMockRes();
      success(res, { test: true }, null);
      assert.strictEqual(res.body.meta.rate_limit, undefined);
    });
  });

  describe('error', () => {
    it('should format error response', () => {
      const res = createMockRes();
      error(res, 401, { code: 'UNAUTHORIZED', message: 'Bad key' });

      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.body.error.code, 'UNAUTHORIZED');
      assert.strictEqual(res.body.error.message, 'Bad key');
      assert.ok(res.body.meta.request_id);
      assert.ok(res.body.meta.timestamp);
    });

    it('should default error fields', () => {
      const res = createMockRes();
      error(res, 500, {});
      assert.strictEqual(res.body.error.code, 'UNKNOWN_ERROR');
    });
  });
});
