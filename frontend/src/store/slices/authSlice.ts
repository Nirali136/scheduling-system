import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import APICallService from '../../api/apiCallService';
import { LOGIN, SIGNUP } from '../../api/apiEndPoints';

interface User {
    id: string;
    name: string;
    email: string;
    [key: string]: any;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: localStorage.getItem('currentUser')
        ? JSON.parse(localStorage.getItem('currentUser') as string)
        : null,
    isAuthenticated: !!localStorage.getItem('currentUser'),
    loading: false,
    error: null,
};

// Async thunk for login
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials: { email: string; password: string }, thunkAPI) => {
        try {
            const apiService = new APICallService(LOGIN, credentials);
            const response = await apiService.callAPI();
            return response; // expectation: { user: User }
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Login failed'
            );
        }
    }
);

// Async thunk for signup
export const registerUser = createAsyncThunk(
    'auth/register',
    async (payload: { username: string; email: string; password: string }, thunkAPI) => {
        try {
            const apiService = new APICallService(SIGNUP, payload);
            const response = await apiService.callAPI();
            return response; // expectation: { user: User }
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Registration failed'
            );
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{ user: User }>
        ) => {
            const { user } = action.payload;
            state.user = user;
            state.isAuthenticated = true;
            state.loading = false;
            state.error = null;
            localStorage.setItem('currentUser', JSON.stringify(user));
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
            localStorage.removeItem('currentUser');
        },
    },
    extraReducers: (builder) => {
        builder
            // Login user lifecycle
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = null;
                if (action.payload) {
                    const { user } = action.payload;
                    state.user = user;
                    state.isAuthenticated = true;
                    localStorage.setItem('currentUser', JSON.stringify(user));
                }
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Login failed';
            })
            // Register user lifecycle
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = null;
                if (action.payload) {
                    const { user } = action.payload;
                    state.user = user;
                    state.isAuthenticated = true;
                    localStorage.setItem('currentUser', JSON.stringify(user));
                }
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Registration failed';
            });
    },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
