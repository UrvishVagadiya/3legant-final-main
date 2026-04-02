import { apiService } from '../apiService';
import { createClient } from '@/utils/supabase/client';
import { Product } from '../slices/productSlice';

export const productApi = apiService.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], void>({
      queryFn: async () => {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'active');
        if (error) return { error };
        return { data: data || [] };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        const supabase = createClient();
        try {
          await cacheDataLoaded;
          const channel = supabase
            .channel('realtime_products_public')
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'products' },
              (payload: any) => {
                console.log('Realtime products change:', payload);
                const { eventType, new: newRecord, old: oldRecord } = payload;

                updateCachedData((draft) => {
                  if (eventType === 'INSERT') {
                    if (newRecord.status === 'active') {
                      console.log('Adding new active product to cache');
                      draft.unshift(newRecord as Product);
                    }
                  } else if (eventType === 'UPDATE') {
                    const index = draft.findIndex((p) => p.id == newRecord.id);
                    if (newRecord.status === 'active') {
                      if (index !== -1) draft[index] = newRecord as Product;
                      else draft.unshift(newRecord as Product);
                    } else {
                      if (index !== -1) draft.splice(index, 1);
                    }
                  } else if (eventType === 'DELETE') {
                    const index = draft.findIndex((p) => p.id === oldRecord.id);
                    if (index !== -1) draft.splice(index, 1);
                  }
                });
              }
            )
            .subscribe((status: any) => {
            });

          await cacheEntryRemoved;
          supabase.removeChannel(channel);
        } catch {
          // ignore
        }
      },
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
        return { data };
      },
      providesTags: (result, error, id) => [{ type: 'Product', id }],
      async onCacheEntryAdded(id, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        const supabase = createClient();
        try {
          await cacheDataLoaded;
          const channel = supabase
            .channel(`realtime_product_${id}`)
            .on(
              'postgres_changes',
              { 
                event: 'UPDATE', 
                schema: 'public', 
                table: 'products',
                filter: `id=eq.${id}` 
              },
              (payload: any) => {
                console.log('Realtime single product update:', payload);
                updateCachedData((draft) => {
                  Object.assign(draft, payload.new);
                });
              }
            )
            .subscribe((status: any) => {
              console.log(`Realtime product ${id} subscription status:`, status);
            });

          await cacheEntryRemoved;
          supabase.removeChannel(channel);
        } catch {
          // ignore
        }
      },
    }),
    getAdminProducts: builder.query<Product[], void>({
      queryFn: async () => {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) return { error };
        return { data: data || [] };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product', id: 'ADMIN_LIST' },
            ]
          : [{ type: 'Product', id: 'ADMIN_LIST' }],
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        const supabase = createClient();
        try {
          await cacheDataLoaded;
          const channel = supabase
            .channel('realtime_products_admin')
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'products' },
              (payload: any) => {
                console.log('Realtime admin products change:', payload);
                const { eventType, new: newRecord, old: oldRecord } = payload;

                updateCachedData((draft) => {
                  if (eventType === 'INSERT') {
                    draft.unshift(newRecord as Product);
                  } else if (eventType === 'UPDATE') {
                    const index = draft.findIndex((p) => p.id == newRecord.id);
                    if (index !== -1) draft[index] = newRecord as Product;
                  } else if (eventType === 'DELETE') {
                    const index = draft.findIndex((p) => p.id === oldRecord.id);
                    if (index !== -1) draft.splice(index, 1);
                  }
                });
              }
            )
            .subscribe((status: any) => {
              console.log('Realtime admin subscription status:', status);
            });

          await cacheEntryRemoved;
          supabase.removeChannel(channel);
        } catch {
          // ignore
        }
      },
    }),
    addProduct: builder.mutation<Product, Partial<Product>>({
      queryFn: async (productData) => {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();
        if (error) return { error };
        return { data };
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
        return { data };
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
        return { data: data || [] };
      },
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetAdminProductsQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useSearchProductsQuery,
} = productApi;
