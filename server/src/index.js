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

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
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


