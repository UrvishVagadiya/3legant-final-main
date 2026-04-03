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

export interface GetOrdersParams {
  userId: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedOrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const orderApi = apiService.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getOrders: builder.query<PaginatedOrdersResponse, GetOrdersParams>({
      queryFn: async ({ userId, page = 1, pageSize = 5 }) => {
        const supabase = createClient();
        const safePage = Math.max(1, Number(page) || 1);
        const safePageSize = Math.max(1, Number(pageSize) || 5);
        const from = (safePage - 1) * safePageSize;
        const to = from + safePageSize - 1;

        // Keep order/payment status in sync even if webhook delivery is delayed.
        try {
          await supabase.rpc("cancel_expired_orders");
        } catch (cleanupError) {
          console.error("Failed to auto-cleanup expired orders:", cleanupError);
        }

        const { data, error, count } = await supabase
          .from("orders")
          .select(
            "id, order_code, created_at, status, subtotal, shipping_cost, discount, total, shipping_method, tracking_number, payments(*), refund_status, refund_request_reason, refund_requested_at, delivered_at, order_items(*)",
            { count: "exact" },
          )
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .range(from, to);

        if (error) return { error };

        const mappedData = (data || []).map((o: any) => {
          // If the order itself is confirmed or delivered, we should prioritize showing it even if payment JOIN fails for some reason
          // But usually o.payments should be an array. Let's find any completed payment first.
          const payments = Array.isArray(o.payments) ? o.payments : (o.payments ? [o.payments] : []);
          const successfulPayment = payments.find((p: any) => p.status === 'completed' || p.status === 'succeeded');

          return {
            ...o,
            payment_status: successfulPayment?.status || payments[0]?.status || (o.status === "cancelled" ? "cancelled" : "pending"),
            items: o.order_items || []
          };
        });

        const total = typeof count === "number" ? count : 0;
        const totalPages = Math.max(1, Math.ceil(total / safePageSize));

        return {
          data: {
            orders: mappedData,
            total,
            page: safePage,
            pageSize: safePageSize,
            totalPages,
          },
        };
      },
      providesTags: (result, error, arg) => [{ type: 'Order', id: arg.userId }],
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
