import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
// Extract user and pass from SRV URI
const match = MONGODB_URI.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@/);
if (!match) {
    console.error('Could not parse MONGODB_URI');
    process.exit(1);
}
const user = match[1];
const pass = match[2];

// Try to connect to one shard directly to get RS name
const shard = 'weeflycab-shard-00-00.3simuc.mongodb.net:27017';
const directUri = `mongodb://${user}:${pass}@${shard}/admin?ssl=true&authSource=admin`;

async function getRS() {
    try {
        console.log('Connecting to shard directly:', shard);
        const conn = await mongoose.connect(directUri, { serverSelectionTimeoutMS: 5000 });
        const admin = conn.connection.db.admin();
        const status = await admin.replicaSetGetStatus();
        console.log('ReplicaSet Name:', status.set);
        process.exit(0);
    } catch (err) {
        console.error('Failed to connect to shard directly:', err.message);
        process.exit(1);
    }
}

getRS();
