"use client";
import React from "react";
import { Plus, Search } from "lucide-react";
import ProductFormModal from "@/components/admin/ProductFormModal";
import ProductTableRow, { Product } from "@/components/admin/ProductTableRow";
import {
  useGetAdminProductsQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "@/store/api/productApi";
import {
  ProductFormData,
  emptyProductForm,
} from "@/components/admin/ProductFormModal";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";

export default function AdminProducts() {
  const { data: products = [], isLoading: loading } =
    useGetAdminProductsQuery();
  const [addProductMutation] = useAddProductMutation();
  const [updateProductMutation] = useUpdateProductMutation();
  const [deleteProductMutation] = useDeleteProductMutation();

  const [showFormState, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | number | null>(
    null,
  );
  const [formData, setFormData] =
    React.useState<ProductFormData>(emptyProductForm);
  const [imageFiles, setImageFiles] = React.useState<File[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | number | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = React.useState("");

  const openEditForm = (p: Product) => {
    setEditingId(p.id);
    setFormData({
      title: p.title || "",
      price: String(p.price || ""),
      mrp: p.mrp ? String(p.mrp) : "",
      category: Array.isArray(p.category)
        ? p.category
        : p.category
          ? [String(p.category)]
          : [],
      description: p.description || "",
      sku: p.sku ? String(p.sku) : "",
      stock: String(p.stock || 0),
      color: Array.isArray(p.color)
        ? p.color
        : p.color
          ? [String(p.color)]
          : [],
      status: p.status || "active",
      measurements: p.measurements || "",
      weight: p.weight || "",
      valid_until: p.valid_until ? p.valid_until.slice(0, 16) : "",
    });
    setImageFiles([]);
    setShowForm(true);
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData(emptyProductForm);
    setImageFiles([]);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const supabase = createClient();
      const imageUrls: string[] = [];

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const fileName = `${Date.now()}-${i}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("product_img")
          .upload(fileName, file);
        if (uploadError) throw uploadError;
        const publicUrl = supabase.storage
          .from("product_img")
          .getPublicUrl(fileName).data.publicUrl;
        imageUrls.push(publicUrl);
      }

      const priceNum = Number(formData.price);
      const mrpNum = formData.mrp ? Number(formData.mrp) : null;
      const productData: Partial<Product> & {
        images?: string[];
        img?: string;
      } = {
        title: formData.title,
        price: priceNum,
        category: formData.category as Product["category"],
        discount:
          mrpNum && mrpNum > priceNum
            ? `-${Math.round(((mrpNum - priceNum) / mrpNum) * 100)}%`
            : null,
        description: formData.description || null,
        sku: formData.sku || null,
        stock: Number(formData.stock) || 0,
        color: formData.color as Product["color"],
        status: formData.status,
        measurements: formData.measurements || null,
        weight: formData.weight || null,
        valid_until: formData.valid_until
          ? new Date(formData.valid_until).toISOString()
          : null,
      };
      if (mrpNum) productData.mrp = mrpNum;

      if (imageUrls.length > 0) {
        productData.img = imageUrls[0];
        productData.images = imageUrls;
      }

      if (editingId) {
        await updateProductMutation({ id: editingId, productData }).unwrap();
      } else {
        if (imageUrls.length === 0) {
          toast.error("Please select at least one image");
          setSubmitting(false);
          return;
        }
        await addProductMutation(productData).unwrap();
      }
      setShowForm(false);
      setFormData(emptyProductForm);
      setEditingId(null);
      setImageFiles([]);
    } catch (err: unknown) {
      console.error("Failed to save product:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        setDeletingId(id);
        await deleteProductMutation(String(id)).unwrap();
        toast.success("Product deleted successfully");
      } catch (err: unknown) {
        console.error("Failed to delete product:", err);
        const message =
          err instanceof Error ? err.message : "Failed to delete product";
        toast.error(message);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const filtered = products.filter(
    (p) =>
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(p.sku ?? "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  if (loading) return <div className="text-[#6C7275]">Loading products...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#141718]"
          />
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 bg-[#141718] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-black transition-colors"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-[#6C7275]">
              <tr>
                {["Product", "SKU", "Price", "Stock", "Status", "Actions"].map(
                  (h) => (
                    <th key={h} className="text-left px-6 py-3 font-medium">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <ProductTableRow
                  key={p.id}
                  product={p}
                  onEdit={openEditForm}
                  onDelete={handleDelete}
                  deleting={deletingId === p.id}
                />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-[#6C7275]"
                  >
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showFormState && (
        <ProductFormModal
          formData={formData}
          setFormData={setFormData}
          editingId={editingId}
          imageFiles={imageFiles}
          submitting={submitting}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
          onImageChange={setImageFiles}
        />
      )}
    </div>
  );
}
