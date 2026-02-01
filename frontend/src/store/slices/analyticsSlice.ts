import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AnalyticsState {
    metrics: any | null;
    loading: boolean;
    error: string | null;
}

const initialState: AnalyticsState = {
    metrics: null,
    loading: false,
    error: null,
};

const analyticsSlice = createSlice({
    name: 'analytics',
    initialState,
    reducers: {
        setMetrics: (state, action: PayloadAction<any>) => {
            state.metrics = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const { setMetrics, setLoading, setError } = analyticsSlice.actions;
export default analyticsSlice.reducer;
