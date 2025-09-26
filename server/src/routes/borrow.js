import express from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { borrowBook, returnBook, extendBorrow, myBorrows } from '../controllers/borrowController.js';

const router = express.Router();

// On Vercel (serverless) the filesystem is read-only at runtime. Avoid disk writes there.
// Fall back to disk storage in local/dev environments.
const useMemoryStorage = !!process.env.VERCEL;
const storage = useMemoryStorage ? multer.memoryStorage() : undefined;
const upload = storage ? multer({ storage }) : multer({ dest: 'uploads/' });

router.post('/borrow/:bookId', requireAuth, upload.single('photo'), borrowBook);

router.post('/return/:transactionId', requireAuth, upload.single('photo'), returnBook);

router.post('/extend/:transactionId', requireAuth, extendBorrow);

router.get('/my', requireAuth, myBorrows);

export default router;
