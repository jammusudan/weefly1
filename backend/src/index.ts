import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import dbConnect from './lib/mongodb.js';
import authRoutes from './routes/auth.js';
import rideRoutes from './routes/rides.js';
import driverRoutes from './routes/drivers.js';
import adminRoutes from './routes/admin.js';
import adminAuthRoutes from './routes/adminAuth.js';

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
app.use('/api/admin', adminRoutes);
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
   ROOT CHECK (ADDED)
======================= */
app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    message: 'Weefly Backend API is running'
  });
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