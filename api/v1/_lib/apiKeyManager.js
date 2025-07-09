// CLAUDE-GENERATED: APIキーローテーション機能
// 複数のGemini APIキーを管理し、エラー時に自動切り替え

class SimpleAPIKeyManager {
  constructor() {
    this.keys = [];
    this.currentIndex = 0;
    this.failureCounts = {};
    this.lastRotation = Date.now();
    this.keyStatuses = {}; // Track key status (working/failed)
    
    // 環境変数からキーを読み込み
    // 複数キー（GEMINI_API_KEY_1, 2, 3）を優先
    for (let i = 1; i <= 3; i++) {
      const key = process.env[`GEMINI_API_KEY_${i}`];
      if (key) {
        this.keys.push(key);
      }
    }
    
    // レガシーキー（GEMINI_API_KEY）は最後に追加（フォールバック用）
    const legacyKey = process.env.GEMINI_API_KEY;
    if (legacyKey && !this.keys.includes(legacyKey)) {
      this.keys.push(legacyKey);
    }
    
    console.log(`[APIKeyManager] Loaded ${this.keys.length} API keys`);
    
    // 最初から動作するキーを探す
    this.findWorkingKey();
  }
  
  getCurrentKey() {
    if (this.keys.length === 0) {
      throw new Error('No Gemini API keys configured. Please set GEMINI_API_KEY environment variable.');
    }
    return this.keys[this.currentIndex];
  }
  
  rotateKey() {
    if (this.keys.length <= 1) {
      console.warn('[APIKeyManager] Cannot rotate - only one key available');
      return this.keys[0];
    }
    
    this.currentIndex = (this.currentIndex + 1) % this.keys.length;
    console.log(`[APIKeyManager] Rotated to key index ${this.currentIndex}`);
    this.lastRotation = Date.now();
    return this.keys[this.currentIndex];
  }
  
  markFailure(key) {
    this.failureCounts[key] = (this.failureCounts[key] || 0) + 1;
    console.log(`[APIKeyManager] Key failure count: ${this.failureCounts[key]}`);
    
    // Mark key as failed if quota error
    this.keyStatuses[key] = 'failed';
    
    // 3回失敗したら次のキーへローテーション
    if (this.failureCounts[key] >= 3) {
      console.log('[APIKeyManager] Key failed 3 times, rotating...');
      
      // 失敗カウントをリセット（1時間後）
      setTimeout(() => {
        this.failureCounts[key] = 0;
        this.keyStatuses[key] = 'unknown'; // Reset status after cooldown
        console.log('[APIKeyManager] Reset failure count for key');
      }, 60 * 60 * 1000);
      
      return this.rotateKey();
    }
    
    return key;
  }
  
  markSuccess(key) {
    // 成功時は失敗カウントをリセット
    if (this.failureCounts[key] > 0) {
      console.log('[APIKeyManager] Resetting failure count after success');
      this.failureCounts[key] = 0;
    }
    // Mark key as working
    this.keyStatuses[key] = 'working';
  }
  
  findWorkingKey() {
    // Skip to the first non-failed key
    for (let i = 0; i < this.keys.length; i++) {
      const key = this.keys[i];
      if (this.keyStatuses[key] !== 'failed') {
        this.currentIndex = i;
        console.log(`[APIKeyManager] Starting with key index ${i}`);
        return;
      }
    }
    // If all keys are marked as failed, start from beginning
    console.log('[APIKeyManager] All keys marked as failed, starting from index 0');
  }
  
  getStatus() {
    return {
      totalKeys: this.keys.length,
      currentIndex: this.currentIndex,
      failureCounts: this.failureCounts,
      keyStatuses: this.keyStatuses,
      lastRotation: new Date(this.lastRotation).toISOString()
    };
  }
}

module.exports = { SimpleAPIKeyManager };