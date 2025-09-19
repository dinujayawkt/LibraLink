import mongoose from 'mongoose';

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/library_app';
  console.log('🔗 Connecting to:', uri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in log
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { autoIndex: true });
  console.log('📊 Database connection established');
}


