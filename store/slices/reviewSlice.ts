import { createSlice } from '@reduxjs/toolkit';

interface ReviewState {
  // Local UI state can go here
}

const initialState: ReviewState = {
};

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {},
});

export default reviewSlice.reducer;
