import { apiService } from '../apiService';
import { createClient } from '@/utils/supabase/client';

export interface Order {
  id: string;
  order_code: string;
  created_at: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  shipping_method: string;
  tracking_number: string | null;
  payment_status: string;
  refund_status: "none" | "requested" | "approved" | "rejected";
  refund_request_reason: string | null;
  refund_requested_at: string | null;
  delivered_at: string | null;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  color: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export const orderApi = apiService.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getOrders: builder.query<Order[], string>({
      queryFn: async (userId) => {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("orders")
          .select(
            "id, order_code, created_at, status, subtotal, shipping_cost, discount, total, shipping_method, tracking_number, payments(*), refund_status, refund_request_reason, refund_requested_at, delivered_at, order_items(*)",
          )
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) return { error };

        const mappedData = (data || []).map((o: any) => {
          // If the order itself is confirmed or delivered, we should prioritize showing it even if payment JOIN fails for some reason
          // But usually o.payments should be an array. Let's find any completed payment first.
          const payments = Array.isArray(o.payments) ? o.payments : (o.payments ? [o.payments] : []);
          const successfulPayment = payments.find((p: any) => p.status === 'completed' || p.status === 'succeeded');
          
          return {
            ...o,
            payment_status: successfulPayment?.status || payments[0]?.status || "pending",
            items: o.order_items || []
          };
        });

        return { data: mappedData };
      },
      providesTags: (result, error, userId) => [{ type: 'Order', id: userId }],
      keepUnusedDataFor: 10, // Shorten TTL for orders to 10 seconds to ensure quick updates
    }),
    requestRefund: builder.mutation<null, { orderId: string; userId: string; reason: string }>({
      queryFn: async ({ orderId, reason }) => {
        const res = await fetch("/api/orders/refund-request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, reason }),
        });

        const data = await res.json();
        if (!res.ok) return { error: { status: res.status, data: data.error } };
        return { data: null };
      },
      invalidatesTags: (result, error, { userId }) => [{ type: 'Order', id: userId }],
    }),
    cancelOrder: builder.mutation<null, { orderId: string; userId: string; reason: string }>({
      queryFn: async ({ orderId, reason }) => {
        const res = await fetch("/api/orders/cancel-instant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, reason }),
        });

        const data = await res.json();
        if (!res.ok) return { error: { status: res.status, data: data.error } };
        return { data: null };
      },
      invalidatesTags: (result, error, { userId }) => [{ type: 'Order', id: userId }],
    }),
    getRefundPeriod: builder.query<{ days: number }, void>({
      queryFn: async () => {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("store_settings")
          .select("value")
          .eq("id", "refund_period")
          .maybeSingle();

        if (error) return { error };
        return { data: { days: data?.value?.days || 7 } };
      },
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useRequestRefundMutation,
  useCancelOrderMutation,
  useGetRefundPeriodQuery,
} = orderApi;
