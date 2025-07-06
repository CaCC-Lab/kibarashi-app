import { Router } from 'express';
import suggestionsRouter from './suggestions';
import { enhancedSuggestionsRouter } from './enhancedSuggestions';
import ttsRouter from './tts';

const router = Router();

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
    },
  });
});

// 各機能のルーティング
router.use('/suggestions', suggestionsRouter);
router.use('/enhanced-suggestions', enhancedSuggestionsRouter);
router.use('/tts', ttsRouter);

export default router;