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
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ride', rideRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'API Proxy is working' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Weefly Backend is running' });
});

// Global Error Handler for JSON
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[ERROR] Unhandled:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Connect to Database and Start Server
const startServer = async () => {
    try {
        await dbConnect();
        const server = app.listen(Number(PORT), '0.0.0.0', () => {
            console.log(`[SERVER] Weefly Backend LIVE on http://localhost:${PORT}`);
            console.log(`[SERVER] Health check: http://localhost:${PORT}/health`);
        });

        server.on('error', (err: any) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`[ERROR] Port ${PORT} is already in use. Please kill the process using it or choose another port.`);
            } else {
                console.error('[ERROR] Server failure:', err);
            }
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
};

startServer();
