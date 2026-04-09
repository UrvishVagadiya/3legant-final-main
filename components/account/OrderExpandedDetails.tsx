"use client";
import React, { useState } from "react";
import Image from "next/image";
import { RefreshCcw } from "lucide-react";
import RefundRequestModal from "./RefundRequestModal";

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  color: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  order_code: string;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  tracking_number: string | null;
  status: string;
  payment_status: string;
  refund_status: string;
  refund_request_reason?: string | null;
  refund_requested_at?: string | null;
  delivered_at?: string | null;
  created_at: string;
}

interface OrderExpandedDetailsProps {
  order: Order;
  items: OrderItem[];
  loadingItems: boolean;
  refundPeriod?: number;
  onStatusUpdate?: () => void;
}

const OrderExpandedDetails = ({
  order,
  items,
  loadingItems,
  refundPeriod = 7,
  onStatusUpdate,
}: OrderExpandedDetailsProps) => {
  const [showRefundModal, setShowRefundModal] = useState(false);

  const isInstantCancelEligible =
    order.refund_status === "none" &&
    ["pending", "confirmed", "processing"].includes(order.status);

  // Calculate if refund period has expired for delivered orders
  const refundInfo = (() => {
    const status = order.status.toLowerCase();
    if (status !== "delivered") return { expired: false };

    // Fallback to created_at if delivered_at is missing for legacy orders
    const deliveredAt = order.delivered_at || order.created_at;
    const deliveredDate = new Date(deliveredAt);
    const expiryDate = new Date(deliveredDate);
    expiryDate.setDate(deliveredDate.getDate() + refundPeriod);

    const now = new Date();
    const expired = now > expiryDate;

    const remainingMs = expiryDate.getTime() - now.getTime();
    const remainingDays = Math.max(
      0,
      Math.ceil(remainingMs / (1000 * 60 * 60 * 24)),
    );

    return {
      expired,
      expiryDate,
      deliveredDate,
      remainingDays,
    };
  })();

  const isRefundRequestEligible =
    order.refund_status === "none" &&
    !refundInfo.expired &&
    ["shipped", "delivered", "cancelled"].includes(order.status.toLowerCase());

  return (
    <div className="border-t border-gray-200 p-4 md:p-5 bg-gray-50/50">
      {loadingItems ? (
        <p className="text-sm text-[#6C7275]">Loading items...</p>
      ) : (
        <div className="space-y-3 mb-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 bg-white rounded-lg p-3"
            >
              <div className="relative w-14 h-14 bg-[#F3F5F7] rounded shrink-0 flex items-center justify-center">
                {item.product_image ? (
                  <Image
                    src={item.product_image}
                    alt={item.product_name}
                    fill
                    unoptimized
                    className="object-cover rounded p-1"
                  />
                ) : (
                  <div className="text-xs text-gray-400">No img</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-[#141718] truncate">
                  {item.product_name}
                </p>
                {item.color && (
                  <p className="text-xs text-[#6C7275]">Color: {item.color}</p>
                )}
                <p className="text-xs text-[#6C7275]">
                  Qty: {item.quantity} × ${Number(item.unit_price).toFixed(2)}
                </p>
              </div>
              <span className="font-medium text-sm text-[#141718] shrink-0">
                ${Number(item.total_price).toFixed(2)}
              </span>
            </div>
          ))}
          {items.length === 0 && !loadingItems && (
            <p className="text-sm text-[#6C7275]">No items found.</p>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg p-4 space-y-4">
        <div className="space-y-2 text-sm">
          {(() => {
            const subtotal =
              Number(order.subtotal) ||
              items.reduce(
                (acc, item) => acc + Number(item.unit_price) * item.quantity,
                0,
              );
            const total =
              Number(order.total) ||
              subtotal + Number(order.shipping_cost) - Number(order.discount);

            return (
              <div className="w-full space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#6C7275]">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6C7275]">Shipping</span>
                  <span>
                    {Number(order.shipping_cost) === 0
                      ? "Free"
                      : `$${Number(order.shipping_cost).toFixed(2)}`}
                  </span>
                </div>
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#6C7275]">Discount</span>
                    <span className="text-green-600">
                      -${Number(order.discount).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-semibold border-t border-gray-200 pt-2 text-base">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            );
          })()}
        </div>

        {(order.tracking_number ||
          isInstantCancelEligible ||
          isRefundRequestEligible ||
          order.refund_status !== "none") && (
          <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-4">
            {order.tracking_number && (
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-[#6C7275] uppercase font-bold tracking-wider mb-0.5">
                  Tracking Number
                </span>
                <span className="font-mono text-sm text-[#141718] break-all">
                  {order.tracking_number}
                </span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
              {isInstantCancelEligible && (
                <button
                  onClick={() => setShowRefundModal(true)}
                  className="flex items-center cursor-pointer justify-center gap-2 w-full sm:w-auto px-4 py-2 border border-rose-600 text-rose-600 rounded-full text-sm font-medium hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                >
                  <RefreshCcw size={16} />
                  Cancel Order
                </button>
              )}

              {isRefundRequestEligible && (
                <div className="flex flex-col sm:items-end gap-1 w-full sm:w-auto">
                  <button
                    onClick={() => setShowRefundModal(true)}
                    className="flex cursor-pointer items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 border border-[#141718] rounded-full text-sm font-medium hover:bg-[#141718] hover:text-white transition-all shadow-sm"
                  >
                    <RefreshCcw size={16} />
                    Request Refund
                  </button>
                  <span className="text-[10px] text-[#6C7275] font-medium italic">
                    ({refundInfo.remainingDays}{" "}
                    {refundInfo.remainingDays === 1 ? "day" : "days"} left to
                    request refund)
                  </span>
                </div>
              )}

              {order.refund_status !== "none" && (
                <div
                  className={`flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 border rounded-full text-sm font-medium shadow-sm capitalize ${
                    order.refund_status === "requested"
                      ? "border-yellow-200 bg-yellow-50 text-yellow-700"
                      : order.refund_status === "approved"
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  <RefreshCcw size={16} />
                  Cancellation {order.refund_status}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showRefundModal && (
        <RefundRequestModal
          orderId={order.id}
          orderCode={order.order_code}
          isInstant={isInstantCancelEligible}
          onClose={() => setShowRefundModal(false)}
          onSuccess={() => onStatusUpdate?.()}
        />
      )}
    </div>
  );
};

export default OrderExpandedDetails;
