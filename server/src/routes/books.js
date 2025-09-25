import express from 'express';
import Book from '../models/Book.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { q, category, author, sort = 'createdAt', order = 'desc', page = 1, limit = 20 } = req.query;
    const filter = {};
    if (q) filter.$text = { $search: q };
    if (category) filter.category = category;
    if (author) filter.author = author;
    const skip = (Number(page) - 1) * Number(limit);
    const items = await Book.find(filter).sort({ [sort]: order === 'desc' ? -1 : 1 }).skip(skip).limit(Number(limit));
    const total = await Book.countDocuments(filter);
    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/popular', async (_req, res) => {
  try {
    const items = await Book.find().sort({ borrowedCount: -1 }).limit(10);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Stats: totals across all books (copies-based)
router.get('/stats', async (_req, res) => {
  try {
    const [totalBooks, aggregates] = await Promise.all([
      Book.countDocuments({}),
      Book.aggregate([
        {
          $project: {
            available: {
              $max: [
                {
                  $subtract: [
                    { $ifNull: ['$totalCopies', 0] },
                    { $ifNull: ['$borrowedCount', 0] }
                  ]
                },
                0
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            availableBooks: { $sum: '$available' }
          }
        }
      ])
    ]);

    const totals = aggregates[0] || { availableBooks: 0 };
    const availableBooks = totals.availableBooks || 0;

    res.json({ totalBooks, availableBooks });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', requireAuth, requireRole('assistant', 'admin'), async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

router.put('/:id', requireAuth, requireRole('assistant', 'admin'), async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(book);
  } catch (err) {
    res.status(404).json({ message: 'Not found' });
  }
});

router.delete('/:id', requireAuth, requireRole('assistant', 'admin'), async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(404).json({ message: 'Not found' });
  }
});

export default router;


