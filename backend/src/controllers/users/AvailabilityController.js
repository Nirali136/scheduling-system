const AvailabilityService = require("../../db/services/AvailabilityService");
const ValidationError = require("../../utils/ValidationError");

exports.saveAvailability = async (req, res) => {
    try {
        const availability = await AvailabilityService.saveAvailability(req.user._id, req.body);
        return availability;
    } catch (e) {
        throw new ValidationError("Failed to save availability");
    }
};

exports.getAvailability = async (req, res) => {
    try {
        const { date } = req.query;
        const userId = req.params.userId || req.user._id;
        console.log("date",date)
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
