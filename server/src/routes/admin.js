import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import User from '../models/User.js';
import Book from '../models/Book.js';
import BorrowTransaction from '../models/BorrowTransaction.js';
import Order from '../models/Order.js';

const router = express.Router();

// Get all users (admin only)
router.get('/users', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/users/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Block/Unblock user (admin only)
router.patch('/users/:id/block', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { blocked } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { blocked }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all borrows (admin/assistant)
router.get('/borrows', requireAuth, requireRole('admin', 'assistant'), async (req, res) => {
  try {
    const borrows = await BorrowTransaction.find()
      .populate('user', 'name email')
      .populate('book', 'title author')
      .sort({ createdAt: -1 });
    res.json(borrows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// (Reverted) No extension decision endpoint

export default router;
