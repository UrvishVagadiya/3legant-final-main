"use client";
import { X } from "lucide-react";

interface Payment {
  id: string;
  order_id: string;
  payment_method: string;
  status: string;
  transaction_id: string | null;
  amount: number;
  refund_amount: number | null;
  refund_date: string | null;
  refund_reason: string | null;
  order_code?: string;
}

interface Props {
  payment: Payment;
  refundAmount: string;
  setRefundAmount: (v: string) => void;
  refunding: boolean;
  onRefund: () => void;
  onClose: () => void;
}

export default function RefundModal({
  payment,
  refundAmount,
  setRefundAmount,
  refunding,
  onRefund,
  onClose,
}: Props) {
  const maxRefundable =
    Number(payment.amount) - Number(payment.refund_amount || 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
        <h3 className="text-lg font-semibold text-[#141718] mb-1">
          Process Refund
        </h3>
        <p className="text-sm text-[#6C7275] mb-6">
          Order: {payment.order_code} • Transaction:{" "}
          {payment.transaction_id?.slice(0, 20)}...
        </p>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#6C7275]">Original Amount</span>
              <span className="font-medium">
                ${Number(payment.amount).toFixed(2)}
              </span>
            </div>
            {Number(payment.refund_amount || 0) > 0 && (
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#6C7275]">Already Refunded</span>
                <span className="font-medium text-red-500">
                  ${Number(payment.refund_amount).toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm border-t border-gray-200 pt-1 mt-1">
              <span className="text-[#6C7275]">Max Refundable</span>
              <span className="font-semibold">${maxRefundable.toFixed(2)}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#141718] mb-1">
              Refund Amount (USD)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={maxRefundable}
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              placeholder={`Full refund: $${maxRefundable.toFixed(2)}`}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#141718]"
            />
            <p className="text-xs text-[#6C7275] mt-1">
              Leave empty for full refund
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-200 text-[#141718] py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onRefund}
              disabled={refunding}
              className="flex-1 bg-purple-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {refunding ? "Processing..." : "Process Refund"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
