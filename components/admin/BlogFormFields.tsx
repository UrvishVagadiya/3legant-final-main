"use client";
import React, { ChangeEvent } from "react";
import { BlogFormData } from "@/types/blog";

const Input = ({
  label,
  required,
  ...props
}: {
  label: string;
  required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div>
    <label className="block text-xs font-semibold text-[#6C7275] mb-1 uppercase">
      {label}
      {required && " *"}
    </label>
    <input
      {...props}
      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#141718]"
    />
  </div>
);

interface Props {
  formData: BlogFormData;
  setFormData: React.Dispatch<React.SetStateAction<BlogFormData>>;
  editingId: number | null;
  imageFile: File | null;
  onImageChange: (file: File | null) => void;
}

export default function BlogFormFields({
  formData,
  setFormData,
  editingId,
  imageFile,
  onImageChange,
}: Props) {
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((p: BlogFormData) => ({
      ...p,
      [name]: value,
    }));
  };

  return (
    <>
      <div className="space-y-4">
        <label className="block text-xs font-semibold text-[#6C7275] mb-2 uppercase">
          Blog Header Image
        </label>
        <div className="p-3 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onImageChange(e.target.files?.[0] || null)}
            className="text-[12px] w-full"
          />
          {imageFile && (
            <div className="text-[10px] text-green-600 mt-1 truncate">
              ✓ {imageFile.name}
            </div>
          )}
          {!imageFile && editingId && (
            <p className="text-[10px] text-[#6C7275] mt-1 italic">
              Leave empty to keep existing image
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <Input
          label="Author"
          name="author"
          value={formData.author}
          onChange={handleChange}
          required
        />
      </div>

      <Input
        label="Date"
        name="date"
        type="date"
        value={formData.date ? formData.date.split("T")[0] : ""}
        onChange={handleChange}
        required
      />


      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-semibold text-[#6C7275] uppercase">
            Main Content (MDX / HTML)
          </label>
          <span className="text-[10px] text-[#38CB89] font-bold uppercase underline cursor-help" title="h2, h3, p, img, a tags are supported. MDX components like <Image /> and <Link /> are also available.">
            MDX Supported
          </span>
        </div>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          rows={12}
          required
          placeholder="Use HTML/MDX tags. Example: 
<h2>Subheading</h2>
<p>Your paragraph here...</p>"
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#141718] font-mono leading-relaxed bg-gray-50/30"
        />
        <div className="mt-2 p-3 bg-[#F3F5F7] rounded-lg border border-gray-100">
            <p className="text-[11px] font-bold text-[#141718] mb-1 uppercase tracking-wider">Quick MDX Cheat Sheet:</p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-[#6C7275]">
                <li><code className="text-[#141718]">## Title</code> → H2 Subheading</li>
                <li><code className="text-[#141718]">### Title</code> → H3 Subheading</li>
                <li><code className="text-[#141718]">**text**</code> → Bold</li>
                <li><code className="text-[#141718]">[link](url)</code> → Link</li>
                <li><code className="text-[#141718]">&lt;img src="..." /&gt;</code> → Image</li>
                <li><code className="text-[#141718]">&lt;br/&gt;</code> → Line Break</li>
            </ul>
        </div>
      </div>
    </>
  );
}
