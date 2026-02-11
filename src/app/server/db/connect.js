import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

// Singleton pattern to reuse connection (critical for Next.js/serverless)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Prevent multiple concurrent connection attempts
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      // Connection pooling - conservative for free tier
      maxPoolSize: 5,           // Max connections in pool
      minPoolSize: 2,           // Min connections to maintain
      maxIdleTimeMS: 45000,     // Close idle connections after 45s
      
      // Reconnection options (increased for free tier reliability)
      retryWrites: true,
      retryReads: true,
      connectTimeoutMS: 20000,
      socketTimeoutMS: 60000,
      serverSelectionTimeoutMS: 30000,
      
      // Performance
      compressors: ['snappy'],  // Reduce bandwidth
    }).then(mongoose => {
      console.log('✅ MongoDB connected (pooled)');
      return mongoose;
    }).catch(error => {
      console.error('❌ Database connection failed', error);
      cached.promise = null; // Reset promise on failure
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
};
