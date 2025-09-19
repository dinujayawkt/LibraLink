import express from 'express';
import multer from 'multer';
import dayjs from 'dayjs';
import { requireAuth } from '../middleware/auth.js';
import Book from '../models/Book.js';
import BorrowTransaction from '../models/BorrowTransaction.js';

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/borrow/:bookId', requireAuth, upload.single('photo'), async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.totalCopies - book.borrowedCount <= 0) return res.status(400).json({ message: 'No copies available' });

    const dueAt = dayjs().add(14, 'day').toDate();
    await BorrowTransaction.create({
      user: req.user.id,
      book: book._id,
      dueAt,
      borrowPhotoUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
    });
    book.borrowedCount += 1;
    await book.save();
    res.status(201).json({ ok: true, dueAt });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/return/:transactionId', requireAuth, upload.single('photo'), async (req, res) => {
  try {
    const tx = await BorrowTransaction.findById(req.params.transactionId).populate('book');
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });
    if (String(tx.user) !== req.user.id && req.user.role === 'member') return res.status(403).json({ message: 'Forbidden' });
    if (tx.status === 'returned') return res.status(400).json({ message: 'Already returned' });

    tx.status = 'returned';
    tx.returnedAt = new Date();
    if (tx.dueAt && tx.returnedAt > tx.dueAt) tx.status = 'overdue';
    if (req.file) tx.returnPhotoUrl = `/uploads/${req.file.filename}`;
    await tx.save();

    const book = tx.book;
    book.borrowedCount = Math.max(0, book.borrowedCount - 1);
    await book.save();

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/extend/:transactionId', requireAuth, async (req, res) => {
  try {
    const { days = 7, reason } = req.body;
    const tx = await BorrowTransaction.findById(req.params.transactionId);
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });
    if (String(tx.user) !== req.user.id && req.user.role === 'member') return res.status(403).json({ message: 'Forbidden' });
    if (tx.status !== 'borrowed') return res.status(400).json({ message: 'Not active' });

    const newDueAt = dayjs(tx.dueAt).add(Number(days), 'day').toDate();
    tx.dueAt = newDueAt;
    tx.extensions.push({ newDueAt, reason });
    await tx.save();
    res.json({ ok: true, newDueAt });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/my', requireAuth, async (req, res) => {
  try {
    const items = await BorrowTransaction.find({ user: req.user.id }).populate('book').sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;


