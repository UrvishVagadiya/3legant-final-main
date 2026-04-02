import React, { ChangeEvent, useEffect } from "react";
import { RefreshCcw, Plus, X } from "lucide-react";
import { ProductFormData } from "./ProductFormModal";

import { ProductCategory, ProductColor } from "./ProductTableRow";

const categories: ProductCategory[] = [
  "Living Room",
  "Bedroom",
  "Kitchen",
  "Bathroom",
  "Dinning",
  "Outdoor",
];
const colorOptions: ProductColor[] = [
  "Black",
  "White",
  "Brown",
  "Red",
  "Blue",
  "Green",
  "Gray",
  "Beige",
  "Navy",
  "Pink",
  "Yellow",
  "Orange",
  "Purple",
  "Cream",
  "Walnut",
  "Natural",
];

const PreviewImage = ({ file }: { file: File }) => {
    const [preview, setPreview] = React.useState<string>("");
    
    useEffect(() => {
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    if (!preview) return null;
    return <img src={preview} alt="Preview" className="w-full h-full object-cover" />;
};

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

const CheckboxGroup = ({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) => (
  <div>
    <label className="block text-xs font-semibold text-[#6C7275] mb-2 uppercase">
      {label}
    </label>
    <div className="grid grid-cols-3 gap-2">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={selected.includes(opt)}
            onChange={(e) =>
              onChange(
                e.target.checked
                  ? [...selected, opt]
                  : selected.filter((x) => x !== opt),
              )
            }
            className="w-4 h-4 rounded border-gray-300"
          />
          {opt}
        </label>
      ))}
    </div>
  </div>
);

interface Props {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  editingId: string | null;
  imageFiles: File[];
  onImageChange: (files: File[]) => void;
}

export default function ProductFormFields({
  formData,
  setFormData,
  editingId,
  imageFiles,
  onImageChange,
}: Props) {
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((p) => ({
      ...p,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const generateSku = () => {
    const categoryPrefix = formData.category.length > 0 
      ? formData.category[0].substring(0, 3).toUpperCase() 
      : "GEN";
    const titlePrefix = formData.title 
      ? formData.title.substring(0, 3).toUpperCase().padEnd(3, 'X') 
      : "PRD";
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return `${categoryPrefix}-${titlePrefix}-${randomPart}`;
  };

  useEffect(() => {
    if (!editingId && !formData.sku && formData.title) {
        setFormData(prev => ({ ...prev, sku: generateSku() }));
    }
  }, [formData.title, editingId]);

  const handleMultipleFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newFiles = [...imageFiles.filter(f => f !== null), ...selectedFiles].slice(0, 6);
    onImageChange(newFiles);
  };

  const removeImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    onImageChange(newFiles);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-[#6C7275] uppercase">
            Product Images (Max 6)
          </label>
          <span className="text-[10px] text-gray-400">
            {imageFiles.filter(f => f !== null).length} / 6 Selected
          </span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {/* Upload Button */}
          {imageFiles.length < 6 && (
            <label className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 cursor-pointer transition-colors aspect-square">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                <Plus size={16} />
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase">Upload Files</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleMultipleFilesChange}
                className="hidden"
              />
            </label>
          )}

          {/* Previews */}
          {imageFiles.map((file, i) => (
            <div key={`${file.name}-${i}`} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100 bg-white">
              <PreviewImage file={file} />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-white/90 rounded text-[8px] font-bold uppercase shadow-sm">
                {i === 0 ? "Main" : `View ${i}`}
              </div>
            </div>
          ))}

          {/* Placeholders for remaining slots */}
          {Array.from({ length: Math.max(0, 6 - imageFiles.length - (imageFiles.length < 6 ? 1 : 0)) }).map((_, i) => (
            <div key={`placeholder-${i}`} className="aspect-square rounded-xl bg-gray-50/50 border border-dashed border-gray-100" />
          ))}
        </div>
      </div>
      <Input
        label="Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        required
      />
      <div>
        <label className="block text-xs font-semibold text-[#6C7275] mb-1 uppercase">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#141718] resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Price"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
        />
        <Input
          label="MRP (Optional)"
          name="mrp"
          type="number"
          value={formData.mrp}
          onChange={handleChange}
          min="0"
          step="0.01"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Measurements"
          name="measurements"
          value={formData.measurements}
          onChange={handleChange}
          placeholder="e.g. 120x60x45 cm"
        />
        <Input
          label="Weight"
          name="weight"
          value={formData.weight}
          onChange={handleChange}
          placeholder="e.g. 5.2 kg"
        />
      </div>
      <div>
        <Input
          label="Offer Valid Until"
          name="valid_until"
          type="datetime-local"
          value={formData.valid_until}
          onChange={handleChange}
        />
        <p className="text-xs text-[#6C7275] mt-1">
          Leave empty for no offer countdown
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <Input
            label="SKU"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
          />
          <button
            type="button"
            onClick={() => setFormData(p => ({ ...p, sku: generateSku() }))}
            className="absolute right-3 top-7 text-gray-400 hover:text-[#141718] transition-colors"
            title="Regenerate SKU"
          >
            <RefreshCcw size={14} />
          </button>
        </div>
        <Input
          label="Stock"
          name="stock"
          type="number"
          value={formData.stock}
          onChange={handleChange}
          min="0"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#6C7275] mb-1 uppercase">
          Status
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#141718]"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <CheckboxGroup
        label="Categories"
        options={categories}
        selected={formData.category}
        onChange={(v) => setFormData((p) => ({ ...p, category: v }))}
      />
      <CheckboxGroup
        label="Colors"
        options={colorOptions}
        selected={formData.color}
        onChange={(v) => setFormData((p) => ({ ...p, color: v }))}
      />
    </>
  );
}
