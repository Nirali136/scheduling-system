import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import APICallService from '../../api/apiCallService';
import { SAVE_AVAILABILITY, GET_AVAILABILITY_DATES } from '../../api/apiEndPoints';

export const saveAvailability = createAsyncThunk(
    'availability/save',
    async (payload: { date: string; startTime: string; endTime: string }, thunkAPI) => {
        try {
            const apiService = new APICallService(SAVE_AVAILABILITY, payload);
            const response = await apiService.callAPI();
            return response;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error?.response?.data?.message || error?.message || 'Failed to save availability'
            );
        }
    }
);

export const fetchAvailableDates = createAsyncThunk(
    'availability/fetchDates',
    async (userId: string, thunkAPI) => {
        try {
            const apiService = new APICallService(
                GET_AVAILABILITY_DATES,
                {},
                [userId]
            );
            const response = await apiService.callAPI();
            // Dates are returned as ISO strings from API
            return response.dates || [];
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error?.response?.data?.message || error?.message || 'Failed to fetch available dates'
            );
        }
    }
);

export const fetchSlots = createAsyncThunk(
    'availability/fetchSlots',
    async (payload: { userId: string; date: string }, thunkAPI) => {
        try {
            const apiService = new APICallService(
                GET_AVAILABILITY_DATES,
                { date: payload.date },
                [payload.userId]
            );
            const response = await apiService.callAPI();
            return response.slots || [];
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error?.response?.data?.message || error?.message || 'Failed to fetch slots'
            );
        }
    }
);

interface AvailabilityState {
    availableDates: string[];
    slots: string[];
    loadingDates: boolean;
    loadingSlots: boolean;
    saving: boolean;
    error: string | null;
}

const initialState: AvailabilityState = {
    availableDates: [],
    slots: [],
    loadingDates: false,
    loadingSlots: false,
    saving: false,
    error: null,
};

const availabilitySlice = createSlice({
    name: 'availability',
    initialState,
    reducers: {
        clearAvailabilityError: (state) => {
            state.error = null;
        },
        clearSlots: (state) => {
            state.slots = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Save Availability
            .addCase(saveAvailability.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(saveAvailability.fulfilled, (state) => {
                state.saving = false;
                state.error = null;
            })
            .addCase(saveAvailability.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload as string;
            })
            // Fetch Dates
            .addCase(fetchAvailableDates.pending, (state) => {
                state.loadingDates = true;
                state.error = null;
            })
            .addCase(fetchAvailableDates.fulfilled, (state, action) => {
                state.loadingDates = false;
                state.availableDates = action.payload;
            })
            .addCase(fetchAvailableDates.rejected, (state, action) => {
                state.loadingDates = false;
                state.error = action.payload as string;
            })
            // Fetch Slots
            .addCase(fetchSlots.pending, (state) => {
                state.loadingSlots = true;
                state.error = null;
            })
            .addCase(fetchSlots.fulfilled, (state, action) => {
                state.loadingSlots = false;
                state.slots = action.payload;
            })
            .addCase(fetchSlots.rejected, (state, action) => {
                state.loadingSlots = false;
                state.error = action.payload as string;
            });
    }
});

export const { clearAvailabilityError, clearSlots } = availabilitySlice.actions;
export default availabilitySlice.reducer;
