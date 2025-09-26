import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createBookRecommendations } from '../controllers/recommendationsController.js';

const router = express.Router();

// Generate book recommendations based on user preferences
router.post('/books/recommendations', requireAuth, createBookRecommendations);

export default router;
