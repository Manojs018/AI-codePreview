import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import repoReducer from './slices/repoSlice';
import reviewReducer from './slices/reviewSlice';
import analyticsReducer from './slices/analyticsSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        repos: repoReducer,
        reviews: reviewReducer,
        analytics: analyticsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
