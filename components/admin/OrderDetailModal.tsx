import { useState } from "react";
import { X, RefreshCcw, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  ShippingInfo,
  OrderItemsList,
  OrderSummaryBlock,
  Order,
} from "./OrderDetailParts";

const badgeStyles: Record<
  string,
  { bg: string; text: string; dot: string; border: string }
> = {
  // Order Statuses
  delivered: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    border: "border-emerald-100",
  },
  shipped: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
    border: "border-blue-100",
  },
  confirmed: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    dot: "bg-indigo-500",
    border: "border-indigo-100",
  },
  processing: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    dot: "bg-sky-500",
    border: "border-sky-100",
  },
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    border: "border-amber-100",
  },
  cancelled: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
    border: "border-rose-100",
  },
  cancle: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
    border: "border-rose-100",
  },
  refunded: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    dot: "bg-purple-500",
    border: "border-purple-100",
  },
  // Payment Statuses
  completed: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    border: "border-emerald-100",
  },
  succeeded: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    border: "border-emerald-100",
  },
  failed: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
    border: "border-rose-100",
  },
  unknown: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    dot: "bg-slate-400",
    border: "border-slate-100",
  },
};

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  color: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Props {
  order: Order;
  orderItems: OrderItem[];
  detailLoading: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  editingTracking: string | null;
  trackingInput: string;
  setTrackingInput: (v: string) => void;
  setEditingTracking: (id: string | null) => void;
  onSaveTracking: (id: string) => void;
  editingNotes: string | null;
  notesInput: string;
  setNotesInput: (v: string) => void;
  setEditingNotes: (id: string | null) => void;
  onSaveNotes: (id: string) => void;
}

export default function OrderDetailModal({
  order,
  orderItems,
  detailLoading,
  onClose,
  onUpdateStatus,
  editingTracking,
  trackingInput,
  setTrackingInput,
  setEditingTracking,
  onSaveTracking,
  editingNotes,
  notesInput,
  setNotesInput,
  setEditingNotes,
  onSaveNotes,
}: Props) {
  const [updatingRefund, setUpdatingRefund] = useState(false);

  const handleRefundAction = async (action: "approve" | "reject") => {
    setUpdatingRefund(true);
    try {
      const res = await fetch("/api/admin/orders/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process refund");

      toast.success(data.message || "Refund processed");
      onUpdateStatus(
        order.id,
        action === "approve" ? "refunded" : order.status,
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to process refund";
      toast.error(message);
    } finally {
      setUpdatingRefund(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-[#141718]">
              Order {order.order_code}
            </h2>
            <p className="text-sm text-[#6C7275]">
              {new Date(order.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6C7275] mb-1 uppercase">
                Order Status (Delivery)
              </label>
              <div
                className={`flex items-center gap-3 w-full border border-gray-200 rounded-lg px-4 py-2 bg-white shadow-sm ${(badgeStyles[order.status.toLowerCase()] || badgeStyles.unknown).bg}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${(badgeStyles[order.status.toLowerCase()] || badgeStyles.unknown).dot} animate-pulse shrink-0`}
                />
                <select
                  value={order.status}
                  onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                  disabled={order.status === "refunded"}
                  className={`flex-1 bg-transparent text-sm font-black uppercase tracking-widest outline-none cursor-pointer ${(badgeStyles[order.status.toLowerCase()] || badgeStyles.unknown).text} ${order.status === "refunded" ? "opacity-80 cursor-not-allowed" : ""}`}
                >
                  {[
                    "pending",
                    "confirmed",
                    "processing",
                    "shipped",
                    "delivered",
                    "cancelled",
                    "refunded",
                  ].map((s) => (
                    <option key={s} value={s} className="uppercase">
                      {s.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6C7275] mb-1 uppercase">
                Tracking Number
              </label>
              {editingTracking === order.id ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#141718]"
                  />
                  <button
                    onClick={() => onSaveTracking(order.id)}
                    className="px-4 py-2 bg-[#141718] text-white rounded-lg text-sm hover:bg-black"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => {
                    setEditingTracking(order.id);
                    setTrackingInput(order.tracking_number || "");
                  }}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50"
                >
                  {order.tracking_number || "Click to add tracking..."}
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6C7275] mb-1 uppercase">
                Payment Status
              </label>
              <div
                className={`flex items-center gap-3 w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-white shadow-sm ${(badgeStyles[order.payment_status.toLowerCase()] || badgeStyles.unknown).bg}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${(badgeStyles[order.payment_status.toLowerCase()] || badgeStyles.unknown).dot} animate-pulse shrink-0`}
                />
                <span
                  className={`text-sm font-black uppercase tracking-widest ${(badgeStyles[order.payment_status.toLowerCase()] || badgeStyles.unknown).text}`}
                >
                  {order.payment_status}
                </span>
              </div>
            </div>
          </div>

          {order.refund_status !== "none" && (
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#141718] flex items-center gap-2">
                  <RefreshCcw
                    size={20}
                    className={
                      order.refund_status === "requested"
                        ? "animate-pulse text-yellow-600"
                        : ""
                    }
                  />
                  Refund Request
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    order.refund_status === "requested"
                      ? "bg-yellow-100 text-yellow-700"
                      : order.refund_status === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {order.refund_status}
                </span>
              </div>

              {order.refund_request_reason && (
                <div>
                  <label className="block text-[10px] text-[#6C7275] uppercase font-bold tracking-wider mb-1">
                    Customer Reason
                  </label>
                  <p className="text-sm text-[#141718] bg-white p-3 rounded-lg border border-gray-200 italic">
                    "{order.refund_request_reason}"
                  </p>
                </div>
              )}

              {order.refund_status === "requested" && (
                <div className="flex gap-3 pt-2">
                  <button
                    disabled={updatingRefund}
                    onClick={() => handleRefundAction("approve")}
                    className="flex-1 bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                  >
                    {updatingRefund ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      "Approve & Process Refund"
                    )}
                  </button>
                  <button
                    disabled={updatingRefund}
                    onClick={() => handleRefundAction("reject")}
                    className="flex-1 bg-white border border-red-200 text-red-600 py-2.5 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    Reject Request
                  </button>
                </div>
              )}
            </div>
          )}

          <ShippingInfo order={order} />
          <OrderItemsList items={orderItems} loading={detailLoading} />
          <OrderSummaryBlock order={order} items={orderItems} />

          <div>
            <label className="block text-xs font-semibold text-[#6C7275] mb-1 uppercase">
              Admin Notes
            </label>
            {editingNotes === order.id ? (
              <div className="space-y-2">
                <textarea
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#141718] resize-none"
                />
                <button
                  onClick={() => onSaveNotes(order.id)}
                  className="px-4 py-2 bg-[#141718] text-white rounded-lg text-sm hover:bg-black"
                >
                  Save Notes
                </button>
              </div>
            ) : (
              <div
                onClick={() => {
                  setEditingNotes(order.id);
                  setNotesInput(order.notes || "");
                }}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50 min-h-15"
              >
                {order.notes || "Click to add notes..."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
