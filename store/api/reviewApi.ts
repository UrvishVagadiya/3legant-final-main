import { apiService } from '../apiService';
import { createClient } from '@/utils/supabase/client';

export interface RatingData {
  avgRating: number;
  reviewCount: number;
}

export interface ReviewReply {
  id: string;
  review_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  reply: string;
  created_at: string;
}

interface ReviewProfileRow {
  display_name?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
}

interface ReviewDbRow {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string | null;
  rating: number;
  review: string;
  created_at: string;
  review_likes?: { user_id: string }[];
  review_replies?: Array<ReviewReply & { user_profiles?: ReviewProfileRow | null }>;
  user_profiles?: ReviewProfileRow | null;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  review: string;
  created_at: string;
  likes_count: number;
  liked: boolean;
  replies: ReviewReply[];
}

const REVIEW_ELIGIBLE_ORDER_STATUSES = [
  "processing",
  "shipped",
  "delivered",
  "completed",
  "refunded",
];

const hasPurchasedProduct = async (userId: string, productId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("order_items")
    .select("id, orders!inner(user_id, status)")
    .eq("product_id", productId)
    .eq("orders.user_id", userId)
    .in("orders.status", REVIEW_ELIGIBLE_ORDER_STATUSES)
    .limit(1)
    .maybeSingle();

  if (error) {
    return { allowed: false, error };
  }

  return { allowed: !!data, error: null as null };
};

export const reviewApi = apiService.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    canReviewProduct: builder.query<boolean, { productId: string; userId?: string }>({
      queryFn: async ({ productId, userId }) => {
        if (!userId) return { data: false };

        const eligibility = await hasPurchasedProduct(userId, productId);
        if (eligibility.error) return { error: eligibility.error };

        return { data: eligibility.allowed };
      },
      providesTags: (result, error, { productId, userId }) => [
        { type: "Review", id: `CAN_REVIEW_${productId}_${userId || "anon"}` },
      ],
    }),
    getReviews: builder.query<Review[], { productId: string; userId?: string }>({
      queryFn: async ({ productId, userId }) => {
        const supabase = createClient();
        const { data: reviews, error } = await supabase
          .from("product_reviews")
          .select(`
            *,
            user_profiles:user_id(display_name, full_name, avatar_url),
            review_likes(user_id),
            review_replies(*, user_profiles:user_id(display_name, full_name, avatar_url))
          `)
          .eq("product_id", productId)
          .order("created_at", { ascending: false });

        if (error) return { error };

        const formatted = (reviews || []).map((r: ReviewDbRow) => ({
          ...r,
          user_name: r.user_profiles?.display_name || r.user_profiles?.full_name || r.user_name,
          user_avatar: r.user_profiles?.avatar_url,
          likes_count: r.review_likes?.length || 0,
          liked: userId ? r.review_likes?.some((l) => l.user_id === userId) : false,
          replies: (r.review_replies || []).map((rp) => ({
            ...rp,
            user_name: rp.user_profiles?.display_name || rp.user_profiles?.full_name || rp.user_name,
            user_avatar: rp.user_profiles?.avatar_url
          }))
        }));

        return { data: formatted };
      },
      providesTags: (result, error, { productId }) => [
        { type: 'Review', id: `LIST_${productId}` },
        ... (result || []).map(r => ({ type: 'Review' as const, id: r.id }))
      ],
    }),
    getRatingsByProducts: builder.query<Record<string, RatingData>, (string | number)[]>({
      queryFn: async (productIds) => {
        const idsToFetch = productIds.map(id => String(id));
        if (idsToFetch.length === 0) return { data: {} };

        const supabase = createClient();
        const { data, error } = await supabase
          .from("product_reviews")
          .select("product_id, rating")
          .in("product_id", idsToFetch);

        if (error) return { error };

        const grouped: Record<string, { sum: number; count: number }> = {};
        for (const row of data || []) {
          const pid = String(row.product_id);
          if (!grouped[pid]) grouped[pid] = { sum: 0, count: 0 };
          grouped[pid].sum += row.rating;
          grouped[pid].count += 1;
        }

        const newRatings: Record<string, RatingData> = {};
        for (const [pid, val] of Object.entries(grouped)) {
          newRatings[pid] = {
            avgRating: val.sum / val.count,
            reviewCount: val.count,
          };
        }

        for (const id of idsToFetch) {
          if (!newRatings[id]) {
            newRatings[id] = { avgRating: 0, reviewCount: 0 };
          }
        }
        return { data: newRatings };
      },
      providesTags: (result) => [
        { type: 'Review', id: 'RATINGS' },
        ... (result ? Object.keys(result).map(id => ({ type: 'Review' as const, id: `RATING_${id}` })) : [])
      ],
    }),
    addReview: builder.mutation<Review, { productId: string; userId: string; userName: string; rating: number; review: string }>({
      queryFn: async (payload) => {
        const eligibility = await hasPurchasedProduct(payload.userId, payload.productId);
        if (eligibility.error) return { error: eligibility.error };
        if (!eligibility.allowed) {
          return {
            error: {
              status: 403,
              data: { message: "You can review this product only after purchasing it." },
            },
          };
        }

        const supabase = createClient();
        const { data, error } = await supabase
          .from("product_reviews")
          .insert({
            product_id: payload.productId,
            user_id: payload.userId,
            user_name: payload.userName,
            rating: payload.rating,
            review: payload.review
          })
          .select()
          .single();

        if (error) return { error };
        return { data: { ...data, liked: false, likes_count: 0, replies: [] } };
      },
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Review', id: `LIST_${productId}` },
        { type: 'Review', id: 'RATINGS' },
        { type: 'Review', id: `RATING_${productId}` }
      ],
    }),
    updateReview: builder.mutation<Review, { productId: string; reviewId: string; rating: number; review: string }>({
      queryFn: async ({ reviewId, rating, review }) => {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("product_reviews")
          .update({ rating, review })
          .eq("id", reviewId)
          .select()
          .single();

        if (error) return { error };
        return { data };
      },
      invalidatesTags: (result, error, { reviewId, productId }) => [
        { type: 'Review', id: reviewId },
        { type: 'Review', id: `LIST_${productId}` },
        { type: 'Review', id: 'RATINGS' },
        { type: 'Review', id: `RATING_${productId}` }
      ],
    }),
    deleteReview: builder.mutation<null, { productId: string; reviewId: string; userId: string }>({
      queryFn: async ({ reviewId, userId }) => {
        const supabase = createClient();
        const { error } = await supabase.from("product_reviews").delete().eq("id", reviewId).eq("user_id", userId);
        if (error) return { error };
        return { data: null };
      },
      invalidatesTags: (result, error, { productId, reviewId }) => [
        { type: 'Review', id: `LIST_${productId}` },
        { type: 'Review', id: 'RATINGS' },
        { type: 'Review', id: `RATING_${productId}` }
      ],
    }),
    toggleLikeReview: builder.mutation<{ reviewId: string; liked: boolean }, { productId: string; reviewId: string; userId: string; liked: boolean }>({
      queryFn: async ({ reviewId, userId, liked }) => {
        const supabase = createClient();
        if (liked) {
          await supabase.from("review_likes").delete().eq("review_id", reviewId).eq("user_id", userId);
        } else {
          await supabase.from("review_likes").insert({ review_id: reviewId, user_id: userId });
        }
        return { data: { reviewId, liked: !liked } };
      },
      invalidatesTags: (result, error, { reviewId, productId }) => [{ type: 'Review', id: reviewId }],
    }),
    addReply: builder.mutation<ReviewReply, { productId: string; reviewId: string; userId: string; userName: string; reply: string }>({
      queryFn: async (payload) => {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("review_replies")
          .insert({
            review_id: payload.reviewId,
            user_id: payload.userId,
            user_name: payload.userName,
            reply: payload.reply
          })
          .select()
          .single();

        if (error) return { error };
        return { data: data as ReviewReply };
      },
      invalidatesTags: (result, error, { productId, reviewId }) => [{ type: 'Review', id: reviewId }, { type: 'Review', id: `LIST_${productId}` }],
    }),
  }),
});

export const {
  useCanReviewProductQuery,
  useGetReviewsQuery,
  useGetRatingsByProductsQuery,
  useAddReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useToggleLikeReviewMutation,
  useAddReplyMutation,
} = reviewApi;
