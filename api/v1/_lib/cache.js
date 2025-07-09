// CLAUDE-GENERATED: Gemini API レスポンスキャッシュシステム
// パフォーマンス向上とAPI使用量削減のため

class SuggestionCache {
  constructor(options = {}) {
    this.cache = new Map();
    this.ttl = options.ttl || 3600000; // デフォルト1時間
    this.maxSize = options.maxSize || 100; // 最大100エントリ
    this.hits = 0;
    this.misses = 0;
    
    console.log('[CACHE] Initialized with TTL:', this.ttl, 'ms, maxSize:', this.maxSize);
  }
  
  generateKey(situation, duration, ageGroup) {
    return `${situation}-${duration}-${ageGroup}`;
  }
  
  set(key, value) {
    // 最大サイズチェック
    if (this.cache.size >= this.maxSize) {
      // 最も古いエントリを削除（FIFO）
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
      console.log('[CACHE] Evicted oldest entry:', firstKey);
    }
    
    const entry = {
      value: value,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.ttl
    };
    
    this.cache.set(key, entry);
    console.log('[CACHE] Stored entry:', key, 'expires at:', new Date(entry.expiresAt).toISOString());
  }
  
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.misses++;
      console.log('[CACHE] Miss:', key);
      return null;
    }
    
    // 有効期限チェック
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      console.log('[CACHE] Expired:', key);
      return null;
    }
    
    this.hits++;
    console.log('[CACHE] Hit:', key);
    return entry.value;
  }
  
  size() {
    return this.cache.size;
  }
  
  clear() {
    this.cache.clear();
    console.log('[CACHE] Cleared all entries');
  }
  
  getStats() {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
      size: this.cache.size,
      maxSize: this.maxSize
    };
  }
  
  // キャッシュの状態を可視化
  getStatus() {
    const entries = [];
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      entries.push({
        key: key,
        age: Math.floor((now - entry.timestamp) / 1000), // 秒
        ttl: Math.floor((entry.expiresAt - now) / 1000), // 残り秒数
        size: JSON.stringify(entry.value).length // バイト数（概算）
      });
    }
    
    return {
      stats: this.getStats(),
      entries: entries.sort((a, b) => b.age - a.age) // 古い順
    };
  }
}

// シングルトンインスタンス（Vercel Functions間で共有）
let cacheInstance = null;

function getCache() {
  if (!cacheInstance) {
    cacheInstance = new SuggestionCache({
      ttl: 3600000, // 1時間
      maxSize: 50   // 最大50エントリ（各パラメータ組み合わせ）
    });
  }
  return cacheInstance;
}

module.exports = { SuggestionCache, getCache };