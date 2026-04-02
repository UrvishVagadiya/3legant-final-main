"use client";
import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useAppSelector, RootState } from "@/store";
import { useCancelOrderMutation, useRequestRefundMutation } from "@/store/api/orderApi";

interface RefundRequestModalProps {
  orderId: string;
  orderCode: string;
  isInstant?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RefundRequestModal = ({
  orderId,
  orderCode,
  isInstant = false,
  onClose,
  onSuccess,
}: RefundRequestModalProps) => {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const [reason, setReason] = useState("");
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
  const [requestRefund, { isLoading: isRequestingRefund }] = useRequestRefundMutation();

  const loading = isCancelling || isRequestingRefund;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || !user?.id) {
      return;
    }

    try {
      if (isInstant) {
        await cancelOrder({ orderId, userId: user.id, reason }).unwrap();
      } else {
        await requestRefund({ orderId, userId: user.id, reason }).unwrap();
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      // Error is handled by RTK Query or toast
      console.error("Error:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold">{isInstant ? "Cancel Order" : "Request Refund"}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              {isInstant
                ? `You are cancelling order ${orderCode}. A full refund will be processed automatically.`
                : `You are requesting a refund for order ${orderCode}. This will be reviewed by our admin team.`}
              Please provide a reason below.
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isInstant ? "Cancellation Reason" : "Refund Reason"}
            </label>
            <textarea
              required
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Changed my mind, ordered by mistake..."
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-black focus:border-black outline-none transition-all resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-[#141718] text-white rounded-full text-sm font-medium hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {isInstant ? "Confirm Cancellation" : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RefundRequestModal;
