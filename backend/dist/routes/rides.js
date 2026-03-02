import express from 'express';
import Ride from '../models/Ride.js';
import { calculateSurgePrice } from '../lib/genkit.js';
const router = express.Router();
router.post('/fare', async (req, res) => {
    try {
        const { pickup, destination } = req.body;
        const distanceKm = Math.floor(Math.random() * 25) + 5;
        const baseRatePerKm = 15;
        const baseFare = distanceKm * baseRatePerKm;
        const trafficLevels = ['low', 'medium', 'high', 'extreme'];
        const traffic = trafficLevels[Math.floor(Math.random() * trafficLevels.length)];
        const surgeResult = await calculateSurgePrice({
            baseFare,
            trafficIntensity: traffic,
            demandLevel: 'high',
            timeOfDay: new Date().toLocaleTimeString(),
        });
        const vehicleTypes = [
            { id: 'bike', name: 'Bike', multiplier: 0.6, icon: 'Bike' },
            { id: 'mini', name: 'Mini', multiplier: 1.0, icon: 'Car' },
            { id: 'sedan', name: 'Sedan', multiplier: 1.4, icon: 'CarFront' },
            { id: 'suv', name: 'SUV', multiplier: 2.0, icon: 'Users' }
        ];
        const estimatedFares = vehicleTypes.map(v => {
            const vehicleBaseFare = baseFare * v.multiplier;
            return {
                id: v.id,
                name: v.name,
                baseFare: vehicleBaseFare,
                surgeFare: Math.round(surgeResult.surgeFare * v.multiplier),
                multiplier: surgeResult.multiplier,
                time: `${Math.floor(Math.random() * 5) + 2} min`
            };
        });
        return res.json({
            success: true,
            distance: `${distanceKm} km`,
            fares: estimatedFares,
            reason: surgeResult.reason,
            currency: "INR"
        });
    }
    catch (error) {
        console.error(`[RIDE ERROR] Failed to create ride request: ${error.message}`);
        return res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/request', async (req, res) => {
    try {
        const { userId, pickup, destination, fare, rideType, scheduledTime } = req.body;
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const pickupCoords = req.body.pickupCoords;
        const destinationCoords = req.body.destinationCoords;
        const ride = await Ride.create({
            userId,
            pickupLocation: { address: pickup, coordinates: pickupCoords },
            destinationLocation: { address: destination, coordinates: destinationCoords },
            fare,
            otp,
            rideType: rideType || 'instant',
            scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
            status: 'searching',
        });
        // REMOVED AUTO-ASSIGNMENT LOGIC
        // Rides will now stay in 'searching' until a driver accepts via the /respond-ride endpoint
        return res.json({
            success: true,
            rideId: ride._id,
            status: ride.status
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});
export default router;
//# sourceMappingURL=rides.js.map