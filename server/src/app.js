import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectToDatabase } from './utils/db.js';
import authRoutes from './routes/auth.js';
import bookRoutes from './routes/books.js';
import borrowRoutes from './routes/borrow.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import reviewRoutes from './routes/reviews.js';
import communityRoutes from './routes/communities.js';
import recommendationRoutes from './routes/recommendations.js';

const app = express();

// CORS with prod + dev origins
const defaultOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const envOrigins = (process.env.CLIENT_ORIGINS || process.env.CLIENT_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
const allowedOrigins = new Set([...defaultOrigins, ...envOrigins]);

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow same-origin or non-browser
      if (allowedOrigins.has(origin)) return callback(null, true);
      // Allow any localhost during dev
      if (/^https?:\/\/(localhost|127\.0\.0\.1):\d+$/i.test(origin)) return callback(null, true);
      // Allow any vercel.app subdomain (optional, tighten if you want exact origins only)
      if (/^https?:\/\/([^.]+)\.vercel\.app$/i.test(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '5mb' }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrow', borrowRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api', recommendationRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Kick off DB connection for both local and serverless
const connectPromise = connectToDatabase()
  .then(() => {
    console.log('✅ Successfully connected to MongoDB!');
    return true;
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    console.error('💡 Make sure your MongoDB Atlas connection string is correct in .env file');
    throw err;
  });

export { app, connectPromise };
