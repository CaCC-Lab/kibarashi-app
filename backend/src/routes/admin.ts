import express from 'express';
import { logger } from '../utils/logger';
import { apiKeyManager } from '../services/gemini/apiKeyManager';

const router = express.Router();

/**
 * GET /api/admin/api-keys/status
 * APIキーの状態を取得
 */
router.get('/api-keys/status', async (req, res) => {
  try {
    const stats = apiKeyManager.getStats();
    
    logger.info('API key status requested');

    res.json({
      success: true,
      data: {
        summary: {
          totalKeys: stats.totalKeys,
          availableKeys: stats.availableKeys,
          totalRequests: stats.totalRequests,
          successfulRequests: stats.successfulRequests,
          successRate: stats.totalRequests > 0 
            ? ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(1) + '%'
            : 'N/A',
          keyRotations: stats.keyRotations,
          rateLimitHits: stats.rateLimitHits
        },
        keyDetails: stats.keyDetails.map(key => ({
          index: key.index,
          lastUsed: key.lastUsed,
          failureCount: key.failureCount,
          isOnCooldown: key.isOnCooldown,
          cooldownUntil: key.cooldownUntil,
          status: key.isOnCooldown ? 'COOLDOWN' : 'AVAILABLE'
        }))
      }
    });

  } catch (error) {
    logger.error('Failed to get API key status', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve API key status',
      message: 'APIキー状態の取得に失敗しました'
    });
  }
});

/**
 * POST /api/admin/api-keys/rotate
 * 手動でAPIキーをローテーション
 */
router.post('/api-keys/rotate', async (req, res) => {
  try {
    logger.info('Manual API key rotation requested');

    const beforeStats = apiKeyManager.getStats();
    const newKey = apiKeyManager.forceRotation();
    const afterStats = apiKeyManager.getStats();

    res.json({
      success: true,
      data: {
        message: 'APIキーのローテーションが完了しました',
        rotationCount: afterStats.keyRotations - beforeStats.keyRotations,
        availableKeys: afterStats.availableKeys,
        newKeyIndex: afterStats.keyDetails.find(k => !k.isOnCooldown)?.index
      }
    });

  } catch (error) {
    logger.error('Failed to rotate API key', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(500).json({
      success: false,
      error: 'Failed to rotate API key',
      message: 'APIキーのローテーションに失敗しました'
    });
  }
});

/**
 * POST /api/admin/api-keys/reset-cooldowns
 * 全てのAPIキーのクールダウンをリセット（緊急時用）
 */
router.post('/api-keys/reset-cooldowns', async (req, res) => {
  try {
    logger.warn('Emergency API key cooldown reset requested');

    const beforeStats = apiKeyManager.getStats();
    apiKeyManager.resetAllCooldowns();
    const afterStats = apiKeyManager.getStats();

    res.json({
      success: true,
      data: {
        message: '全てのAPIキーのクールダウンがリセットされました',
        before: {
          availableKeys: beforeStats.availableKeys,
          cooldownKeys: beforeStats.totalKeys - beforeStats.availableKeys
        },
        after: {
          availableKeys: afterStats.availableKeys,
          cooldownKeys: afterStats.totalKeys - afterStats.availableKeys
        }
      }
    });

  } catch (error) {
    logger.error('Failed to reset API key cooldowns', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(500).json({
      success: false,
      error: 'Failed to reset cooldowns',
      message: 'クールダウンのリセットに失敗しました'
    });
  }
});

/**
 * GET /api/admin/health
 * 管理者向けヘルスチェック
 */
router.get('/health', async (req, res) => {
  try {
    const stats = apiKeyManager.getStats();
    const hasAvailableKeys = stats.availableKeys > 0;
    
    const healthStatus = {
      status: hasAvailableKeys ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      apiKeys: {
        total: stats.totalKeys,
        available: stats.availableKeys,
        onCooldown: stats.totalKeys - stats.availableKeys
      },
      performance: {
        totalRequests: stats.totalRequests,
        successRate: stats.totalRequests > 0 
          ? ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(1) + '%'
          : 'N/A',
        rateLimitHits: stats.rateLimitHits
      }
    };

    const statusCode = hasAvailableKeys ? 200 : 503;
    
    res.status(statusCode).json({
      success: hasAvailableKeys,
      data: healthStatus
    });

  } catch (error) {
    logger.error('Admin health check failed', { error });

    res.status(500).json({
      success: false,
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      }
    });
  }
});

export default router;