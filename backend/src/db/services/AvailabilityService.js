const Availability = require("../models/Availability");
const { TableFields } = require("../../utils/constants");
const { format, addMinutes, parse, isBefore, startOfDay } = require('date-fns');

class AvailabilityService {

    static saveAvailability = async (userId, data) => {
        const newAvailability = new Availability({
            [TableFields.userId]: userId,
            [TableFields.date]: new Date(data.date),
            [TableFields.startTime]: data.startTime,
            [TableFields.endTime]: data.endTime
        });
        return await newAvailability.save();
    };

    static getAvailabilityDateRecords = (userId, date) =>
        new ProjectionBuilder(async function () {
            const searchDate = new Date(date);
            const nextDay = new Date(searchDate);
            nextDay.setDate(searchDate.getDate() + 1);

            return await Availability.find({
                [TableFields.userId]: userId,
                [TableFields.date]: {
                    $gte: searchDate,
                    $lt: nextDay
                }
            }, this);
        });

    static calculateSlots = async (userId, date) => {

        const availabilities = await AvailabilityService.getAvailabilityDateRecords(userId, date)
            .withTime()
            .execute();

        const Booking = require("../models/Booking");
        const searchDate = new Date(date);
        const nextDay = new Date(searchDate);
        nextDay.setDate(searchDate.getDate() + 1);

        const bookings = await Booking.find({
            [TableFields.userId]: userId,
            [TableFields.date]: { $gte: searchDate, $lt: nextDay }
        });

        let allSlots = [];
        const baseDate = new Date(); // Arbitrary date base for time parsing

        for (const availability of availabilities) {
            const startTime = parse(availability[TableFields.startTime], 'HH:mm', baseDate);
            const endTime = parse(availability[TableFields.endTime], 'HH:mm', baseDate);

            let current = startTime;

            while (isBefore(current, endTime)) {
                const timeString = format(current, 'HH:mm');
                const isBooked = bookings.some(b => b[TableFields.startTime] === timeString);

                if (!isBooked) {
                    allSlots.push(timeString);
                }

                current = addMinutes(current, 30);
            }
        }
        return [...new Set(allSlots)].sort();
    }

    static getUniqueDates = (userId) =>
        new ProjectionBuilder(async function () {
            const now = startOfDay(new Date());
            const availabilities = await Availability.find({
                [TableFields.userId]: userId,
                [TableFields.date]: { $gte: now }
            }, this).sort({ [TableFields.date]: 1 });
            return [...new Set(availabilities.map(a => format(new Date(a[TableFields.date]), 'yyyy-MM-dd')))];
        });
}

const ProjectionBuilder = class {
    constructor(methodToExecute) {
        const projection = {};

        this.withTime = () => {
            projection[TableFields.startTime] = 1;
            projection[TableFields.endTime] = 1;
            return this;
        };

        this.withDate = () => {
            projection[TableFields.date] = 1;
            return this;
        };

        this.execute = async () => await methodToExecute.call(projection);
    }
};

module.exports = AvailabilityService;
