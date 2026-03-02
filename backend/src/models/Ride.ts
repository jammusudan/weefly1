import mongoose from 'mongoose';

const RideSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pickupLocation: {
        address: String,
        coordinates: [Number], // [lat, lng]
    },
    destinationLocation: {
        address: String,
        coordinates: [Number],
    },
    fare: { type: Number, required: true },
    otp: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'searching', 'assigned', 'ongoing', 'completed', 'cancelled'],
        default: 'pending'
    },
    driver: {
        name: String,
        phoneNumber: String,
        vehicleNumber: String,
        rating: Number,
        coordinates: [Number],
    },
    rideType: {
        type: String,
        enum: ['instant', 'schedule'],
        default: 'instant'
    },
    scheduledTime: { type: Date },
    cancellationReason: { type: String },
    refundStatus: {
        type: String,
        enum: ['none', 'pending', 'processed', 'failed'],
        default: 'none'
    },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Ride || mongoose.model('Ride', RideSchema);
