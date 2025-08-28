import mongoose from 'mongoose';
import env from './env';

export async function connectDB() {
  try {
    await mongoose.connect(env.MONGO_URI);
    mongoose.set('strictQuery', true);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
}

export default connectDB;
