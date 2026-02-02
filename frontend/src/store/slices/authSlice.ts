import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

interface User {
    id: string;
    github_id: number;
    username: string;
    email: string;
    role: 'developer' | 'manager' | 'admin';
    avatar_url: string;
    created_at: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    token: localStorage.getItem('token'),
    refreshToken: localStorage.getItem('refreshToken'),
    isAuthenticated: false,
    loading: true,
    error: null,
};

// Async thunks
export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
    // FORCE PREVIEW MODE: Always return mock user
    return {
        id: 'demo-user-123',
        github_id: 12345,
        username: 'PreviewUser',
        email: 'demo@example.com',
        role: 'developer' as const,
        avatar_url: 'https://ui-avatars.com/api/?name=Preview+User&background=random',
        created_at: new Date().toISOString()
    };
});

export const login = createAsyncThunk(
    'auth/login',
    async (_, { rejectWithValue }) => {
        try {
            window.location.href = `${API_URL}/api/auth/github`;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Login failed');
        }
    }
);

export const demoLogin = createAsyncThunk('auth/demoLogin', async (_, { rejectWithValue }) => {
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Return mock user
        return {
            id: 'demo-user-123',
            github_id: 12345,
            username: 'DemoUser',
            email: 'demo@example.com',
            role: 'developer',
            avatar_url: 'https://ui-avatars.com/api/?name=Demo+User&background=random',
            created_at: new Date().toISOString()
        };
    } catch (error) {
        return rejectWithValue('Demo login failed');
    }
});

export const handleAuthCallback = createAsyncThunk(
    'auth/callback',
    async ({ token, refreshToken }: { token: string; refreshToken: string }, { rejectWithValue }) => {
        try {
            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);

            const response = await axios.get(`${API_URL}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            return { user: response.data.data, token, refreshToken };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Callback failed');
        }
    }
);

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('token');
        if (token && token !== 'demo-token') {
            await axios.post(
                `${API_URL}/api/auth/logout`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
        }

        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.error || 'Logout failed');
    }
});

// Slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Check Auth
            .addCase(checkAuth.pending, (state) => {
                state.loading = true;
            })
            .addCase(checkAuth.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(checkAuth.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.refreshToken = null;
            })
            // Login
            .addCase(login.pending, (state) => {
                state.loading = true;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Demo Login
            .addCase(demoLogin.pending, (state) => {
                state.loading = true;
            })
            .addCase(demoLogin.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload as unknown as User;
                state.token = 'demo-token';
                state.error = null;
                localStorage.setItem('token', 'demo-token');
            })
            // Auth Callback
            .addCase(handleAuthCallback.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.refreshToken = action.payload.refreshToken;
                state.error = null;
            })
            .addCase(handleAuthCallback.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Logout
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.refreshToken = null;
                state.isAuthenticated = false;
                state.error = null;
            });
    },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
