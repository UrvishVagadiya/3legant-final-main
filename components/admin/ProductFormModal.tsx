"use client";
import { FormEvent } from "react";
import { X } from "lucide-react";
import ProductFormFields from "./ProductFormFields";

export type ProductFormData = {
  title: string;
  price: string;
  mrp: string;
  category: string[];
  description: string;
  sku: string;
  stock: string;
  color: string[];
  status: string;
  measurements: string;
  weight: string;
  valid_until: string;
};

export const emptyProductForm: ProductFormData = {
  title: "",
  price: "",
  mrp: "",
  category: [],
  description: "",
  sku: "",
  stock: "0",
  color: [],
  status: "active",
  measurements: "",
  weight: "",
  valid_until: "",
};

interface Props {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  editingId: string | number | null;
  imageFiles: File[];
  submitting: boolean;
  onSubmit: (e: FormEvent) => void;
  onClose: () => void;
  onImageChange: (files: File[]) => void;
}

export default function ProductFormModal({
  formData,
  setFormData,
  editingId,
  imageFiles,
  submitting,
  onSubmit,
  onClose,
  onImageChange,
}: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-[#141718]">
            {editingId ? "Edit Product" : "Add New Product"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <ProductFormFields
            formData={formData}
            setFormData={setFormData}
            editingId={editingId}
            imageFiles={imageFiles}
            onImageChange={onImageChange}
          />
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-[#141718] text-white rounded-lg text-sm font-medium hover:bg-black transition-colors disabled:opacity-50"
            >
              {submitting
                ? "Saving..."
                : editingId
                  ? "Update Product"
                  : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
