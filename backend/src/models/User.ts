import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, sparse: true },
    password: { type: String, required: true },
    name: { type: String },
    role: { type: String, enum: ['user', 'driver', 'admin'], default: 'user' },
    aadharNumber: { type: String },
    panNumber: { type: String },
    vehicleNumber: { type: String },
    vehicleColor: { type: String },
    dlImageUrl: { type: String }, // Driving License (base64 string for simplicity)
    rcImageUrl: { type: String }, // Registration Certificate (base64 string)
    kycStatus: { type: String, enum: ['none', 'pending', 'verified', 'rejected'], default: 'none' },
    isSuspended: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
