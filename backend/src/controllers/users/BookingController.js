const BookingService = require("../../db/services/BookingService");
const ValidationError = require("../../utils/ValidationError");

exports.createBooking = async (req, res) => {
    try {
        const { userId, date, startTime, guestName, guestEmail } = req.body;
        if (!userId || !date || !startTime || !guestName || !guestEmail) {
            throw new ValidationError('Missing required fields');
        }

        const booking = await BookingService.createBooking(userId, req.body);
        return booking;
    } catch (e) {
        throw new ValidationError(e.message);
    }
};

exports.getBookings = async (req, res) => {
    try {
       
        const bookings = await BookingService.getBookings(req.user._id)
            .withBasicInfo()
            .execute();
        return bookings;
    } catch (e) {
        throw new ValidationError(e.message);
    }
};
