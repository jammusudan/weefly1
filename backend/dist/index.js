import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import dbConnect from './lib/mongodb.js';
import authRoutes from './routes/auth.js';
import rideRoutes from './routes/rides.js';
import driverRoutes from './routes/drivers.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();

/**
 * Render will provide PORT automatically
 * Local run na 10000 use aagum
 */
const PORT = process.env.PORT || 10000;

/* =======================
   MIDDLEWARE
======================= */
app.use(cors());
app.use(express.json());

/* =======================
   ROUTES
======================= */
app.use('/api/auth', authRoutes);
app.use('/api/ride', rideRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/admin', adminRoutes);

/* =======================
   HEALTH CHECK (MANDATORY)
======================= */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Weefly Backend is running'
  });
});

/* =======================
   START SERVER
======================= */
const startServer = async () => {
  try {
    await dbConnect();
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();