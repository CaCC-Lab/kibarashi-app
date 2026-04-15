// Unit tests for authMiddleware
const assert = require('assert');
const crypto = require('crypto');
const { hashKey } = require('./authMiddleware.js');

describe('authMiddleware', () => {
  describe('hashKey', () => {
    it('should produce consistent SHA-256 hash', () => {
      const key = 'kb_live_abcdefghijklmnopqrstuvwxyz123456';
      const hash1 = hashKey(key);
      const hash2 = hashKey(key);
      assert.strictEqual(hash1, hash2);
      assert.strictEqual(hash1.length, 64); // SHA-256 hex = 64 chars
    });

    it('should produce different hashes for different keys', () => {
      const hash1 = hashKey('kb_live_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
      const hash2 = hashKey('kb_live_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
      assert.notStrictEqual(hash1, hash2);
    });

    it('should match Node.js crypto directly', () => {
      const key = 'kb_live_testkey12345678901234567890';
      const expected = crypto.createHash('sha256').update(key).digest('hex');
      assert.strictEqual(hashKey(key), expected);
    });
  });
});
