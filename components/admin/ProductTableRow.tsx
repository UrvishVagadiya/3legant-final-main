"use client";
import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";

export type ProductCategory =
  | "Living Room"
  | "Bedroom"
  | "Kitchen"
  | "Bathroom"
  | "Dinning"
  | "Outdoor";

export type ProductColor =
  | "Black"
  | "White"
  | "Brown"
  | "Red"
  | "Blue"
  | "Green"
  | "Gray"
  | "Beige"
  | "Navy"
  | "Pink"
  | "Yellow"
  | "Orange"
  | "Purple"
  | "Cream"
  | "Walnut"
  | "Natural";

export interface Product {
  id: string | number;
  img: string;
  title: string;
  price: number;
  mrp?: number | null;
  category: ProductCategory[] | string[] | string;
  created_at?: string;
  discount?: string | null;
  description?: string | null;
  color?: ProductColor[] | string[] | string;
  sku?: string | number | null;
  stock?: number;
  status?: string;
  measurements?: string | null;
  weight?: string | null;
  valid_until?: string | null;
}

interface Props {
  product: Product;
  onEdit: (p: Product) => void;
  onDelete: (id: string | number) => void;
  deleting: boolean;
}

export default function ProductTableRow({
  product,
  onEdit,
  onDelete,
  deleting,
}: Props) {
  const stockCount = product.stock ?? 0;

  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-gray-100 rounded shrink-0 overflow-hidden">
            {product.img && (
              <img
                src={product.img}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div>
            <p className="font-medium text-[#141718] line-clamp-1">
              {product.title}
            </p>
            <p className="text-xs text-[#6C7275] mt-0.5">
              {Array.isArray(product.category)
                ? product.category.join(", ")
                : product.category}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-[#6C7275]">{product.sku || "—"}</td>
      <td className="px-6 py-4">
        <span className="font-medium text-[#141718]">
          ${Number(product.price).toFixed(2)}
        </span>
        {product.mrp && (
          <span className="text-[#6C7275] line-through ml-2 text-xs">
            ${Number(product.mrp).toFixed(2)}
          </span>
        )}
      </td>
      <td className="px-6 py-4">
        <span
          className={`font-medium ${stockCount <= 0 ? "text-red-500" : stockCount <= 5 ? "text-yellow-600" : "text-[#141718]"}`}
        >
          {stockCount}
        </span>
      </td>
      <td className="px-6 py-4">
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${product.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {product.status || "active"}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(product)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-[#6C7275] hover:text-[#141718]"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(product.id)}
            disabled={deleting}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-[#6C7275] hover:text-red-600 disabled:opacity-50"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}
