import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import dbConnect from './lib/mongodb.js';

import authRoutes from './routes/auth.js';
import rideRoutes from './routes/rides.js';
import driverRoutes from './routes/drivers.js';
import adminRoutes from './routes/admin.js';
import adminAuthRoutes from './routes/adminAuth.js'; // 🔴 IMPORTANT

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000; // Render uses this

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

// Admin protected APIs (dashboard, stats, config, etc.)
app.use('/api/admin', adminRoutes);

// 🔴 Admin login route (THIS WAS MISSING EARLIER)
app.use('/api/admin-auth', adminAuthRoutes);

/* =======================
   HEALTH CHECKS
======================= */
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Weefly Backend is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is working' });
});

/* =======================
   GLOBAL ERROR HANDLER
======================= */
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

/* =======================
   START SERVER
======================= */
const startServer = async () => {
  try {
    await dbConnect();

    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`[SERVER] Weefly Backend LIVE on port ${PORT}`);
      console.log(`[SERVER] Health: /health`);
    });
  } catch (error) {
    console.error('[FATAL] Server failed to start:', error);
    process.exit(1);
  }
};

startServer();