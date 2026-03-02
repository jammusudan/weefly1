import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride' },
    type: {
        type: String,
        enum: ['billing', 'safety', 'behavior', 'technical', 'other'],
        required: true
    },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: {
        type: String,
        enum: ['open', 'in-progress', 'resolved', 'closed'],
        default: 'open'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    createdAt: { type: Date, default: Date.now },
    resolvedAt: Date
});

export default mongoose.models.Report || mongoose.model('Report', ReportSchema);
