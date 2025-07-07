import { Router } from 'express';
import suggestionsRouter from './suggestions';
import { enhancedSuggestionsRouter } from './enhancedSuggestions';
import ttsRouter from './tts';
import contextRouter from '../../routes/context';

const router = Router();

// ヘルスチェックエンドポイント
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'kibarashi-backend',
    version: '1.1.0',
    ttsEnabled: process.env.GCP_TTS_ENABLED === 'true'
  });
});

// ルートエンドポイント
router.get('/', (_req, res) => {
  res.json({
    message: 'Kibarashi API v1',
    version: '1.1.0',
    features: {
      suggestions: 'Basic mood-lifting suggestions',
      enhancedSuggestions: 'Advanced suggestions with voice guide',
      tts: 'Text-to-speech conversion'
    },
    endpoints: {
      suggestions: '/api/v1/suggestions',
      enhancedSuggestions: '/api/v1/enhanced-suggestions',
      tts: '/api/v1/tts',
      context: '/api/v1/context',
      health: '/api/v1/health'
    },
  });
});

// 各機能のルーティング
router.use('/suggestions', suggestionsRouter);
router.use('/enhanced-suggestions', enhancedSuggestionsRouter);
router.use('/tts', ttsRouter);
router.use('/context', contextRouter);

export default router;