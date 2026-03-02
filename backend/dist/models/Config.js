import mongoose from 'mongoose';
const ConfigSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    description: String,
    updatedAt: { type: Date, default: Date.now }
});
export default mongoose.models.Config || mongoose.model('Config', ConfigSchema);
//# sourceMappingURL=Config.js.map