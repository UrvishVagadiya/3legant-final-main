import Link from "next/link";
import { ArrowLeft, RefreshCw, ShoppingBag } from "lucide-react";
import { typography } from "@/constants/typography";
import { createAdminClient } from "@/utils/supabase/admin";

interface CancelPageProps {
  searchParams?: Promise<{ order_id?: string }>;
}

type OrderRow = {
  id: string;
  order_code: string | null;
  status: string | null;
  total: number | string | null;
  created_at: string | null;
};

type OrderItemRow = {
  id: string;
  product_name: string | null;
  quantity: number | null;
  total_price: number | string | null;
};

export default async function CancelPage({ searchParams }: CancelPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const orderId = resolvedSearchParams.order_id?.trim() || "";

  let order: OrderRow | null = null;
  let items: OrderItemRow[] = [];

  if (orderId) {
    const admin = createAdminClient();
    const { data: orderData } = await admin
      .from("orders")
      .select("id, order_code, status, total, created_at")
      .eq("id", orderId)
      .maybeSingle();

    order = (orderData as OrderRow | null) || null;

    if (order) {
      const { data: orderItems } = await admin
        .from("order_items")
        .select("id, product_name, quantity, total_price")
        .eq("order_id", orderId);

      items = (orderItems as OrderItemRow[] | null) || [];
    }
  }

  return (
    <div className="max-w-300 mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 mb-20 font-inter text-[#141718]">
      <div className="max-w-180 mx-auto rounded-3xl border border-gray-200 bg-white p-6 md:p-10 shadow-sm">
        <div className="flex items-center gap-3 mb-6 text-[#6C7275]">
          <ShoppingBag size={20} />
          <span className="text-sm font-medium">Checkout cancelled</span>
        </div>

        <h1 className={`${typography.h4} mb-3`}>
          Your payment was not completed
        </h1>
        <p className="text-[#6C7275] text-sm md:text-base leading-7 max-w-150">
          You can safely go back to checkout and try again. If the order was
          already created, we will keep your saved information so you can
          continue faster.
        </p>

        {order ? (
          <div className="mt-8 rounded-2xl bg-[#F9FAFB] border border-gray-200 p-5 md:p-6">
            <div className="grid gap-4 md:grid-cols-2 text-sm">
              <div>
                <p className="text-[#6C7275] mb-1">Order code</p>
                <p className="font-semibold text-[#141718]">
                  {order.order_code || "Pending"}
                </p>
              </div>
              <div>
                <p className="text-[#6C7275] mb-1">Status</p>
                <p className="font-semibold text-[#141718] capitalize">
                  {order.status || "unknown"}
                </p>
              </div>
              <div>
                <p className="text-[#6C7275] mb-1">Total</p>
                <p className="font-semibold text-[#141718]">
                  ${Number(order.total || 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-[#6C7275] mb-1">Items</p>
                <p className="font-semibold text-[#141718]">{items.length}</p>
              </div>
            </div>

            {items.length > 0 && (
              <div className="mt-6 border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-[#141718] mb-3">
                  Items in this order
                </p>
                <div className="space-y-3">
                  {items.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-[#141718]">
                        {item.product_name || "Product"}
                      </span>
                      <span className="text-[#6C7275]">
                        x{Number(item.quantity || 0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : orderId ? (
          <div className="mt-8 rounded-2xl bg-[#F9FAFB] border border-gray-200 p-5 md:p-6 text-sm text-[#6C7275]">
            We could not find an order for this cancellation link, but you can
            still return to checkout and try again.
          </div>
        ) : null}

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            href="/checkout"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#141718] px-6 py-3 text-sm font-medium text-white hover:bg-black transition-colors"
          >
            <RefreshCw size={16} />
            Return to checkout
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#141718] px-6 py-3 text-sm font-medium text-[#141718] hover:bg-[#141718] hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
