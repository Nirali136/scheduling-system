import * as constants from "../utils/constants";

// Auth
export const LOGIN = "user/login" + " " + constants.POST_RAW;
export const LOGOUT = "user/logout" + " " + constants.POST_RAW;
export const SIGNUP = "user/register" + " " + constants.POST_RAW;

// Availability
export const SAVE_AVAILABILITY = "availability" + " " + constants.POST_RAW;
export const GET_AVAILABILITY_DATES = "availability" + " " + constants.GET_URL_ID_PARAMS;

// Booking
export const CREATE_BOOKING = "bookings" + " " + constants.POST_RAW;
export const GET_BOOKINGS = "bookings" + " " + constants.GET;
