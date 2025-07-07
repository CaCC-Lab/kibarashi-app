import express from 'express';
import { logger } from '../utils/logger';
import { contextualPromptEnhancer } from '../services/context/contextualPromptEnhancer';

const router = express.Router();

/**
 * GET /api/context/current
 * 現在のコンテキストデータを取得
 */
router.get('/current', async (req, res) => {
  try {
    logger.info('Context data requested');

    const context = await contextualPromptEnhancer.getCurrentContext();
    
    logger.info('Context data sent successfully', {
      hasWeatherData: !!context.weather,
      season: context.seasonal.season,
      month: context.seasonal.month
    });

    res.json({
      success: true,
      data: context
    });

  } catch (error) {
    logger.error('Failed to get context data', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve context data',
      message: 'サーバー内部エラーが発生しました'
    });
  }
});

/**
 * GET /api/context/weather
 * 天候データのみを取得
 */
router.get('/weather', async (req, res) => {
  try {
    const location = req.query.location as string || 'Tokyo';
    
    logger.info('Weather data requested', { location });

    const context = await contextualPromptEnhancer.getCurrentContext();
    
    if (!context.weather) {
      return res.status(404).json({
        success: false,
        error: 'Weather data not available',
        message: '天候データが取得できませんでした'
      });
    }

    res.json({
      success: true,
      data: context.weather
    });

  } catch (error) {
    logger.error('Failed to get weather data', { error });

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve weather data',
      message: '天候データの取得に失敗しました'
    });
  }
});

/**
 * GET /api/context/seasonal
 * 季節データのみを取得
 */
router.get('/seasonal', async (req, res) => {
  try {
    logger.info('Seasonal data requested');

    const context = await contextualPromptEnhancer.getCurrentContext();
    
    res.json({
      success: true,
      data: context.seasonal
    });

  } catch (error) {
    logger.error('Failed to get seasonal data', { error });

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve seasonal data',
      message: '季節データの取得に失敗しました'
    });
  }
});

/**
 * POST /api/context/validate
 * コンテキストデータの有効性を検証
 */
router.post('/validate', async (req, res) => {
  try {
    const { context } = req.body;

    if (!context) {
      return res.status(400).json({
        success: false,
        error: 'Context data is required',
        message: 'コンテキストデータが必要です'
      });
    }

    const isValid = contextualPromptEnhancer.validateContext(context);
    
    res.json({
      success: true,
      data: {
        isValid,
        context
      }
    });

  } catch (error) {
    logger.error('Failed to validate context data', { error });

    res.status(500).json({
      success: false,
      error: 'Failed to validate context data',
      message: 'コンテキストデータの検証に失敗しました'
    });
  }
});

export default router;