import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { getAllUsers, deleteUser, blockUser, getAllBorrows } from '../controllers/adminController.js';

const router = express.Router();

// Get all users (admin only)
router.get('/users', requireAuth, requireRole('admin'), getAllUsers);

// Delete user (admin only)
router.delete('/users/:id', requireAuth, requireRole('admin'), deleteUser);

// Block/Unblock user (admin only)
router.patch('/users/:id/block', requireAuth, requireRole('admin'), blockUser);

// Get all borrows (admin/assistant)
router.get('/borrows', requireAuth, requireRole('admin', 'assistant'), getAllBorrows);

// (Reverted) No extension decision endpoint

export default router;
