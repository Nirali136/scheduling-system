const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    guestName: { type: String, required: true },
    guestEmail: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
