import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { listBooks, popularBooks, booksStats, createBook, updateBook, deleteBook } from '../controllers/booksController.js';

const router = express.Router();

router.get('/', listBooks);

router.get('/popular', popularBooks);

// Stats: totals across all books (copies-based)
router.get('/stats', booksStats);

router.post('/', requireAuth, requireRole('assistant', 'admin'), createBook);

router.put('/:id', requireAuth, requireRole('assistant', 'admin'), updateBook);

router.delete('/:id', requireAuth, requireRole('assistant', 'admin'), deleteBook);

export default router;
