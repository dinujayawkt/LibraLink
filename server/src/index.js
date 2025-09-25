import 'dotenv/config';
import { app, connectPromise } from './app.js';

const port = process.env.PORT || 4000;
console.log('🔄 Attempting to connect to MongoDB...');
connectPromise
  .then(() => {
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


