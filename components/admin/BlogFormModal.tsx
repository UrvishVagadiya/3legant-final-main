import React, { FormEvent } from "react";
import { X, Eye, FileEdit } from "lucide-react";
import { BlogFormData } from "@/types/blog";
import BlogFormFields from "./BlogFormFields";
import BlogPreview from "./BlogPreview";


interface Props {
  formData: BlogFormData;
  setFormData: React.Dispatch<React.SetStateAction<BlogFormData>>;
  editingId: number | null;
  imageFile: File | null;
  submitting: boolean;
  onSubmit: (e: FormEvent) => void;
  onClose: () => void;
  onImageChange: (file: File | null) => void;
  isPreview: boolean;
  setIsPreview: (v: boolean) => void;
  previewUrl: string | null;
}

export default function BlogFormModal({
  formData,
  setFormData,
  editingId,
  imageFile,
  submitting,
  onSubmit,
  onClose,
  onImageChange,
  isPreview,
  setIsPreview,
  previewUrl,
}: Props) {
  if (isPreview) {
    return (
      <div className="fixed inset-0 bg-white z-[60] overflow-y-auto">
        <BlogPreview
          data={formData}
          imagePreview={previewUrl}
          onBack={() => setIsPreview(false)}
        />
        <div className="fixed bottom-6 right-6 flex gap-3">
          <button
            onClick={() => setIsPreview(false)}
            className="flex items-center gap-2 px-6 py-3 bg-[#141718] text-white rounded-full shadow-lg hover:scale-105 transition-transform"
          >
            <FileEdit size={18} /> Back to Editor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-[#141718]">
            {editingId ? "Edit Blog" : "Add New Blog"}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPreview(true)}
              className="px-3 py-1.5 text-xs font-bold text-[#141718] border border-gray-200 rounded-md hover:bg-gray-50 flex items-center gap-1.5"
            >
              <Eye size={14} /> Preview
            </button>
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
            imageFile={imageFile}
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
                  ? "Update Blog"
                  : "Add Blog"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
