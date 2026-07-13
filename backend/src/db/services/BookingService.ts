import Availability from "../models/Availability";
import Booking from "../models/Booking";
import { TableFields } from "../../utils/constants";
import { format, addMinutes, parse } from 'date-fns';

export default class BookingService {
    static getBookings = (userId: string) =>
        new ProjectionBuilder(async function (this: any) {
            return await Booking.find({ [TableFields.userId]: userId }, this)
                .sort({ [TableFields.date]: 1, [TableFields.startTime]: 1 });
        });

    static createBooking = async (userId: string, data: any) => {
        const date = data[TableFields.date] || data.date;
        const startTime = data[TableFields.startTime] || data.startTime;
        const guestName = data[TableFields.guestName] || data.guestName;
        const guestEmail = data[TableFields.guestEmail] || data.guestEmail;

        const bookingDate = new Date(date);

        const existingBooking = await Booking.findOne({
            [TableFields.userId]: userId,
            [TableFields.date]: bookingDate,
            [TableFields.startTime]: startTime
        });

        if (existingBooking) {
            throw new Error('Slot already booked');
        }

        const nextDay = new Date(bookingDate);
        nextDay.setDate(bookingDate.getDate() + 1);

        const availabilities = await Availability.find({
            [TableFields.userId]: userId,
            [TableFields.date]: { $gte: bookingDate, $lt: nextDay }
        });

        let isValidSlot = false;

        for (const avail of availabilities) {
            const baseDate = new Date();
            const rangeStart = parse(avail[TableFields.startTime], 'HH:mm', baseDate);
            const rangeEnd = parse(avail[TableFields.endTime], 'HH:mm', baseDate);
            const bookingTimeParsed = parse(startTime, 'HH:mm', baseDate);

            if (bookingTimeParsed >= rangeStart && bookingTimeParsed < rangeEnd) {
                isValidSlot = true;
                break;
            }
        }

        if (!isValidSlot) {
            throw new Error('Invalid slot or not available');
        }

        const bookingTimeParsed = parse(startTime, 'HH:mm', new Date());
        const endTime = format(addMinutes(bookingTimeParsed, 30), 'HH:mm');

        const booking = new Booking({
            [TableFields.userId]: userId,
            [TableFields.date]: bookingDate,
            [TableFields.startTime]: startTime,
            [TableFields.endTime]: endTime,
            [TableFields.guestName]: guestName,
            [TableFields.guestEmail]: guestEmail
        });

        return await booking.save();
    };
}

class ProjectionBuilder {
    private projection: Record<string, number> = {};
    private methodToExecute: (this: Record<string, number>) => Promise<any>;

    constructor(methodToExecute: (this: Record<string, number>) => Promise<any>) {
        this.methodToExecute = methodToExecute;
    }

    withBasicInfo() {
        this.projection[TableFields.guestName] = 1;
        this.projection[TableFields.guestEmail] = 1;
        this.projection[TableFields.date] = 1;
        this.projection[TableFields.startTime] = 1;
        this.projection[TableFields.endTime] = 1;
        return this;
    }

    async execute() {
        return await this.methodToExecute.call(this.projection);
    }
}
