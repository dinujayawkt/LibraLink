import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { test, getBookReviews, getMyReviews, createReview, updateReview, deleteReview, markHelpful, getBookStats } from '../controllers/reviewsController.js';

const router = express.Router();

// Test route to verify reviews endpoint is working
router.get('/test', test);

// Get reviews for a specific book
router.get('/book/:bookId', getBookReviews);

// Get user's reviews
router.get('/my', requireAuth, getMyReviews);

// Create a new review
router.post('/', requireAuth, createReview);

// Update a review
router.put('/:reviewId', requireAuth, updateReview);

// Delete a review
router.delete('/:reviewId', requireAuth, deleteReview);

// Mark review as helpful
router.post('/:reviewId/helpful', requireAuth, markHelpful);

// Get book rating statistics
router.get('/book/:bookId/stats', getBookStats);

export default router;
