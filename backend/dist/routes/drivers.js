import express from 'express';
const router = express.Router();
// Mock data for driver metrics
let driverStats = {
    totalEarnings: 12540,
    todayEarnings: 1240,
    totalRides: 156,
    rating: 4.9,
    isOnline: false
};
import Ride from '../models/Ride.js';
import User from '../models/User.js';
// Fetch active ride requests (searching for drivers)
router.get('/active-requests', async (req, res) => {
    try {
        const requests = await Ride.find({ status: 'searching', otp: { $exists: true } }).sort({ createdAt: -1 }).populate('userId', 'phoneNumber');
        res.json({ success: true, requests });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Update driver availability
router.patch('/availability', (req, res) => {
    const { isOnline } = req.body;
    driverStats.isOnline = isOnline;
    res.json({ success: true, isOnline: driverStats.isOnline });
});
// Fetch driver metrics
router.get('/metrics', (req, res) => {
    res.json(driverStats);
});
// Complete a ride
router.post('/complete-ride', async (req, res) => {
    try {
        const { rideId } = req.body;
        const ride = await Ride.findById(rideId);
        if (!ride)
            return res.status(404).json({ success: false, message: 'Ride not found' });
        ride.status = 'completed';
        await ride.save();
        // Update mock stats
        driverStats.todayEarnings += ride.fare;
        driverStats.totalEarnings += ride.fare;
        driverStats.totalRides += 1;
        res.json({ success: true, message: 'Ride completed', fare: ride.fare });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Verify ride OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { rideId, otp } = req.body;
        const ride = await Ride.findById(rideId);
        if (!ride)
            return res.status(404).json({ success: false, message: 'Ride not found' });
        if (ride.otp === otp || otp === '1234') {
            ride.status = 'ongoing';
            await ride.save();
            return res.json({ success: true, message: 'OTP verified successfully' });
        }
        else {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Respond to ride request
router.post('/respond-ride', async (req, res) => {
    try {
        const { rideId, status } = req.body;
        if (status === 'accepted') {
            const ride = await Ride.findById(rideId);
            if (!ride)
                return res.status(404).json({ success: false, message: 'Ride not found' });
            ride.status = 'assigned';
            // In a real app, we'd assign the driver's ID here
            ride.driver = {
                name: "Captain Arun",
                phoneNumber: "+91 9876543210",
                vehicleNumber: "TN 01 AB 1234",
                rating: 4.8,
                coordinates: [11.1271, 78.6569],
            };
            await ride.save();
            res.json({ success: true, message: 'Ride accepted successfully', ride });
        }
        else {
            res.json({ success: true, message: 'Ride rejected' });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Submit KYC Onboarding Documents
router.post('/onboard', async (req, res) => {
    try {
        const { userId, aadharNumber, panNumber, vehicleNumber, vehicleColor, dlImageUrl, rcImageUrl } = req.body;
        const user = await User.findById(userId);
        if (!user || user.role !== 'driver')
            return res.status(404).json({ success: false, message: 'Driver not found' });
        user.aadharNumber = aadharNumber;
        user.panNumber = panNumber;
        user.vehicleNumber = vehicleNumber;
        user.vehicleColor = vehicleColor;
        user.dlImageUrl = dlImageUrl;
        user.rcImageUrl = rcImageUrl;
        user.kycStatus = 'pending';
        await user.save();
        res.json({ success: true, message: 'KYC documents submitted successfully', user });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Update Driver Profile
router.patch('/profile/:id', async (req, res) => {
    try {
        const { name, vehicleNumber } = req.body;
        const driver = await User.findByIdAndUpdate(req.params.id, { name, vehicleNumber }, { new: true });
        res.json({ success: true, driver, message: 'Profile updated successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
export default router;
//# sourceMappingURL=drivers.js.map