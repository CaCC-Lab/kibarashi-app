import { Router } from 'express';
import suggestionsRouter from './suggestions';
import { enhancedSuggestionsRouter } from './enhancedSuggestions';
import ttsRouter from './tts';
import contextRouter from '../../routes/context';
import adminRouter from '../../routes/admin';

const router = Router();

// ヘルスチェックエンドポイント
router.get('/health', (_req, res) => {
  // 環境変数チェック
  const envCheck = {
    geminiKeysConfigured: [
      'GEMINI_API_KEY_1',
      'GEMINI_API_KEY_2', 
      'GEMINI_API_KEY_3'
    ].filter(key => !!process.env[key]).length,
    rotationEnabled: process.env.GEMINI_KEY_ROTATION_ENABLED === 'true',
    ttsEnabled: process.env.GCP_TTS_ENABLED === 'true'
  };

  const status = envCheck.geminiKeysConfigured > 0 ? 'ok' : 'warning';

  res.json({
    status,
    timestamp: new Date().toISOString(),
    service: 'kibarashi-backend',
    version: '1.1.0',
    environment: {
      ...envCheck,
      hasMinimumKeys: envCheck.geminiKeysConfigured >= 2
    }
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
      tts: 'Text-to-speech conversion',
      context: 'Contextual data integration',
      admin: 'Administrative endpoints'
    },
    endpoints: {
      suggestions: '/api/v1/suggestions',
      enhancedSuggestions: '/api/v1/enhanced-suggestions',
      tts: '/api/v1/tts',
      context: '/api/v1/context',
      admin: '/api/v1/admin',
      health: '/api/v1/health'
    },
  });
});

// 各機能のルーティング
router.use('/suggestions', suggestionsRouter);
router.use('/enhanced-suggestions', enhancedSuggestionsRouter);
router.use('/tts', ttsRouter);
router.use('/context', contextRouter);
router.use('/admin', adminRouter);

export default router;