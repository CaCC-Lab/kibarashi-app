import { Router } from 'express';
import { convertTextToSpeech } from '../controllers/ttsController';
import { rateLimiter } from '../middleware/rateLimit';

const router = Router();

// POST /api/v1/tts
router.post('/', rateLimiter.tts, convertTextToSpeech);

export default router;