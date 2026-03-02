import express from 'express';
import Ride from '../models/Ride.js';
import User from '../models/User.js';
import Config from '../models/Config.js';
import Report from '../models/Report.js';

const router = express.Router();

// Get Dashbord Stats
router.get('/stats', async (req, res) => {
    try {
        const totalRides = await Ride.countDocuments();
        const completedRides = await Ride.countDocuments({ status: 'completed' });
        const revenue = await Ride.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: "$fare" } } }
        ]);
        const activeDrivers = await User.countDocuments({ role: 'driver' });
        const openReports = await Report.countDocuments({ status: 'open' });

        const driverPerformance = await Ride.aggregate([
            { $match: { status: 'completed', 'driver.rating': { $exists: true } } },
            { $group: { _id: null, avgRating: { $avg: "$driver.rating" } } }
        ]);

        const cityStats = await Ride.aggregate([
            { $match: { 'pickupLocation.address': { $exists: true } } },
            { $group: { _id: { $arrayElemAt: [{ $split: ["$pickupLocation.address", ","] }, 1] }, count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        res.json({
            success: true,
            stats: {
                totalRides,
                completedRides,
                totalRevenue: revenue[0]?.total || 0,
                activeDrivers,
                openReports,
                avgDriverRating: driverPerformance[0]?.avgRating || 4.5,
                cityStats: cityStats.map(c => ({ city: (c._id || 'Unknown').trim(), count: c.count }))
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Manage Drivers
router.get('/drivers', async (req, res) => {
    try {
        const drivers = await User.find({ role: 'driver' });
        res.json({ success: true, drivers });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update Driver KYC Status
router.post('/kyc/:id', async (req, res) => {
    try {
        const { status } = req.body; // 'verified' or 'rejected'
        const driver = await User.findByIdAndUpdate(
            req.params.id,
            { kycStatus: status },
            { new: true }
        );
        res.json({ success: true, driver });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update Driver Suspension Status
router.patch('/drivers/:id/status', async (req, res) => {
    try {
        const { isSuspended } = req.body;
        const driver = await User.findByIdAndUpdate(
            req.params.id,
            { isSuspended },
            { new: true }
        );
        res.json({ success: true, driver });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Pricing Configuration
router.get('/config', async (req, res) => {
    try {
        const config = await Config.find();
        res.json({ success: true, config });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/config', async (req, res) => {
    try {
        const { key, value, description } = req.body;
        const config = await Config.findOneAndUpdate(
            { key },
            { value, description, updatedAt: new Date() },
            { upsert: true, new: true }
        );
        res.json({ success: true, config });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Trip Monitoring
router.get('/trips', async (req, res) => {
    try {
        const trips = await Ride.find().sort({ createdAt: -1 }).limit(50).populate('userId', 'phoneNumber name');
        res.json({ success: true, trips });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Cancel or Refund Trip
router.patch('/trips/:id/refund', async (req, res) => {
    try {
        const { action, reason } = req.body;
        const updateData: any = {};

        if (action === 'cancel') {
            updateData.status = 'cancelled';
            updateData.cancellationReason = reason || 'Admin cancelled';
        } else if (action === 'refund') {
            updateData.refundStatus = 'processed';
        }

        const trip = await Ride.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json({ success: true, trip });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Reports & Disputes
router.get('/reports', async (req, res) => {
    try {
        const reports = await Report.find().sort({ createdAt: -1 }).populate('userId', 'phoneNumber name').populate('rideId');
        res.json({ success: true, reports });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.patch('/reports/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const report = await Report.findByIdAndUpdate(
            req.params.id,
            { status, resolvedAt: status === 'resolved' ? new Date() : undefined },
            { new: true }
        );
        res.json({ success: true, report });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
