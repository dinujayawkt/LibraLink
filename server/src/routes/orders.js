import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import Order from '../models/Order.js';

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, author, isbn, notes } = req.body;
    const order = await Order.create({ requestedBy: req.user.id, title, author, isbn, notes });
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const filter = req.user.role === 'member' ? { requestedBy: req.user.id } : {};
    const items = await Order.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/status', requireAuth, requireRole('assistant', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

export default router;


