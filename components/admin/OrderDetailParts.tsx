import Image from "next/image";

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  color: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: string;
  order_code: string;
  user_id: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  shipping_method: string;
  coupon_code: string | null;
  shipping_first_name: string;
  shipping_last_name: string;
  shipping_phone: string;
  shipping_email: string;
  shipping_street_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip_code: string;
  shipping_country: string;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  payment_status: string;
  refund_status: "none" | "requested" | "approved" | "rejected";
  refund_request_reason: string | null;
  refund_requested_at: string | null;
}

export function ShippingInfo({ order }: { order: Order }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="font-semibold text-sm text-[#141718] mb-3">
        Shipping Information
      </h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <p>
          <span className="text-[#6C7275]">Name:</span>{" "}
          {order.shipping_first_name} {order.shipping_last_name}
        </p>
        <p>
          <span className="text-[#6C7275]">Phone:</span> {order.shipping_phone}
        </p>
        <p>
          <span className="text-[#6C7275]">Email:</span> {order.shipping_email}
        </p>
        <p>
          <span className="text-[#6C7275]">Method:</span>{" "}
          {order.shipping_method}
        </p>
        <p className="col-span-2">
          <span className="text-[#6C7275]">Address:</span>{" "}
          {order.shipping_street_address}, {order.shipping_city},{" "}
          {order.shipping_state} {order.shipping_zip_code},{" "}
          {order.shipping_country}
        </p>
      </div>
    </div>
  );
}

export function OrderItemsList({
  items,
  loading,
}: {
  items: OrderItem[];
  loading: boolean;
}) {
  return (
    <div>
      <h3 className="font-semibold text-sm text-[#141718] mb-3">Order Items</h3>
      {loading ? (
        <p className="text-sm text-[#6C7275]">Loading items...</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 bg-gray-50 rounded-lg p-3"
            >
              <div className="relative w-14 h-14 bg-white rounded shrink-0">
                {item.product_image && (
                  <Image
                    src={item.product_image}
                    alt={item.product_name}
                    fill
                    unoptimized
                    className="object-cover rounded"
                  />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-[#141718]">
                  {item.product_name}
                </p>
                {item.color && (
                  <p className="text-xs text-[#6C7275]">Color: {item.color}</p>
                )}
              </div>
              <div className="text-right text-sm">
                <p className="text-[#6C7275]">x{item.quantity}</p>
                <p className="font-medium text-[#141718]">
                  ${Number(item.total_price).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function OrderSummaryBlock({ order, items = [] }: { order: Order; items?: OrderItem[] }) {
  const subtotal = Number(order.subtotal) || items.reduce((acc, item) => acc + (Number(item.unit_price) * item.quantity), 0);
  const total = Number(order.total) || (subtotal + Number(order.shipping_cost) - Number(order.discount));

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-[#6C7275]">Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-[#6C7275]">Shipping</span>
        <span>${Number(order.shipping_cost).toFixed(2)}</span>
      </div>
      {Number(order.discount) > 0 && (
        <div className="flex justify-between">
          <span className="text-[#6C7275]">Discount</span>
          <span className="text-green-600">
            -${Number(order.discount).toFixed(2)}
          </span>
        </div>
      )}
      {order.coupon_code && (
        <div className="flex justify-between">
          <span className="text-[#6C7275]">Coupon</span>
          <span>{order.coupon_code}</span>
        </div>
      )}
      <div className="flex justify-between font-semibold text-base border-t border-gray-200 pt-2">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  );
}
