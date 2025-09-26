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

// When running behind Vercel/Proxies, trust the first proxy hop so req.secure and protocol are correct
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// CORS with dev-friendly origin matching
const defaultOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
// Support a comma-separated list via CORS_ORIGINS and a single CLIENT_ORIGIN for convenience
const fromEnvList = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const configuredOrigin = process.env.CLIENT_ORIGIN ? [process.env.CLIENT_ORIGIN] : [];
const allowedOrigins = [...new Set([...configuredOrigin, ...fromEnvList, ...defaultOrigins])];

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow non-browser or same-origin
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Also allow any localhost:* during development
      if (/^http:\/\/localhost:\d+$/i.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/i.test(origin)) {
        return callback(null, true);
      }
      // In production, allow Vercel preview/prod frontend domains by default
      if (process.env.NODE_ENV === 'production' && /^https:\/\/.*\.vercel\.app$/i.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '5mb' }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrow', borrowRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api', recommendationRoutes);

console.log('📋 Routes registered:');
console.log('  - /api/auth');
console.log('  - /api/books');
console.log('  - /api/borrow');
console.log('  - /api/orders');
console.log('  - /api/admin');
console.log('  - /api/reviews');
console.log('  - /api/communities');
console.log('  - /api/recommendations');

app.get('/api/health', (_req, res) => res.json({ ok: true }));

const port = process.env.PORT || 4000;
console.log('🔄 Attempting to connect to MongoDB...');
connectToDatabase()
  .then(() => {
    console.log('✅ Successfully connected to MongoDB!');
    app.listen(port, () => {
      console.log(`🚀 Server listening on http://localhost:${port}`);
      console.log(`📚 Library API ready!`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    console.error('💡 Make sure your MongoDB Atlas connection string is correct in .env file');
    process.exit(1);
  });


