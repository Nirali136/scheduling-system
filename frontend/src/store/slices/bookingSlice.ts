import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import APICallService from '../../api/apiCallService';
import { GET_BOOKINGS, CREATE_BOOKING } from '../../api/apiEndPoints';

export const fetchBookings = createAsyncThunk(
    'booking/fetchBookings',
    async (_, thunkAPI) => {
        try {
            const apiService = new APICallService(GET_BOOKINGS);
            const response = await apiService.callAPI();
            return response || [];
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error?.response?.data?.message || error?.message || 'Failed to fetch bookings'
            );
        }
    }
);

export const createBooking = createAsyncThunk(
    'booking/createBooking',
    async (payload: { userId: string; date: string; startTime: string; guestName: string; guestEmail: string }, thunkAPI) => {
        try {
            const apiService = new APICallService(CREATE_BOOKING, payload);
            const response = await apiService.callAPI();
            return response;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error?.response?.data?.message || error?.message || 'Failed to create booking'
            );
        }
    }
);

interface BookingState {
    bookings: any[];
    loading: boolean;
    bookingSuccess: boolean;
    error: string | null;
}

const initialState: BookingState = {
    bookings: [],
    loading: false,
    bookingSuccess: false,
    error: null,
};

const bookingSlice = createSlice({
    name: 'booking',
    initialState,
    reducers: {
        resetBookingSuccess: (state) => {
            state.bookingSuccess = false;
        },
        clearBookingError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Bookings
            .addCase(fetchBookings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBookings.fulfilled, (state, action) => {
                state.loading = false;
                state.bookings = action.payload;
            })
            .addCase(fetchBookings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create Booking
            .addCase(createBooking.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.bookingSuccess = false;
            })
            .addCase(createBooking.fulfilled, (state) => {
                state.loading = false;
                state.bookingSuccess = true;
                state.error = null;
            })
            .addCase(createBooking.rejected, (state, action) => {
                state.loading = false;
                state.bookingSuccess = false;
                state.error = action.payload as string;
            });
    }
});

export const { resetBookingSuccess, clearBookingError } = bookingSlice.actions;
export default bookingSlice.reducer;
