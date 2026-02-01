import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ReviewState {
    reviews: any[];
    currentReview: any | null;
    loading: boolean;
    error: string | null;
}

const initialState: ReviewState = {
    reviews: [],
    currentReview: null,
    loading: false,
    error: null,
};

const reviewSlice = createSlice({
    name: 'reviews',
    initialState,
    reducers: {
        setReviews: (state, action: PayloadAction<any[]>) => {
            state.reviews = action.payload;
        },
        setCurrentReview: (state, action: PayloadAction<any | null>) => {
            state.currentReview = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const { setReviews, setCurrentReview, setLoading, setError } = reviewSlice.actions;
export default reviewSlice.reducer;
