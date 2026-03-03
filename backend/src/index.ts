import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import dbConnect from './lib/mongodb';
import authRoutes from './routes/auth';
import rideRoutes from './routes/rides';
import driverRoutes from './routes/drivers';
import adminRoutes from './routes/admin';
import adminAuthRoutes from './routes/adminAuth';

dotenv.config();

const app = express();
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

// Admin dashboard & management APIs
app.use('/api/admin', adminRoutes);

// 🔴 Admin login (MOST IMPORTANT)
app.use('/api/admin-auth', adminAuthRoutes);

/* =======================
   HEALTH CHECKS
======================= */
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Weefly Backend is running' });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'API is working' });
});

/* =======================
   GLOBAL ERROR HANDLER
======================= */
app.use(
  (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[ERROR]', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error',
    });
  }
);

/* =======================
   START SERVER
======================= */
const startServer = async () => {
  try {
    await dbConnect();

    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`[SERVER] Weefly Backend LIVE on port ${PORT}`);
      console.log(`[SERVER] Health check → /health`);
    });
  } catch (error) {
    console.error('[FATAL] Server failed to start:', error);
    process.exit(1);
  }
};

startServer();