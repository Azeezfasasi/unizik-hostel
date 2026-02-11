import mongoose from 'mongoose';

let isConnected = false;

export const dbConnect = async () => {
  if (isConnected) {
    return;
  }

  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = connection.connections[0].readyState === 1;
    console.log('MongoDB connected successfully');
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};
