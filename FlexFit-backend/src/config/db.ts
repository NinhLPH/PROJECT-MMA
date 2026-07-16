import mongoose from 'mongoose';

export default async function connectDatabase(): Promise<void> {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI environment variable is required');
  }

  await mongoose.connect(mongoUri);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}
