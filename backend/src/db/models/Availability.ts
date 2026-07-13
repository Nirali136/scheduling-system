import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
}, { timestamps: true });

const Availability = mongoose.model('Availability', availabilitySchema);
export default Availability;
