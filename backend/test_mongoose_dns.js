import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

// Set DNS to Google's
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
    console.log('Testing Mongoose connection with Google DNS...');
    try {
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
        });
        console.log('SUCCESS: MongoDB connected successfully with Google DNS!');
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('FAILURE: MongoDB connection failed even with Google DNS.');
        console.error('Error Details:', error);
        process.exit(1);
    }
}

testConnection();
