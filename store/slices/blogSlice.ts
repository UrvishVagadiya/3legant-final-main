import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createClient } from '@/utils/supabase/client';
import { Blog } from '@/types/blog';

const supabase = createClient();

interface BlogState {
  blogs: Blog[];
}

const initialState: BlogState = {
  blogs: [],
};

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    setBlogs: (state, action: PayloadAction<Blog[]>) => {
      state.blogs = action.payload;
    }
  },
});

export const { setBlogs } = blogSlice.actions;
export default blogSlice.reducer;
