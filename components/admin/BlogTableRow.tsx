"use client";
import { Edit2, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { Blog } from "@/types/blog";

interface Props {
    blog: Blog;
    onEdit: (b: Blog) => void;
    onDelete: (id: number) => void;
    deleting: boolean;
}

export default function BlogTableRow({ blog, onEdit, onDelete, deleting }: Props) {
    return (
        <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        <img
                            src={blog.img}
                            alt={blog.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <div className="font-medium text-[#141718] line-clamp-1 max-w-[200px]">
                            {blog.title}
                        </div>
                        <div className="text-xs text-[#6C7275]">ID: {blog.id}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="px-2.5 py-1 bg-gray-100 text-[#141718] rounded-full text-[11px] font-medium uppercase">
                    {blog.author || "admin"}
                </span>
            </td>
            <td className="px-6 py-4 text-[#6C7275]">
                {new Date(blog.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                })}
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <Link
                        href={`/blogs/${blog.id}`}
                        target="_blank"
                        className="p-2 text-[#6C7275] hover:text-[#141718] hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Blog"
                    >
                        <Eye size={18} />
                    </Link>
                    <button
                        onClick={() => onEdit(blog)}
                        className="p-2 text-[#6C7275] hover:text-[#141718] hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit Blog"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button
                        onClick={() => onDelete(blog.id)}
                        disabled={deleting}
                        className="p-2 text-[#6C7275] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete Blog"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </td>
        </tr>
    );
}
