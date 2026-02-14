const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Availability', availabilitySchema);
