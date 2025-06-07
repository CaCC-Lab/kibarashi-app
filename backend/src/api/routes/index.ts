import { Router } from 'express';
import suggestionsRouter from './suggestions.js';
import ttsRouter from './tts.js';

const router = Router();

// ルートエンドポイント
router.get('/', (_req, res) => {
  res.json({
    message: 'Kibarashi API v1',
    endpoints: {
      suggestions: '/api/v1/suggestions',
      tts: '/api/v1/tts',
    },
  });
});

// 各機能のルーティング
router.use('/suggestions', suggestionsRouter);
router.use('/tts', ttsRouter);

export default router;