import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
// Fix for Node.js SRV lookup issues on some networks
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
}
catch (e) {
    console.warn('Warning: Could not set custom DNS servers. Default system DNS will be used.');
}
dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in the environment variables');
}
const dbConnect = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000, // 5 seconds timeout
        });
        console.log('MongoDB connected successfully');
        return true;
    }
    catch (error) {
        console.error('Core Message: MongoDB connection failed.');
        console.error('Details:', error);
        console.warn('Warning: Server will start without database connection. Some features may not work.');
        return false;
    }
};
export default dbConnect;
//# sourceMappingURL=mongodb.js.map