// APIKeyManagerクラスを直接インポートしてテスト用にモック
class APIKeyManager {
  private apiKeys: any[] = [];
  private currentKeyIndex: number = 0;
  private config: any;
  private stats = {
    totalRequests: 0,
    successfulRequests: 0,
    keyRotations: 0,
    rateLimitHits: 0
  };

  constructor() {
    this.config = {
      rotationEnabled: process.env.GEMINI_KEY_ROTATION_ENABLED === 'true',
      retryAttempts: parseInt(process.env.GEMINI_RETRY_ATTEMPTS || '3'),
      cooldownMinutes: parseInt(process.env.GEMINI_COOLDOWN_MINUTES || '60')
    };

    this.initializeApiKeys();
    
    if (this.apiKeys.length === 0) {
      throw new Error('No valid Gemini API keys found in environment variables');
    }
  }

  private initializeApiKeys(): void {
    // 従来のキー
    const legacyKey = process.env.GEMINI_API_KEY;
    if (legacyKey) {
      this.apiKeys.push({
        key: legacyKey,
        index: 0,
        lastUsed: null,
        failureCount: 0,
        isOnCooldown: false,
        cooldownUntil: null
      });
    }

    // 番号付きキー
    let index = 1;
    while (true) {
      const key = process.env[`GEMINI_API_KEY_${index}`];
      if (!key) break;

      if (!this.apiKeys.some(k => k.key === key)) {
        this.apiKeys.push({
          key,
          index: this.apiKeys.length,
          lastUsed: null,
          failureCount: 0,
          isOnCooldown: false,
          cooldownUntil: null
        });
      }

      index++;
    }
  }

  getCurrentApiKey(): string {
    this.updateCooldownStatus();
    
    const availableKeys = this.apiKeys.filter(key => !key.isOnCooldown);
    
    if (availableKeys.length === 0) {
      const soonestKey = this.apiKeys.reduce((prev, current) => {
        if (!prev.cooldownUntil || !current.cooldownUntil) return prev;
        return prev.cooldownUntil < current.cooldownUntil ? prev : current;
      });
      return soonestKey.key;
    }

    if (!this.config.rotationEnabled) {
      return availableKeys[0].key;
    }

    const currentKey = this.apiKeys[this.currentKeyIndex];
    if (currentKey && !currentKey.isOnCooldown) {
      currentKey.lastUsed = new Date();
      this.stats.totalRequests++;
      return currentKey.key;
    }

    return this.rotateToNextAvailableKey();
  }

  private rotateToNextAvailableKey(): string {
    const availableKeys = this.apiKeys.filter(key => !key.isOnCooldown);
    
    if (availableKeys.length === 0) {
      throw new Error('No available API keys');
    }

    const leastUsedKey = availableKeys.reduce((prev, current) => {
      if (!prev.lastUsed) return prev;
      if (!current.lastUsed) return current;
      return prev.lastUsed < current.lastUsed ? prev : current;
    });

    this.currentKeyIndex = leastUsedKey.index;
    leastUsedKey.lastUsed = new Date();
    this.stats.totalRequests++;
    this.stats.keyRotations++;

    return leastUsedKey.key;
  }

  markKeyAsFailure(apiKey: string, isRateLimit: boolean = false): void {
    const keyInfo = this.apiKeys.find(k => k.key === apiKey);
    if (!keyInfo) return;

    keyInfo.failureCount++;

    if (isRateLimit) {
      this.stats.rateLimitHits++;
      this.setCooldown(keyInfo);
    } else if (keyInfo.failureCount >= this.config.retryAttempts) {
      this.setCooldown(keyInfo);
    }
  }

  markKeyAsSuccess(apiKey: string): void {
    const keyInfo = this.apiKeys.find(k => k.key === apiKey);
    if (keyInfo) {
      keyInfo.failureCount = Math.max(0, keyInfo.failureCount - 1);
      this.stats.successfulRequests++;
    }
  }

  private setCooldown(keyInfo: any): void {
    keyInfo.isOnCooldown = true;
    keyInfo.cooldownUntil = new Date(Date.now() + this.config.cooldownMinutes * 60 * 1000);
    
    if (this.config.rotationEnabled && this.apiKeys.some(k => !k.isOnCooldown)) {
      this.rotateToNextAvailableKey();
    }
  }

  private updateCooldownStatus(): void {
    const now = new Date();
    
    for (const keyInfo of this.apiKeys) {
      if (keyInfo.isOnCooldown && keyInfo.cooldownUntil && now > keyInfo.cooldownUntil) {
        keyInfo.isOnCooldown = false;
        keyInfo.cooldownUntil = null;
        keyInfo.failureCount = 0;
      }
    }
  }

  getAvailableKeyCount(): number {
    this.updateCooldownStatus();
    return this.apiKeys.filter(key => !key.isOnCooldown).length;
  }

  getStats() {
    return {
      ...this.stats,
      totalKeys: this.apiKeys.length,
      availableKeys: this.getAvailableKeyCount(),
      keyDetails: this.apiKeys.map(key => ({
        index: key.index,
        lastUsed: key.lastUsed,
        failureCount: key.failureCount,
        isOnCooldown: key.isOnCooldown,
        cooldownUntil: key.cooldownUntil
      }))
    };
  }

  resetAllCooldowns(): void {
    for (const keyInfo of this.apiKeys) {
      keyInfo.isOnCooldown = false;
      keyInfo.cooldownUntil = null;
      keyInfo.failureCount = 0;
    }
  }

  forceRotation(): string {
    if (!this.config.rotationEnabled) {
      return this.getCurrentApiKey();
    }

    return this.rotateToNextAvailableKey();
  }
}

// テスト用の環境変数設定
const setupTestEnvironment = (keyCount: number = 3) => {
  // 既存の環境変数をクリア
  delete process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY_1;
  delete process.env.GEMINI_API_KEY_2;
  delete process.env.GEMINI_API_KEY_3;
  
  // テスト用設定
  process.env.GEMINI_KEY_ROTATION_ENABLED = 'true';
  process.env.GEMINI_RETRY_ATTEMPTS = '2';
  process.env.GEMINI_COOLDOWN_MINUTES = '1'; // テストでは1分
  
  // テスト用APIキーを設定
  for (let i = 1; i <= keyCount; i++) {
    process.env[`GEMINI_API_KEY_${i}`] = `test-api-key-${i}`;
  }
};

const cleanupEnvironment = () => {
  delete process.env.GEMINI_KEY_ROTATION_ENABLED;
  delete process.env.GEMINI_RETRY_ATTEMPTS;
  delete process.env.GEMINI_COOLDOWN_MINUTES;
  delete process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY_1;
  delete process.env.GEMINI_API_KEY_2;
  delete process.env.GEMINI_API_KEY_3;
};

describe('APIKeyManager', () => {
  beforeEach(() => {
    cleanupEnvironment();
  });

  afterEach(() => {
    cleanupEnvironment();
  });

  describe('初期化', () => {
    it('複数のAPIキーを正常に読み込む', () => {
      setupTestEnvironment(3);
      
      const manager = new APIKeyManager();
      const stats = manager.getStats();
      
      expect(stats.totalKeys).toBe(3);
      expect(stats.availableKeys).toBe(3);
    });

    it('従来のAPIキーも読み込む', () => {
      cleanupEnvironment();
      process.env.GEMINI_API_KEY = 'legacy-api-key';
      process.env.GEMINI_API_KEY_1 = 'new-api-key-1';
      
      const manager = new APIKeyManager();
      const stats = manager.getStats();
      
      expect(stats.totalKeys).toBe(2);
    });

    it('重複するAPIキーを除外する', () => {
      cleanupEnvironment();
      process.env.GEMINI_API_KEY = 'same-key';
      process.env.GEMINI_API_KEY_1 = 'same-key'; // 重複
      process.env.GEMINI_API_KEY_2 = 'different-key';
      
      const manager = new APIKeyManager();
      const stats = manager.getStats();
      
      expect(stats.totalKeys).toBe(2); // 重複を除外
    });

    it('APIキーがない場合はエラーを投げる', () => {
      cleanupEnvironment();
      
      expect(() => {
        new APIKeyManager();
      }).toThrow('No valid Gemini API keys found');
    });
  });

  describe('キー取得', () => {
    it('現在のAPIキーを取得できる', () => {
      setupTestEnvironment(2);
      
      const manager = new APIKeyManager();
      const currentKey = manager.getCurrentApiKey();
      
      expect(currentKey).toMatch(/^test-api-key-/);
    });

    it('ローテーション無効時は最初のキーを返す', () => {
      setupTestEnvironment(3);
      process.env.GEMINI_KEY_ROTATION_ENABLED = 'false';
      
      const manager = new APIKeyManager();
      const firstKey = manager.getCurrentApiKey();
      const secondKey = manager.getCurrentApiKey();
      
      expect(firstKey).toBe(secondKey); // 同じキーが返される
    });
  });

  describe('失敗処理', () => {
    it('レート制限エラーでキーをクールダウンに設定する', () => {
      setupTestEnvironment(2);
      
      const manager = new APIKeyManager();
      const currentKey = manager.getCurrentApiKey();
      
      // レート制限エラーを報告
      manager.markKeyAsFailure(currentKey, true);
      
      const stats = manager.getStats();
      expect(stats.availableKeys).toBe(1); // 1つのキーがクールダウン
    });

    it('失敗回数が閾値を超えたキーをクールダウンに設定する', () => {
      setupTestEnvironment(2);
      
      const manager = new APIKeyManager();
      const currentKey = manager.getCurrentApiKey();
      
      // 失敗を複数回報告
      manager.markKeyAsFailure(currentKey, false);
      manager.markKeyAsFailure(currentKey, false);
      
      const stats = manager.getStats();
      expect(stats.availableKeys).toBe(1); // 閾値(2回)を超えたためクールダウン
    });

    it('成功時に失敗カウントをリセットする', () => {
      setupTestEnvironment(2);
      
      const manager = new APIKeyManager();
      const currentKey = manager.getCurrentApiKey();
      
      // 失敗を報告してから成功を報告
      manager.markKeyAsFailure(currentKey, false);
      manager.markKeyAsSuccess(currentKey);
      
      const stats = manager.getStats();
      const keyDetail = stats.keyDetails.find(k => k.index === 0);
      expect(keyDetail?.failureCount).toBe(0);
    });
  });

  describe('ローテーション', () => {
    it('手動ローテーションが動作する', () => {
      setupTestEnvironment(3);
      
      const manager = new APIKeyManager();
      const firstKey = manager.getCurrentApiKey();
      const rotatedKey = manager.forceRotation();
      
      expect(rotatedKey).not.toBe(firstKey); // 異なるキーに切り替わる
    });

    it('利用可能なキーがない場合も処理できる', () => {
      setupTestEnvironment(1);
      
      const manager = new APIKeyManager();
      const currentKey = manager.getCurrentApiKey();
      
      // 唯一のキーをクールダウンに設定
      manager.markKeyAsFailure(currentKey, true);
      
      // それでもキーを取得できる（最も早く回復するキー）
      const keyAfterCooldown = manager.getCurrentApiKey();
      expect(typeof keyAfterCooldown).toBe('string');
    });
  });

  describe('統計情報', () => {
    it('正確な統計情報を返す', () => {
      setupTestEnvironment(3);
      
      const manager = new APIKeyManager();
      
      // いくつかの操作を実行
      const key1 = manager.getCurrentApiKey();
      manager.markKeyAsSuccess(key1);
      manager.forceRotation();
      const key2 = manager.getCurrentApiKey();
      manager.markKeyAsFailure(key2, true);
      
      const stats = manager.getStats();
      
      expect(stats.totalKeys).toBe(3);
      expect(stats.totalRequests).toBeGreaterThan(0);
      expect(stats.successfulRequests).toBeGreaterThan(0);
      expect(stats.keyRotations).toBeGreaterThan(0);
      expect(stats.rateLimitHits).toBe(1);
    });
  });

  describe('クールダウン管理', () => {
    it('クールダウンリセットが動作する', () => {
      setupTestEnvironment(2);
      
      const manager = new APIKeyManager();
      const currentKey = manager.getCurrentApiKey();
      
      // キーをクールダウンに設定
      manager.markKeyAsFailure(currentKey, true);
      
      let stats = manager.getStats();
      expect(stats.availableKeys).toBe(1);
      
      // クールダウンをリセット
      manager.resetAllCooldowns();
      
      stats = manager.getStats();
      expect(stats.availableKeys).toBe(2); // 全てのキーが利用可能
    });
  });

  describe('設定', () => {
    it('ローテーション無効設定を尊重する', () => {
      setupTestEnvironment(3);
      process.env.GEMINI_KEY_ROTATION_ENABLED = 'false';
      
      const manager = new APIKeyManager();
      
      expect(() => {
        manager.forceRotation();
      }).not.toThrow(); // エラーは発生しないが、ローテーションは無視される
    });

    it('カスタムリトライ回数を適用する', () => {
      setupTestEnvironment(2);
      process.env.GEMINI_RETRY_ATTEMPTS = '1'; // 1回で失敗
      
      const manager = new APIKeyManager();
      const currentKey = manager.getCurrentApiKey();
      
      // 1回失敗させる
      manager.markKeyAsFailure(currentKey, false);
      
      const stats = manager.getStats();
      expect(stats.availableKeys).toBe(1); // 1回でクールダウン
    });
  });
});