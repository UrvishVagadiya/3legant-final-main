"use client";
import { useEffect, useState } from "react";
import { Search, Eye, X, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import OrderDetailModal from "@/components/admin/OrderDetailModal";

interface Order {
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

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  color: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

const badgeStyles: Record<
  string,
  { bg: string; text: string; dot: string; border: string }
> = {
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

const StatusBadge = ({ status }: { status: string }) => {
  const style = badgeStyles[status.toLowerCase()] || badgeStyles.unknown;
  return (
    <div
      className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border w-fit ${style.bg} ${style.text} ${style.border} shadow-sm`}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`} />
      <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
        {status}
      </span>
    </div>
  );
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [editingTracking, setEditingTracking] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState("");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await fetch("/api/admin/orders");
    if (res.ok) setOrders(await res.json());
    setLoading(false);
  };

  const viewOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    setDetailLoading(true);
    const res = await fetch(`/api/admin/order-items?orderId=${order.id}`);
    setOrderItems(res.ok ? await res.json() : []);
    setDetailLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    const res = await fetch("/api/admin/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: orderId, status: newStatus }),
    });
    if (!res.ok) toast.error("Failed to update status");
    else {
      toast.success(`Order marked as ${newStatus}`);
      setOrders((p) =>
        p.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
      if (selectedOrder?.id === orderId)
        setSelectedOrder((p) => (p ? { ...p, status: newStatus } : null));
    }
    setUpdatingStatus(null);
  };

  const updateField = async (orderId: string, field: string, value: string) => {
    const res = await fetch("/api/admin/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: orderId, [field]: value }),
    });
    if (!res.ok) {
      toast.error(`Failed to save ${field.replace("_", " ")}`);
      return false;
    }
    toast.success(
      `${field === "tracking_number" ? "Tracking number" : "Notes"} saved`,
    );
    setOrders((p) =>
      p.map((o) => (o.id === orderId ? { ...o, [field]: value } : o)),
    );
    if (selectedOrder?.id === orderId)
      setSelectedOrder((p) => (p ? { ...p, [field]: value } : null));
    return true;
  };

  const saveTracking = async (id: string) => {
    if (await updateField(id, "tracking_number", trackingInput))
      setEditingTracking(null);
  };
  const saveNotes = async (id: string) => {
    if (await updateField(id, "notes", notesInput)) setEditingNotes(null);
  };

  const deleteOrder = async (orderId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this order? This will also delete all order items and payments.",
      )
    )
      return;
    const res = await fetch(`/api/admin/orders?id=${orderId}`, {
      method: "DELETE",
    });
    if (!res.ok) toast.error("Failed to delete order");
    else {
      toast.success("Order deleted");
      setOrders((p) => p.filter((o) => o.id !== orderId));
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
    }
  };

  const filtered = orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      o.order_code.toLowerCase().includes(q) ||
      `${o.shipping_first_name} ${o.shipping_last_name}`
        .toLowerCase()
        .includes(q) ||
      o.shipping_email.toLowerCase().includes(q);

    if (statusFilter === "refund_requested")
      return matchSearch && o.refund_status === "requested";
    return matchSearch && (statusFilter === "all" || o.status === statusFilter);
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="w-full h-10 bg-gray-100 animate-pulse rounded-lg" />
          </div>
          <div className="w-32 h-10 bg-gray-100 animate-pulse rounded-lg" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-[#6C7275]">
                <tr>
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <th key={i} className="px-6 py-3">
                      <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="border-t border-gray-100">
                    {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 w-24 bg-gray-100 animate-pulse rounded" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#141718]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#141718] bg-white"
        >
          <option value="all">All Statuses</option>
          <option value="refund_requested">Refund Requested</option>
          {[
            "pending",
            "confirmed",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
            "refunded",
          ].map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-[#6C7275]">
              <tr>
                {[
                  "Order",
                  "Customer",
                  "Status",
                  "Payment",
                  "Total",
                  "Date",
                  "Actions",
                ].map((h) => (
                  <th key={h} className="text-left px-6 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr
                  key={order.id}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-medium text-[#141718]">
                    {order.order_code}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[#141718]">
                      {order.shipping_first_name} {order.shipping_last_name}
                    </p>
                    <p className="text-xs text-[#6C7275]">
                      {order.shipping_email}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${(badgeStyles[order.status.toLowerCase()] || badgeStyles.unknown).dot} animate-pulse shrink-0`}
                      />
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(order.id, e.target.value)
                        }
                        disabled={
                          updatingStatus === order.id ||
                          order.status === "refunded"
                        }
                        className={`appearance-none bg-transparent text-[11px] font-black uppercase tracking-widest cursor-pointer outline-none ${(badgeStyles[order.status.toLowerCase()] || badgeStyles.unknown).text} ${order.status === "refunded" ? "opacity-80 cursor-not-allowed" : ""}`}
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
                          <option key={s} value={s}>
                            {s.toUpperCase()}
                          </option>
                        ))}
                      </select>
                      {order.status !== "refunded" && (
                        <ChevronDown
                          size={10}
                          className={`${(badgeStyles[order.status.toLowerCase()] || badgeStyles.unknown).text} opacity-50`}
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5 min-w-30">
                      <StatusBadge status={order.payment_status} />
                      {order.refund_status === "requested" && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100 w-fit animate-pulse">
                          <div className="w-1 h-1 rounded-full bg-amber-500" />
                          <span className="text-[9px] font-black uppercase tracking-wider">
                            Ref Req
                          </span>
                        </div>
                      )}
                      {order.refund_status === "approved" && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 w-fit">
                          <div className="w-1 h-1 rounded-full bg-emerald-500" />
                          <span className="text-[9px] font-black uppercase tracking-wider">
                            Refunded
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-[#141718]">
                    $
                    {(
                      Number(order.total) ||
                      Number(order.subtotal || 0) +
                        Number(order.shipping_cost || 0) -
                        Number(order.discount || 0)
                    ).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-[#6C7275]">
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewOrderDetails(order)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-[#6C7275] hover:text-[#141718]"
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-[#6C7275] hover:text-red-600"
                        title="Delete order"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-[#6C7275]"
                  >
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          orderItems={orderItems}
          detailLoading={detailLoading}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={updateOrderStatus}
          editingTracking={editingTracking}
          trackingInput={trackingInput}
          setTrackingInput={setTrackingInput}
          setEditingTracking={setEditingTracking}
          onSaveTracking={saveTracking}
          editingNotes={editingNotes}
          notesInput={notesInput}
          setNotesInput={setNotesInput}
          setEditingNotes={setEditingNotes}
          onSaveNotes={saveNotes}
        />
      )}
    </div>
  );
}
