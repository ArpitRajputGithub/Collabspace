const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://collabspace:collab123@localhost:27017/collabspace_messages?authSource=admin';

let isConnected = false;

const connectMongoDB = async () => {
  if (isConnected) {
    console.log('MongoDB already connected');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('✅ MongoDB connected successfully');
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      isConnected = false;
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    // Don't crash the app - messaging will be unavailable but app still works
  }
};

const getMongoConnection = () => mongoose.connection;

module.exports = { connectMongoDB, getMongoConnection };
