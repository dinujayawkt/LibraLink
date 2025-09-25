import { app, connectPromise } from '../src/app.js';

// Vercel serverless function handler wrapping the Express app
export default async function handler(req, res) {
  try {
    await connectPromise; // ensure DB is connected before handling requests
  } catch (err) {
    console.error('DB connection error in serverless handler:', err);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
  return app(req, res);
}
