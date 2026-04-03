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
import toast from "react-hot-toast";

const buildContentFromForm = (formData: BlogFormData) => {
  const escapeMdxAttr = (value: string) =>
    value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

  const section1 = formData.sections[0];
  const section2 = formData.sections[1];
  const section3 = formData.sections[2];
  const section4 = formData.sections[3];
  const blocks: string[] = [];

  if (formData.intro?.trim()) {
    blocks.push(formData.intro.trim());
  }

  if (section1?.title?.trim()) {
    blocks.push(`## ${section1.title.trim()}`);
  }

  if (section1?.content?.trim()) {
    blocks.push(section1.content.trim());
  }

  if (section2?.title?.trim()) {
    blocks.push(`## ${section2.title.trim()}`);
  }

  if (section2?.content?.trim()) {
    blocks.push(section2.content.trim());
  }

  if (section3?.title?.trim()) {
    blocks.push(`## ${section3.title.trim()}`);
  }

  if (section3?.content?.trim()) {
    blocks.push(section3.content.trim());
  }

  const rowLeft = section3?.image?.trim() || "";
  const rowRight = section3?.image2?.trim() || "";
  if (rowLeft || rowRight) {
    blocks.push(
      `<ImageRow left="${escapeMdxAttr(rowLeft)}" right="${escapeMdxAttr(rowRight)}" />`,
    );
  }

  const splitImage = section4?.image?.trim() || "";
  const splitTitle1 = section4?.title1?.trim() || "";
  const splitContent1 = section4?.content1?.trim() || "";
  const splitTitle2 = section4?.title2?.trim() || "";
  const splitContent2 = section4?.content2?.trim() || "";

  if (
    splitImage ||
    splitTitle1 ||
    splitContent1 ||
    splitTitle2 ||
    splitContent2
  ) {
    blocks.push(
      `<SplitFeature image="${escapeMdxAttr(splitImage)}" title1="${escapeMdxAttr(splitTitle1)}" content1="${escapeMdxAttr(splitContent1)}" title2="${escapeMdxAttr(splitTitle2)}" content2="${escapeMdxAttr(splitContent2)}" />`,
    );
  }

  return blocks.join("\n\n");
};

const getErrorMessage = (err: unknown) => {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;

  const maybeObj = err as {
    message?: string;
    error?: string;
    data?: { message?: string };
  };

  return (
    maybeObj.message ||
    maybeObj.error ||
    maybeObj.data?.message ||
    "Blog save failed. Please check required fields and DB policies."
  );
};

const normalizeFormData = (formData: Partial<BlogFormData> | undefined) => ({
  ...emptyBlogForm,
  ...formData,
  title: formData?.title ?? "",
  img: formData?.img ?? "",
  author: formData?.author ?? "admin",
  date: formData?.date ?? new Date().toISOString().split("T")[0],
  intro: formData?.intro ?? "",
  sections: Array.isArray(formData?.sections)
    ? formData!.sections
    : emptyBlogForm.sections,
});

const pickFirstNonEmpty = (values: Array<string | undefined>) => {
  for (const value of values) {
    const trimmed = String(value ?? "").trim();
    if (trimmed) return trimmed;
  }
  return "";
};

export default function AdminBlogs() {
  const { data: blogs = [], isLoading: loading } = useGetBlogsQuery();
  const [addBlogMutation] = useAddBlogMutation();
  const [updateBlogMutation] = useUpdateBlogMutation();
  const [deleteBlogMutation] = useDeleteBlogMutation();

  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [formData, setFormData] = React.useState<BlogFormData>(emptyBlogForm);
  const [submitting, setSubmitting] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const openEditForm = (b: Blog) => {
    setEditingId(b.id);
    setFormData({
      title: b.title || "",
      img: b.img || "",
      author: b.author || "admin",
      date: b.date ? new Date(b.date).toISOString().split("T")[0] : "",
      intro: b.intro || "",
      sections: Array.isArray(b.sections) ? b.sections : emptyBlogForm.sections,
    });
    setShowForm(true);
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData({
      ...emptyBlogForm,
      sections: emptyBlogForm.sections.map((s) => ({ ...s })),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const safeFormData = normalizeFormData(formData);
      const title = pickFirstNonEmpty([
        safeFormData.title,
        safeFormData.sections[0]?.title,
        safeFormData.sections[1]?.title,
        safeFormData.sections[2]?.title,
        safeFormData.sections[3]?.title1,
      ]);
      const img = pickFirstNonEmpty([
        safeFormData.img,
        safeFormData.sections[3]?.image,
        safeFormData.sections[2]?.image,
        safeFormData.sections[2]?.image2,
      ]);
      const content = buildContentFromForm(safeFormData);

      if (!title || !img) {
        toast.error("Please fill blog title and at least one image URL");
        return;
      }

      if (!content.trim()) {
        toast.error("Please add blog content in intro or sections");
        return;
      }

      const blogData = {
        title,
        img,
        author: String(safeFormData.author || "admin").trim() || "admin",
        content,
        date: safeFormData.date
          ? new Date(safeFormData.date).toISOString()
          : new Date().toISOString(),
      };

      if (editingId) {
        await updateBlogMutation({ id: editingId, updates: blogData }).unwrap();
      } else {
        await addBlogMutation(blogData).unwrap();
      }

      setShowForm(false);
      setFormData(emptyBlogForm);
      setEditingId(null);
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      console.error("Failed to save blog:", err, message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this blog?")) {
      await deleteBlogMutation(id).unwrap();
    }
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
          submitting={submitting}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
