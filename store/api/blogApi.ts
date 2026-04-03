import { apiService } from '../apiService';
import { createClient } from '@/utils/supabase/client';

import { Blog } from '@/types/blog';

const toApiError = (error: any) => ({
  status: 'CUSTOM_ERROR',
  data: {
    message: error?.message || 'Supabase request failed',
    code: error?.code || 'UNKNOWN',
    details: error?.details || null,
  },
});

export const blogApi = apiService.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getBlogsPage: builder.query<
      Blog[],
      {
        offset: number;
        limit: number;
        sortOption?: 'default' | 'az' | 'za' | 'newest' | 'oldest';
      }
    >({
      queryFn: async ({ offset, limit, sortOption = 'default' }) => {
        const supabase = createClient();
        const to = offset + limit - 1;

        let orderColumn: 'title' | 'date' = 'date';
        let ascending = false;

        if (sortOption === 'az') {
          orderColumn = 'title';
          ascending = true;
        } else if (sortOption === 'za') {
          orderColumn = 'title';
          ascending = false;
        } else if (sortOption === 'oldest') {
          orderColumn = 'date';
          ascending = true;
        }

        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .order(orderColumn, { ascending })
          .range(offset, to);

        if (error) return { error: toApiError(error) };
        return { data: data || [] };
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: 'Blog' as const, id })),
            { type: 'Blog', id: 'LIST' },
          ]
          : [{ type: 'Blog', id: 'LIST' }],
    }),
    getBlogs: builder.query<Blog[], void>({
      queryFn: async () => {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .order('date', { ascending: false });

        if (error) return { error: toApiError(error) };
        return { data: data || [] };
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Blog' as const, id })), { type: 'Blog', id: 'LIST' }]
          : [{ type: 'Blog', id: 'LIST' }],
    }),
    addBlog: builder.mutation<Blog, Partial<Blog>>({
      queryFn: async (blog) => {
        const supabase = createClient();
        // Generate next ID
        const { data: maxIdData } = await supabase.from('blogs').select('id').order('id', { ascending: false }).limit(1);
        const nextId = maxIdData && maxIdData.length > 0 ? maxIdData[0].id + 1 : 1;

        const { data, error } = await supabase
          .from('blogs')
          .insert([{ ...blog, id: nextId }])
          .select()
          .single();

        if (error) return { error: toApiError(error) };
        return { data };
      },
      invalidatesTags: [{ type: 'Blog', id: 'LIST' }],
    }),
    updateBlog: builder.mutation<Blog, { id: number; updates: Partial<Blog> }>({
      queryFn: async ({ id, updates }) => {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('blogs')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) return { error: toApiError(error) };
        return { data };
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'Blog', id }, { type: 'Blog', id: 'LIST' }],
    }),
    deleteBlog: builder.mutation<null, number>({
      queryFn: async (id) => {
        const supabase = createClient();
        const { error } = await supabase.from('blogs').delete().eq('id', id);
        if (error) return { error: toApiError(error) };
        return { data: null };
      },
      invalidatesTags: [{ type: 'Blog', id: 'LIST' }],
    }),
  }),
});

export const {
  useLazyGetBlogsPageQuery,
  useGetBlogsQuery,
  useAddBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} = blogApi;
