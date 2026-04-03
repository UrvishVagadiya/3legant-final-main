import { apiService } from '../apiService';
import { createClient } from '@/utils/supabase/client';
import { CartItem } from '../slices/cartSlice';

interface CartRow {
  product_id: string;
  quantity: number;
  color?: string | null;
  products?: {
    title?: string | null;
    price?: number | string | null;
    img?: string | null;
    image_url?: string | null;
    image?: string | null;
    stock?: number | null;
  } | null;
}

export const cartApi = apiService.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getCartItems: builder.query<CartItem[], string>({
      queryFn: async (userId) => {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('cart')
          .select('*, products(*)')
          .eq('user_id', userId);

        if (error) return { error };

        const formatted = (data || []).map((row: CartRow) => ({
          id: row.product_id,
          name: row.products?.title || '',
          price: Number(row.products?.price) || 0,
          image: row.products?.img || row.products?.image_url || row.products?.image || '/image-1.png',
          color: row.color || 'Default',
          quantity: row.quantity,
          stock: row.products?.stock || 0,
        }));

        return { data: formatted };
      },
      providesTags: (result, error, userId) => [{ type: 'Cart', id: userId }],
    }),
    syncCart: builder.mutation<null, { userId: string; items: CartItem[] }>({
      queryFn: async ({ userId, items }) => {
        const supabase = createClient();
        await supabase.from('cart').delete().eq('user_id', userId);

        if (items.length > 0) {
          const rows = items.map(item => ({
            user_id: userId,
            product_id: item.id,
            quantity: item.quantity,
            color: item.color,
          }));
          const { error } = await supabase.from('cart').insert(rows);
          if (error) return { error };
        }

        return { data: null };
      },
      invalidatesTags: (result, error, { userId }) => [{ type: 'Cart', id: userId }],
    }),
  }),
});

export const { useGetCartItemsQuery, useSyncCartMutation } = cartApi;
