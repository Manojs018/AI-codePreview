import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RepoState {
    repositories: any[];
    loading: boolean;
    error: string | null;
}

const initialState: RepoState = {
    repositories: [],
    loading: false,
    error: null,
};

const repoSlice = createSlice({
    name: 'repos',
    initialState,
    reducers: {
        setRepositories: (state, action: PayloadAction<any[]>) => {
            state.repositories = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const { setRepositories, setLoading, setError } = repoSlice.actions;
export default repoSlice.reducer;
