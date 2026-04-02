"use client";
import { useEffect, useState } from "react";
import { Search, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import RefundModal from "@/components/admin/RefundModal";

interface Payment {
  id: string;
  order_id: string;
  payment_method: string;
  status: string;
  transaction_id: string | null;
  amount: number;
  currency: string;
  card_last_four: string | null;
  card_brand: string | null;
  refund_amount: number | null;
  refund_date: string | null;
  refund_reason: string | null;
  payment_date: string | null;
  created_at: string;
  order_code?: string;
  customer_name?: string;
  refund_status?: string;
}

const statusBadge = (s: string) =>
  ({
    pending: "bg-yellow-100 text-yellow-700",
    completed: "bg-green-100 text-green-700",
    succeeded: "bg-green-100 text-green-700",
    confirmed: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    cancelled: "bg-red-100 text-red-700",
    refunded: "bg-purple-100 text-purple-700",
    cancle: "bg-red-100 text-red-700",
  })[s.toLowerCase()] || "bg-red-100 text-red-700";

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refundModal, setRefundModal] = useState<Payment | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refunding, setRefunding] = useState(false);

  const fetchPayments = async () => {
    const res = await fetch("/api/admin/payments");
    if (res.ok) {
      const data = await res.json();
      setPayments(
        data.map((p: any) => ({
          ...p,
          order_code: p.orders?.order_code || "N/A",
          customer_name: p.orders
            ? `${p.orders.shipping_first_name} ${p.orders.shipping_last_name}`
            : "N/A",
          refund_status: p.orders?.refund_status || "none",
        })),
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleRefund = async () => {
    if (!refundModal) return;
    setRefunding(true);
    try {
      const max =
        Number(refundModal.amount) - Number(refundModal.refund_amount || 0);
      const amount = refundAmount
        ? Math.min(parseFloat(refundAmount), max)
        : max;
      if (amount <= 0) {
        toast.error("Invalid refund amount");
        setRefunding(false);
        return;
      }
      const res = await fetch("/api/admin/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: refundModal.id, amount }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(
          `Refund of $${data.refundAmount.toFixed(2)} processed successfully`,
        );
        setRefundModal(null);
        setRefundAmount("");
        await fetchPayments();
      } else toast.error(data.error || "Failed to process refund");
    } catch {
      toast.error("Failed to process refund");
    } finally {
      setRefunding(false);
    }
  };

  const filtered = payments.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      (p.order_code || "").toLowerCase().includes(q) ||
      (p.customer_name || "").toLowerCase().includes(q) ||
      (p.transaction_id || "").toLowerCase().includes(q);
    return matchSearch && (statusFilter === "all" || p.status === statusFilter);
  });

  const totalRevenue = payments
    .filter((p) => p.status === "completed" || p.status === "refunded")
    .reduce((s, p) => s + Number(p.amount), 0);
  const totalRefunded = payments
    .filter((p) => p.refund_amount)
    .reduce((s, p) => s + Number(p.refund_amount || 0), 0);

  if (loading) return <div className="text-[#6C7275]">Loading payments...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Total Payments",
            val: String(payments.length),
            color: "text-[#141718]",
          },
          {
            label: "Total Revenue",
            val: `$${totalRevenue.toFixed(2)}`,
            color: "text-green-600",
          },
          {
            label: "Total Refunded",
            val: `$${totalRefunded.toFixed(2)}`,
            color: "text-red-600",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-gray-200 rounded-xl p-5"
          >
            <p className="text-sm text-[#6C7275]">{s.label}</p>
            <p className={`text-2xl font-semibold ${s.color} mt-1`}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by order, customer, or transaction ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#141718]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#141718]"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
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
                  "Method",
                  "Amount",
                  "Status",
                  "Transaction ID",
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
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-medium text-[#141718]">
                    {p.order_code}
                  </td>
                  <td className="px-6 py-4 text-[#141718]">
                    {p.customer_name}
                  </td>
                  <td className="px-6 py-4 text-[#6C7275] capitalize">
                    {p.payment_method?.replace(/_/g, " ")}
                    {p.card_last_four && (
                      <span className="block text-xs text-gray-400">
                        {p.card_brand && `${p.card_brand} `}••••{" "}
                        {p.card_last_four}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-[#141718]">
                    ${Number(p.amount).toFixed(2)}
                    {p.refund_amount ? (
                      <span className="block text-xs text-red-500">
                        Refund: ${Number(p.refund_amount).toFixed(2)}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusBadge(p.status)}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#6C7275] font-mono text-xs">
                    {p.transaction_id || "—"}
                  </td>
                  <td className="px-6 py-4 text-[#6C7275]">
                    {new Date(p.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {p.refund_date && (
                      <span className="block text-xs text-purple-500">
                        Refunded:{" "}
                        {new Date(p.refund_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {p.transaction_id &&
                      p.status !== "refunded" &&
                      p.refund_status === "requested" && (
                        <button
                          onClick={() => {
                            setRefundModal(p);
                            setRefundAmount("");
                          }}
                          className="flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-800 transition-colors"
                        >
                          <RotateCcw size={14} /> Refund
                        </button>
                      )}
                    {p.status === "refunded" && (
                      <span className="text-xs text-gray-400">Refunded</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-[#6C7275]"
                  >
                    No payments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {refundModal && (
        <RefundModal
          payment={refundModal}
          refundAmount={refundAmount}
          setRefundAmount={setRefundAmount}
          refunding={refunding}
          onRefund={handleRefund}
          onClose={() => setRefundModal(null)}
        />
      )}
    </div>
  );
}
