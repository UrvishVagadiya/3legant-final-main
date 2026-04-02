"use client";
import React from "react";
import { Plus, Search, FileText } from "lucide-react";
import BlogFormModal from "@/components/admin/BlogFormModal";
import BlogTableRow from "@/components/admin/BlogTableRow";
import {
  useGetBlogsQuery,
  useAddBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} from "@/store/api/blogApi";
import { BlogFormData, emptyBlogForm, Blog } from "@/types/blog";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";

export default function AdminBlogs() {
  const { data: blogs = [], isLoading: loading } = useGetBlogsQuery();
  const [addBlogMutation] = useAddBlogMutation();
  const [updateBlogMutation] = useUpdateBlogMutation();
  const [deleteBlogMutation] = useDeleteBlogMutation();

  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [formData, setFormData] = React.useState<BlogFormData>(emptyBlogForm);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const openEditForm = (b: Blog) => {
    setEditingId(b.id);
    setFormData({
      title: b.title || "",
      author: b.author || "admin",
      date: b.date || new Date().toISOString(),
      content: b.content || "",
    });
    setImageFile(null);
    setShowForm(true);
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData(emptyBlogForm);
    setImageFile(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const supabase = createClient();
      let imageUrl = editingId
        ? blogs.find((b) => b.id === editingId)?.img
        : "";

      if (imageFile) {
        const fileName = `blog-${Date.now()}-${imageFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("product_img")
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        imageUrl = supabase.storage.from("product_img").getPublicUrl(fileName)
          .data.publicUrl;
      }

      if (!editingId && !imageUrl) {
        toast.error("Please upload an image");
        setSubmitting(false);
        return;
      }

      const blogData = {
        ...formData,
        img: imageUrl,
      };

      if (editingId) {
        await updateBlogMutation({ id: editingId, updates: blogData }).unwrap();
      } else {
        await addBlogMutation(blogData).unwrap();
      }

      setShowForm(false);
      setFormData(emptyBlogForm);
      setEditingId(null);
      setImageFile(null);
    } catch (err: any) {
      console.error("Failed to save blog:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this blog?")) {
      await deleteBlogMutation(id).unwrap();
    }
  };

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
  };

  const filtered = blogs.filter(
    (b) =>
      b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) return <div className="text-[#6C7275]">Loading blogs...</div>;

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
            placeholder="Search blogs by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#141718]"
          />
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 bg-[#141718] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-black transition-colors"
        >
          <Plus size={18} /> Add Blog
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-[#6C7275]">
              <tr>
                {["Blog", "Author", "Date", "Actions"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <BlogTableRow
                  key={b.id}
                  blog={b}
                  onEdit={openEditForm}
                  onDelete={handleDelete}
                  deleting={false}
                />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-[#6C7275]"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <FileText size={40} className="text-gray-200" />
                      <p>No blogs found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <BlogFormModal
          formData={formData}
          setFormData={setFormData}
          editingId={editingId}
          imageFile={imageFile}
          submitting={submitting}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
          onImageChange={handleImageChange}
        />
      )}
    </div>
  );
}
