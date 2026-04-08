import React, { FormEvent } from "react";
import { X } from "lucide-react";
import { BlogFormData } from "@/types/blog";
import BlogFormFields from "./BlogFormFields";

interface Props {
  formData: BlogFormData;
  setFormData: React.Dispatch<React.SetStateAction<BlogFormData>>;
  editingId: number | null;
  submitting: boolean;
  formError: string;
  onChange: () => void;
  onSubmit: (e: FormEvent) => void;
  onClose: () => void;
}

export default function BlogFormModal({
  formData,
  setFormData,
  editingId,
  submitting,
  formError,
  onChange,
  onSubmit,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-[#141718]">
            {editingId ? "Edit Blog" : "Add New Blog"}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X size={20} />
            </button>
          </div>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <BlogFormFields
            formData={formData}
            setFormData={setFormData}
            editingId={editingId}
            onChange={onChange}
          />
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {formError}
            </div>
          )}
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
                  ? "Update Blog"
                  : "Add Blog"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
