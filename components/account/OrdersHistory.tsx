"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import OrderExpandedDetails from "./OrderExpandedDetails";
import { useAppSelector, RootState } from "@/store";

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

const StatusBadge = ({
  type,
  status,
}: {
  type: "order" | "payment";
  status: string;
}) => {
  const style = badgeStyles[status.toLowerCase()] || badgeStyles.unknown;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] text-[#6C7275] uppercase font-bold tracking-widest leading-none opacity-50 mb-0.5 ml-1">
        {type}
      </span>
      <div
        className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border ${style.bg} ${style.text} ${style.border} shadow-sm transition-all hover:shadow-md`}
      >
        <div
          className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`}
        />
        <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
          {status}
        </span>
      </div>
    </div>
  );
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

import {
  useGetOrdersQuery,
  useGetRefundPeriodQuery,
} from "@/store/api/orderApi";

const OrdersHistory = () => {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const {
    data,
    isLoading: loading,
    isFetching,
  } = useGetOrdersQuery(
    {
      userId: user?.id ?? "",
      page: currentPage,
      pageSize,
    },
    {
      skip: !user?.id,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );

  const orders = data?.orders ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalOrders = data?.total ?? 0;
  const { data: refundSettings } = useGetRefundPeriodQuery();
  const refundPeriod = refundSettings?.days || 7;

  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  React.useEffect(() => {
    setExpandedOrder(null);
  }, [currentPage]);

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading && orders.length === 0) {
    return (
      <div>
        <h1 className="font-semibold text-[20px] mb-6 md:mb-8">
          Orders History
        </h1>
        <p className="text-[#6C7275]">Loading orders...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 md:mb-8">
        <div>
          <h1 className="font-semibold text-[20px]">Orders History</h1>
          {totalOrders > 0 && (
            <p className="text-xs text-[#6C7275] mt-1">
              Showing page {currentPage} of {totalPages} ({totalOrders} total)
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <p className="text-[#6C7275]">No orders yet.</p>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-200 rounded-xl overflow-hidden transition-all hover:border-gray-300 bg-white"
            >
              <button
                onClick={() => toggleOrderDetails(order.id)}
                className="w-full p-4 cursor-pointer md:p-6 hover:bg-gray-50/50 transition-colors text-left"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-10">
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-[10px] text-[#6C7275] uppercase font-bold tracking-widest leading-none opacity-60">
                        Order ID
                      </span>
                      <span className="font-bold text-sm text-[#141718] break-all">
                        {order.order_code}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-[#6C7275] uppercase font-bold tracking-widest leading-none opacity-60">
                        Date
                      </span>
                      <span className="text-sm text-[#141718] font-medium">
                        {formatDate(order.created_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge type="order" status={order.status} />
                      <StatusBadge
                        type="payment"
                        status={order.payment_status}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <span className="font-semibold text-[#141718] text-sm sm:text-base">
                      $
                      {(
                        Number(order.total) ||
                        Number(order.subtotal) +
                          Number(order.shipping_cost) -
                          Number(order.discount)
                      ).toFixed(2)}
                    </span>
                    <span className="shrink-0">
                      {expandedOrder === order.id ? (
                        <ChevronUp size={18} className="text-[#6C7275]" />
                      ) : (
                        <ChevronDown size={18} className="text-[#6C7275]" />
                      )}
                    </span>
                  </div>
                </div>
              </button>

              {expandedOrder === order.id && (
                <OrderExpandedDetails
                  order={order}
                  items={order.items || []}
                  loadingItems={false}
                  refundPeriod={refundPeriod}
                />
              )}
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || isFetching}
            className="px-4 py-2 border cursor-pointer border-gray-300 rounded-md text-sm text-[#141718] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="text-sm text-[#6C7275]">
            Page {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages || isFetching}
            className="px-4 py-2 cursor-pointer border border-gray-300 rounded-md text-sm text-[#141718] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default OrdersHistory;
