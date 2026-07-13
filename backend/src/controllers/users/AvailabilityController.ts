import AvailabilityService from "../../db/services/AvailabilityService";
import ValidationError from "../../utils/ValidationError";
import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth";

export const saveAvailability = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const availability = await AvailabilityService.saveAvailability(req.user._id, req.body);
        return availability;
    } catch (e) {
        throw new ValidationError("Failed to save availability");
    }
};

export const getAvailability = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { date } = req.query as { date?: string };
        const userId = req.params.userId || req.user?._id;
        console.log("date", date)
        if (!date) {
            const dates = await AvailabilityService.getUniqueDates(userId)
                .withDate()
                .execute();
            return { dates };
        } else {
            const slots = await AvailabilityService.calculateSlots(userId, date);
            return { slots };
        }
    } catch (e) {
        console.log(e);
        throw new ValidationError("Failed to fetch availability");
    }
};
