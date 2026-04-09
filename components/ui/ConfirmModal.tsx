"use client";
import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Yes, confirm",
  cancelText = "Cancel",
  isLoading = false,
  onConfirm,
  onCancel,
  isDangerous = false,
}: ConfirmModalProps) {
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
        <div className="flex justify-between items-center p-6 border-b border-[#E8ECEF]">
          <h2 className="text-lg font-medium text-[#141718]">{title}</h2>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-[#6C7275] cursor-pointer hover:text-black focus:outline-none disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-[#6C7275] text-base leading-relaxed">{message}</p>
        </div>

        <div className="flex gap-3 p-6 border-t border-[#E8ECEF] justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2 cursor-pointer border border-[#E8ECEF] rounded-lg text-sm font-medium text-[#141718] hover:bg-[#F3F5F7] transition disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-6 py-2 cursor-pointer rounded-lg text-sm font-medium text-white transition disabled:opacity-50 ${
              isDangerous
                ? "bg-red-500 hover:bg-red-600"
                : "bg-black hover:opacity-90"
            }`}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
