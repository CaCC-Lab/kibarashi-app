import { Router } from 'express';
import { convertTextToSpeech } from '../controllers/ttsController.js';

const router = Router();

// POST /api/v1/tts
router.post('/', convertTextToSpeech);

export default router;