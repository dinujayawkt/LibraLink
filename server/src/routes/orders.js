import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { createOrder, listOrders, updateOrderStatus } from '../controllers/ordersController.js';

const router = express.Router();

router.post('/', requireAuth, createOrder);

router.get('/', requireAuth, listOrders);

router.patch('/:id/status', requireAuth, requireRole('assistant', 'admin'), updateOrderStatus);

export default router;
