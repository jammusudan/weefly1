import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
// Inject database name if missing
const dbName = 'weeflycab';
const finalUri = MONGODB_URI.includes('.net/?')
    ? MONGODB_URI.replace('.net/?', `.net/${dbName}?`)
    : MONGODB_URI.includes('.net/') && !MONGODB_URI.split('.net/')[1].startsWith('?')
        ? MONGODB_URI
        : MONGODB_URI + '/' + dbName;

async function testConnection() {
    console.log(`Testing connection to: ${finalUri.replace(/:[^@]+@/, ':****@')}`);
    try {
        await mongoose.connect(finalUri, { serverSelectionTimeoutMS: 10000 });
        console.log('SUCCESS: MongoDB connected successfully!');
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('FAILURE:', error.message);
        process.exit(1);
    }
}

testConnection();
