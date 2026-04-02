import { apiService } from '../apiService';
import { createClient } from '@/utils/supabase/client';
import { WishlistItem } from '../slices/wishlistSlice';

export const wishlistApi = apiService.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getWishlistItems: builder.query<WishlistItem[], string>({
      queryFn: async (userId) => {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('wishlist')
          .select('*, products(*)')
          .eq('user_id', userId);

        if (error) return { error };

        const formatted = (data || []).map((row: any) => ({
          id: row.product_id,
          name: row.products?.title || '',
          price: row.products?.price || 0,
          MRP: row.products?.mrp ? Number(row.products.mrp) : undefined,
          image: row.products?.img || row.products?.image_url || row.products?.image || '/image-1.png',
          color: row.color || (Array.isArray(row.products?.color) ? row.products.color[0] : (row.products?.color || "")),
          stock: row.products?.stock || 0,
        }));

        return { data: formatted };
      },
      providesTags: (result, error, userId) => [{ type: 'Wishlist', id: userId }],
    }),
    toggleWishlist: builder.mutation<null, { userId: string; productId: string; color?: string; adding: boolean }>({
      queryFn: async ({ userId, productId, color, adding }) => {
        const supabase = createClient();
        if (adding) {
          const { error } = await supabase.from('wishlist').upsert({
            user_id: userId,
            product_id: productId,
            color: color // SAVE COLOR TO WISHLIST ROW
          }, { onConflict: 'user_id,product_id' });
          if (error) return { error };
        } else {
          const { error } = await supabase.from('wishlist').delete()
            .eq('user_id', userId)
            .eq('product_id', productId);
          if (error) return { error };
        }
        return { data: null };
      },
      invalidatesTags: (result, error, { userId }) => [{ type: 'Wishlist', id: userId }],
    }),
  }),
});

export const { useGetWishlistItemsQuery, useToggleWishlistMutation } = wishlistApi;
