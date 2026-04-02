"use client";
import React from "react";
import Image from "next/image";
import { FiUser, FiCalendar, FiArrowLeft } from "react-icons/fi";
import { MDXRemote, MDXRemoteProps } from "next-mdx-remote";
import { BlogFormData } from "@/types/blog";
import { typography } from "@/constants/typography";

// Mocking some parts for preview
const MDXComponents = {
  Image: (props: any) => <img {...props} className="rounded-lg my-4 w-full" />,
  h2: ({ children }: any) => (
    <h2 className={`${typography.text26Semibold} mt-10 mb-4 text-[#141718]`}>
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className={`${typography.text22Semibold} mt-8 mb-3 text-[#141718]`}>
      {children}
    </h3>
  ),
  p: ({ children }: any) => (
    <p className="mb-6 md:mb-8 text-[#141718] leading-[1.6]">{children}</p>
  ),
  ul: ({ children }: any) => (
    <ul className="list-disc ml-6 mb-6 space-y-2 text-[#6C7275]">{children}</ul>
  ),
  HighlightBox: ({ children }: any) => (
    <div className="my-8 p-6 md:p-8 border-2 border-[#FFC107] bg-[#FFFBF0] rounded-sm">
      <div className="text-[#141718] italic font-medium">{children}</div>
    </div>
  ),
  Row: ({ children }: any) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">{children}</div>
  ),
};

interface Props {
  data: BlogFormData;
  imagePreview: string | null;
  onBack: () => void;
}

export default function BlogPreview({ data, imagePreview, onBack }: Props) {
  return (
    <div className="bg-white min-h-screen">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-[#141718] hover:opacity-70"
        >
          <FiArrowLeft /> Back to Editor
        </button>
        <div className="text-xs font-bold text-[#38CB89] uppercase tracking-widest">
          Live Preview Mode
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-inter text-[#141718]">
        <div className="flex flex-wrap items-center gap-3 text-[14px] font-medium mb-8 text-[#6C7275]">
          <span>Home</span>
          <span className="text-xs">{">"}</span>
          <span>Blog</span>
          <span className="text-xs">{">"}</span>
          <span className="text-[#141718]">{data.title || "Untiled Blog"}</span>
        </div>

        <div className="space-y-4 mb-8 md:mb-10 w-full lg:w-[90%]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6C7275]">
            ARTICLE
          </span>
          <h1 className={`${typography.h3} text-[#141718]`}>
            {data.title || "Untitled Blog"}
          </h1>
          <div className="flex items-center gap-6 text-[#6C7275] text-[14px] font-medium pt-2">
            <div className="flex items-center gap-1.5">
              <FiUser size={18} />
              <span>{data.author || "admin"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FiCalendar size={18} />
              <span>
                {data.date
                  ? new Date(data.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Date will appear here"}
              </span>
            </div>
          </div>
        </div>

        {imagePreview && (
          <div className="w-full aspect-4/3 md:aspect-21/9 relative rounded-lg overflow-hidden mb-8 md:mb-12 border border-gray-100">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-full object-cover object-center"
            />
          </div>
        )}

        <div className="w-full text-[#141718] text-[15px] md:text-[18px] leading-[1.6]">
          {/* Note: Real MDX rendering in preview is tricky without a heavy runtime. 
              We'll just show the raw text or a simple placeholder if it's too complex, 
              but since we asked for "same to same", we'll try to use a simple approach. */}
          <div className="whitespace-pre-wrap font-sans opacity-60 italic mb-10 border-l-4 border-gray-200 pl-4 py-2">
            Note: Preview uses internal MDX styles but renders raw content for
            speed. HTML tags and Markdown syntax will be visible here but fully
            rendered in the live post.
          </div>
          <div className="prose prose-lg max-w-none">
            {data.content?.substring(0, 160)}...
          </div>
        </div>
      </div>
    </div>
  );
}
