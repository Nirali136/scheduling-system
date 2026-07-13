import BookingService from "../../db/services/BookingService";
import ValidationError from "../../utils/ValidationError";
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth";

export const createBooking = async (req: Request, res: Response) => {
    try {
        const { userId, date, startTime, guestName, guestEmail } = req.body;
        if (!userId || !date || !startTime || !guestName || !guestEmail) {
            throw new ValidationError('Missing required fields');
        }

        const booking = await BookingService.createBooking(userId, req.body);
        return booking;
    } catch (e: any) {
        throw new ValidationError(e.message);
    }
};

export const getBookings = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const bookings = await BookingService.getBookings(req.user._id)
            .withBasicInfo()
            .execute();
        return bookings;
    } catch (e: any) {
        throw new ValidationError(e.message);
    }
};
