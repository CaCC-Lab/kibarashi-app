import { logger } from '../../utils/logger';

export interface APIKeyInfo {
  key: string;
  index: number;
  lastUsed: Date | null;
  failureCount: number;
  isOnCooldown: boolean;
  cooldownUntil: Date | null;
}

export interface APIKeyManagerConfig {
  rotationEnabled: boolean;
  retryAttempts: number;
  cooldownMinutes: number;
}

/**
 * Gemini API キーローテーション管理クラス
 * 
 * 機能:
 * - 複数のAPIキーの管理
 * - レート制限時の自動キー切り替え
 * - 失敗したキーのクールダウン管理
 * - 統計情報の記録
 */
export class APIKeyManager {
  private apiKeys: APIKeyInfo[] = [];
  private currentKeyIndex: number = 0;
  private config: APIKeyManagerConfig;
  private stats = {
    totalRequests: 0,
    successfulRequests: 0,
    keyRotations: 0,
    rateLimitHits: 0
  };

  private isInitialized = false;

  constructor() {
    this.config = {
      rotationEnabled: process.env.GEMINI_KEY_ROTATION_ENABLED === 'true',
      retryAttempts: parseInt(process.env.GEMINI_RETRY_ATTEMPTS || '3'),
      cooldownMinutes: parseInt(process.env.GEMINI_COOLDOWN_MINUTES || '60')
    };

    // 遅延初期化（初回のAPI使用時に実行）
    logger.info('API Key Manager created - initialization deferred until first use');
  }

  /**
   * 遅延初期化を実行
   */
  private ensureInitialized(): void {
    if (this.isInitialized) {
      return;
    }

    this.initializeApiKeys();
    
    if (this.apiKeys.length === 0) {
      if (process.env.NODE_ENV === 'test') {
        // テスト環境では警告のみ出して、ダミーキーを設定
        logger.warn('No Gemini API keys found in test environment, using dummy key for testing');
        this.apiKeys.push({
          key: 'test-dummy-key-for-testing',
          index: 0,
          lastUsed: null,
          failureCount: 0,
          isOnCooldown: false,
          cooldownUntil: null
        });
      } else {
        throw new Error('No valid Gemini API keys found in environment variables');
      }
    }

    logger.info('API Key Manager initialized', {
      keyCount: this.apiKeys.length,
      rotationEnabled: this.config.rotationEnabled,
      retryAttempts: this.config.retryAttempts,
      cooldownMinutes: this.config.cooldownMinutes
    });
    
    this.isInitialized = true;
  }

  /**
   * 環境変数からAPIキーを初期化
   */
  private initializeApiKeys(): void {
    // 従来のキー（後方互換性のため）
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

    // 番号付きキー（GEMINI_API_KEY_1, GEMINI_API_KEY_2, etc.）
    let index = 1;
    while (true) {
      const key = process.env[`GEMINI_API_KEY_${index}`];
      if (!key) break;

      // 重複チェック
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

    logger.info(`Loaded ${this.apiKeys.length} API keys`);
  }

  /**
   * 現在使用可能なAPIキーを取得
   */
  getCurrentApiKey(): string {
    this.ensureInitialized();
    this.updateCooldownStatus();
    
    const availableKeys = this.apiKeys.filter(key => !key.isOnCooldown);
    
    if (availableKeys.length === 0) {
      logger.warn('All API keys are on cooldown');
      // 全てがクールダウン中の場合、最も早く回復するキーを返す
      const soonestKey = this.apiKeys.reduce((prev, current) => {
        if (!prev.cooldownUntil || !current.cooldownUntil) return prev;
        return prev.cooldownUntil < current.cooldownUntil ? prev : current;
      });
      return soonestKey.key;
    }

    // ローテーションが無効の場合、最初の利用可能なキーを返す
    if (!this.config.rotationEnabled) {
      return availableKeys[0].key;
    }

    // 現在のインデックスが利用可能かチェック
    const currentKey = this.apiKeys[this.currentKeyIndex];
    if (currentKey && !currentKey.isOnCooldown) {
      currentKey.lastUsed = new Date();
      this.stats.totalRequests++;
      return currentKey.key;
    }

    // 次の利用可能なキーに切り替え
    return this.rotateToNextAvailableKey();
  }

  /**
   * 次の利用可能なキーにローテーション
   */
  private rotateToNextAvailableKey(): string {
    const availableKeys = this.apiKeys.filter(key => !key.isOnCooldown);
    
    if (availableKeys.length === 0) {
      throw new Error('No available API keys');
    }

    // 最も使用頻度の低いキーを選択
    const leastUsedKey = availableKeys.reduce((prev, current) => {
      if (!prev.lastUsed) return prev;
      if (!current.lastUsed) return current;
      return prev.lastUsed < current.lastUsed ? prev : current;
    });

    this.currentKeyIndex = leastUsedKey.index;
    leastUsedKey.lastUsed = new Date();
    this.stats.totalRequests++;
    this.stats.keyRotations++;

    logger.info('Rotated to API key', {
      keyIndex: this.currentKeyIndex,
      totalRotations: this.stats.keyRotations
    });

    return leastUsedKey.key;
  }

  /**
   * APIキーの失敗を記録し、必要に応じてクールダウンを設定
   */
  markKeyAsFailure(apiKey: string, isRateLimit: boolean = false): void {
    this.ensureInitialized();
    const keyInfo = this.apiKeys.find(k => k.key === apiKey);
    if (!keyInfo) {
      logger.warn('Unknown API key reported as failed', { apiKey: apiKey.substring(0, 10) + '...' });
      return;
    }

    keyInfo.failureCount++;

    if (isRateLimit) {
      this.stats.rateLimitHits++;
      this.setCooldown(keyInfo);
      logger.warn('API key hit rate limit, setting cooldown', {
        keyIndex: keyInfo.index,
        cooldownMinutes: this.config.cooldownMinutes
      });
    } else if (keyInfo.failureCount >= this.config.retryAttempts) {
      this.setCooldown(keyInfo);
      logger.warn('API key reached failure threshold, setting cooldown', {
        keyIndex: keyInfo.index,
        failureCount: keyInfo.failureCount,
        cooldownMinutes: this.config.cooldownMinutes
      });
    }
  }

  /**
   * APIキーの成功を記録
   */
  markKeyAsSuccess(apiKey: string): void {
    this.ensureInitialized();
    const keyInfo = this.apiKeys.find(k => k.key === apiKey);
    if (keyInfo) {
      keyInfo.failureCount = Math.max(0, keyInfo.failureCount - 1); // 成功時は失敗カウントを減らす
      this.stats.successfulRequests++;
    }
  }

  /**
   * キーにクールダウンを設定
   */
  private setCooldown(keyInfo: APIKeyInfo): void {
    keyInfo.isOnCooldown = true;
    keyInfo.cooldownUntil = new Date(Date.now() + this.config.cooldownMinutes * 60 * 1000);
    
    // 他のキーに自動切り替え
    if (this.config.rotationEnabled && this.apiKeys.some(k => !k.isOnCooldown)) {
      this.rotateToNextAvailableKey();
    }
  }

  /**
   * クールダウン状態を更新
   */
  private updateCooldownStatus(): void {
    const now = new Date();
    
    for (const keyInfo of this.apiKeys) {
      if (keyInfo.isOnCooldown && keyInfo.cooldownUntil && now > keyInfo.cooldownUntil) {
        keyInfo.isOnCooldown = false;
        keyInfo.cooldownUntil = null;
        keyInfo.failureCount = 0; // クールダウン後はリセット
        
        logger.info('API key cooldown expired, key is now available', {
          keyIndex: keyInfo.index
        });
      }
    }
  }

  /**
   * 利用可能なキーの数を取得
   */
  getAvailableKeyCount(): number {
    this.ensureInitialized();
    this.updateCooldownStatus();
    return this.apiKeys.filter(key => !key.isOnCooldown).length;
  }

  /**
   * 統計情報を取得
   */
  getStats() {
    this.ensureInitialized();
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

  /**
   * 全てのキーのクールダウンをリセット（緊急時用）
   */
  resetAllCooldowns(): void {
    this.ensureInitialized();
    for (const keyInfo of this.apiKeys) {
      keyInfo.isOnCooldown = false;
      keyInfo.cooldownUntil = null;
      keyInfo.failureCount = 0;
    }
    
    logger.info('All API key cooldowns have been reset');
  }

  /**
   * 手動でキーローテーション
   */
  forceRotation(): string {
    this.ensureInitialized();
    if (!this.config.rotationEnabled) {
      logger.warn('Key rotation is disabled, ignoring force rotation request');
      return this.getCurrentApiKey();
    }

    return this.rotateToNextAvailableKey();
  }
}

// 遅延初期化のためのシングルトンインスタンス
let _apiKeyManagerInstance: APIKeyManager | null = null;

export function getApiKeyManager(): APIKeyManager {
  if (!_apiKeyManagerInstance) {
    _apiKeyManagerInstance = new APIKeyManager();
  }
  return _apiKeyManagerInstance;
}

// 後方互換性のためのプロパティ
export const apiKeyManager = {
  get getCurrentApiKey() { return getApiKeyManager().getCurrentApiKey.bind(getApiKeyManager()); },
  get getAvailableKeyCount() { return getApiKeyManager().getAvailableKeyCount.bind(getApiKeyManager()); },
  get markKeyAsFailure() { return getApiKeyManager().markKeyAsFailure.bind(getApiKeyManager()); },
  get markKeyAsSuccess() { return getApiKeyManager().markKeyAsSuccess.bind(getApiKeyManager()); },
  get getStats() { return getApiKeyManager().getStats.bind(getApiKeyManager()); },
  get resetAllCooldowns() { return getApiKeyManager().resetAllCooldowns.bind(getApiKeyManager()); },
  get forceRotation() { return getApiKeyManager().forceRotation.bind(getApiKeyManager()); }
};