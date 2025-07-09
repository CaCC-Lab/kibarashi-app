// CLAUDE-GENERATED: キャッシュシステムのテスト
// TDD: テストファーストアプローチ

const assert = require('assert');
const { SuggestionCache } = require('./cache');

describe('SuggestionCache', () => {
  let cache;
  
  beforeEach(() => {
    cache = new SuggestionCache();
  });
  
  describe('基本機能', () => {
    it('キャッシュが空の状態で開始される', () => {
      assert.strictEqual(cache.size(), 0);
    });
    
    it('提案をキャッシュに保存できる', () => {
      const key = cache.generateKey('workplace', 5, 'office_worker');
      const suggestions = [
        { id: 'test-1', title: 'テスト提案1' },
        { id: 'test-2', title: 'テスト提案2' },
        { id: 'test-3', title: 'テスト提案3' }
      ];
      
      cache.set(key, suggestions);
      assert.strictEqual(cache.size(), 1);
    });
    
    it('キャッシュから提案を取得できる', () => {
      const key = cache.generateKey('workplace', 5, 'office_worker');
      const suggestions = [
        { id: 'test-1', title: 'テスト提案1' }
      ];
      
      cache.set(key, suggestions);
      const retrieved = cache.get(key);
      
      assert.deepStrictEqual(retrieved, suggestions);
    });
    
    it('存在しないキーはnullを返す', () => {
      const key = cache.generateKey('workplace', 5, 'office_worker');
      const retrieved = cache.get(key);
      
      assert.strictEqual(retrieved, null);
    });
  });
  
  describe('キー生成', () => {
    it('同じパラメータで同じキーが生成される', () => {
      const key1 = cache.generateKey('workplace', 5, 'office_worker');
      const key2 = cache.generateKey('workplace', 5, 'office_worker');
      
      assert.strictEqual(key1, key2);
    });
    
    it('異なるパラメータで異なるキーが生成される', () => {
      const key1 = cache.generateKey('workplace', 5, 'office_worker');
      const key2 = cache.generateKey('home', 5, 'office_worker');
      const key3 = cache.generateKey('workplace', 15, 'office_worker');
      const key4 = cache.generateKey('workplace', 5, 'job_hunting');
      
      assert.notStrictEqual(key1, key2);
      assert.notStrictEqual(key1, key3);
      assert.notStrictEqual(key1, key4);
    });
  });
  
  describe('有効期限', () => {
    it('期限内のキャッシュは取得できる', async () => {
      const cache = new SuggestionCache({ ttl: 100 }); // 100ms
      const key = cache.generateKey('workplace', 5, 'office_worker');
      const suggestions = [{ id: 'test-1' }];
      
      cache.set(key, suggestions);
      
      // 50ms後
      await new Promise(resolve => setTimeout(resolve, 50));
      const retrieved = cache.get(key);
      
      assert.notStrictEqual(retrieved, null);
    });
    
    it('期限切れのキャッシュはnullを返す', async () => {
      const cache = new SuggestionCache({ ttl: 50 }); // 50ms
      const key = cache.generateKey('workplace', 5, 'office_worker');
      const suggestions = [{ id: 'test-1' }];
      
      cache.set(key, suggestions);
      
      // 100ms後
      await new Promise(resolve => setTimeout(resolve, 100));
      const retrieved = cache.get(key);
      
      assert.strictEqual(retrieved, null);
    });
  });
  
  describe('キャッシュサイズ制限', () => {
    it('最大サイズを超えると古いエントリが削除される', () => {
      const cache = new SuggestionCache({ maxSize: 2 });
      
      cache.set('key1', [{ id: '1' }]);
      cache.set('key2', [{ id: '2' }]);
      cache.set('key3', [{ id: '3' }]); // key1が削除される
      
      assert.strictEqual(cache.size(), 2);
      assert.strictEqual(cache.get('key1'), null);
      assert.notStrictEqual(cache.get('key2'), null);
      assert.notStrictEqual(cache.get('key3'), null);
    });
  });
  
  describe('統計情報', () => {
    it('ヒット率を計算できる', () => {
      const key = cache.generateKey('workplace', 5, 'office_worker');
      cache.set(key, [{ id: 'test-1' }]);
      
      // 3回ヒット
      cache.get(key);
      cache.get(key);
      cache.get(key);
      
      // 2回ミス
      cache.get('nonexistent1');
      cache.get('nonexistent2');
      
      const stats = cache.getStats();
      assert.strictEqual(stats.hits, 3);
      assert.strictEqual(stats.misses, 2);
      assert.strictEqual(stats.hitRate, 0.6); // 3/5 = 0.6
    });
  });
});