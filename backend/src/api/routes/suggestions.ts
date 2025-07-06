import { Router } from 'express';
import { getSuggestions } from '../controllers/suggestionController';
import { rateLimiter } from '../middleware/rateLimit';

const router = Router();

// GET /api/v1/suggestions?situation={place}&duration={minutes}
router.get('/', rateLimiter.suggestions, getSuggestions);

export default router;