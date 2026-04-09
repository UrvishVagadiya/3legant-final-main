"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface DeleteReviewModalProps {
  isOpen: boolean;
  reviewText?: string;
  title?: string;
  message?: string;
  confirmText?: string;
  loadingText?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteReviewModal({
  isOpen,
  reviewText,
  title = "Delete Review",
  message = "Are you sure you want to delete this review? This action cannot be undone.",
  confirmText = "Yes, Delete",
  loadingText = "Deleting...",
  isLoading = false,
  onConfirm,
  onCancel,
}: DeleteReviewModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-10000 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-lg border border-[#E8ECEF] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E8ECEF] p-6">
          <h2 className="text-lg font-medium text-[#141718]">{title}</h2>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-[#6C7275] cursor-pointer transition hover:text-black disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm leading-6 text-[#6C7275]">{message}</p>
        </div>

        <div className="flex justify-end gap-3 border-t border-[#E8ECEF] p-6">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg cursor-pointer border border-[#E8ECEF] px-6 py-2 text-sm font-medium text-[#141718] transition hover:bg-[#F3F5F7] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-lg cursor-pointer bg-red-500 px-6 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
          >
            {isLoading ? loadingText : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
