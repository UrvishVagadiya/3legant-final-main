import { apiService } from '../apiService';
import { createClient } from '@/utils/supabase/client';
import { Product } from '../slices/productSlice';
import { isProductNew } from '@/utils/isProductNew';

const normalizeProduct = (product: Product): Product => ({
  ...product,
  isNew: isProductNew(product.created_at || product.createdAt),
});

export const productApi = apiService.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getProductsPage: builder.query<Product[], { offset: number; limit: number }>({
      queryFn: async ({ offset, limit }) => {
        const supabase = createClient();
        const to = offset + limit - 1;
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .range(offset, to);

        if (error) return { error };
        return { data: (data || []).map((product: Product) => normalizeProduct(product)) };
      },
    }),
    getProducts: builder.query<Product[], void>({
      queryFn: async () => {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'active');
        if (error) return { error };
        return { data: (data || []).map((product: Product) => normalizeProduct(product)) };
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: 'Product' as const, id })),
            { type: 'Product', id: 'LIST' },
          ]
          : [{ type: 'Product', id: 'LIST' }],
    }),
    getNewArrivalProducts: builder.query<Product[], void>({
      queryFn: async () => {
        const supabase = createClient();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 7);

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'active')
          .gte('created_at', cutoffDate.toISOString())
          .order('created_at', { ascending: false });

        if (error) return { error };
        return { data: (data || []).map((product: Product) => normalizeProduct(product)) };
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: 'Product' as const, id })),
            { type: 'Product', id: 'NEW_ARRIVALS' },
          ]
          : [{ type: 'Product', id: 'NEW_ARRIVALS' }],
    }),
    getProductById: builder.query<Product, string | number>({
      queryFn: async (id) => {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (error) return { error };
        if (!data) return { error: { message: 'Product not found' } };
        return { data: normalizeProduct(data) };
      },
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    getAdminProducts: builder.query<Product[], void>({
      queryFn: async () => {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) return { error };
        return { data: (data || []).map((product: Product) => normalizeProduct(product)) };
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: 'Product' as const, id })),
            { type: 'Product', id: 'ADMIN_LIST' },
          ]
          : [{ type: 'Product', id: 'ADMIN_LIST' }],
    }),
    addProduct: builder.mutation<Product, Partial<Product>>({
      queryFn: async (productData) => {
        const supabase = createClient();
        const productPayload = {
          ...productData,
          created_at: productData.created_at || new Date().toISOString(),
        };
        const { data, error } = await supabase
          .from('products')
          .insert([productPayload])
          .select()
          .single();
        if (error) return { error };
        return { data: normalizeProduct(data) };
      },
      invalidatesTags: [{ type: 'Product', id: 'LIST' }, { type: 'Product', id: 'ADMIN_LIST' }],
    }),
    updateProduct: builder.mutation<Product, { id: string | number; productData: Partial<Product> }>({
      queryFn: async ({ id, productData }) => {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', id)
          .select()
          .single();
        if (error) return { error };
        return { data: normalizeProduct(data) };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
        { type: 'Product', id: 'ADMIN_LIST' },
      ],
    }),
    deleteProduct: builder.mutation<string | number, string | number>({
      queryFn: async (id) => {
        const supabase = createClient();
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);
        if (error) return { error };
        return { data: id };
      },
      invalidatesTags: (result, error, id) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
        { type: 'Product', id: 'ADMIN_LIST' },
      ],
    }),
    searchProducts: builder.query<Product[], string>({
      queryFn: async (query) => {
        if (!query.trim()) return { data: [] };
        const supabase = createClient();
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .ilike('title', `%${query.trim()}%`)
          .limit(8);
        if (error) return { error };
        return { data: (data || []).map((product: Product) => normalizeProduct(product)) };
      },
    }),
  }),
});

export const {
  useLazyGetProductsPageQuery,
  useGetProductsQuery,
  useGetNewArrivalProductsQuery,
  useGetProductByIdQuery,
  useGetAdminProductsQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useLazySearchProductsQuery,
  useSearchProductsQuery,
} = productApi;
