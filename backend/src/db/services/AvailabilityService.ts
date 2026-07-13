import Availability from "../models/Availability";
import { TableFields } from "../../utils/constants";
import { format, addMinutes, parse, isBefore, startOfDay } from 'date-fns';
import Booking from "../models/Booking";

export default class AvailabilityService {

    static saveAvailability = async (userId: string, data: any) => {
        const newAvailability = new Availability({
            [TableFields.userId]: userId,
            [TableFields.date]: new Date(data.date),
            [TableFields.startTime]: data.startTime,
            [TableFields.endTime]: data.endTime
        });
        return await newAvailability.save();
    };

    static getAvailabilityDateRecords = (userId: string, date: string) =>
        new ProjectionBuilder(async function (this: any) {
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

    static calculateSlots = async (userId: string, date: string) => {
        const availabilities = await AvailabilityService.getAvailabilityDateRecords(userId, date)
            .withTime()
            .execute();

        const searchDate = new Date(date);
        const nextDay = new Date(searchDate);
        nextDay.setDate(searchDate.getDate() + 1);

        const bookings = await Booking.find({
            [TableFields.userId]: userId,
            [TableFields.date]: { $gte: searchDate, $lt: nextDay }
        });

        let allSlots: string[] = [];
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

    static getUniqueDates = (userId: string) =>
        new ProjectionBuilder(async function (this: any) {
            const now = startOfDay(new Date());
            const availabilities = await Availability.find({
                [TableFields.userId]: userId,
                [TableFields.date]: { $gte: now }
            }, this).sort({ [TableFields.date]: 1 });
            return [...new Set(availabilities.map(a => format(new Date(a[TableFields.date] as Date), 'yyyy-MM-dd')))];
        });
}

class ProjectionBuilder {
    private projection: Record<string, number> = {};
    private methodToExecute: (this: Record<string, number>) => Promise<any>;

    constructor(methodToExecute: (this: Record<string, number>) => Promise<any>) {
        this.methodToExecute = methodToExecute;
    }

    withTime() {
        this.projection[TableFields.startTime] = 1;
        this.projection[TableFields.endTime] = 1;
        return this;
    }

    withDate() {
        this.projection[TableFields.date] = 1;
        return this;
    }

    async execute() {
        return await this.methodToExecute.call(this.projection);
    }
}
