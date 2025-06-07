import { Router } from 'express';
import { getSuggestions } from '../controllers/suggestionController.js';

const router = Router();

// GET /api/v1/suggestions?situation={place}&duration={minutes}
router.get('/', getSuggestions);

export default router;