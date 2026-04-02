import Link from "next/link";
import Image from "next/image";
import { FiUser, FiCalendar } from "react-icons/fi";
import SuggestedArticles from "@/components/sections/SuggestedArticles";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import { typography } from "@/constants/typography";

export const dynamic = "force-dynamic";

const MDXComponents = {
  Image,
  Link,
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

const BlogPost = async ({
  params,
}: {
  params: Promise<{ blogId: string }>;
}) => {
  const { blogId } = await params;
  const parseId = parseInt(blogId);
  const supabase = await createClient(cookies());

  const { data: blog, error: blogError } = await supabase
    .from("blogs")
    .select("*")
    .eq("id", parseId)
    .single();

  if (blogError || !blog) {
    return notFound();
  }

  const { data: suggestedData } = await supabase
    .from("blogs")
    .select("id, title, img, date")
    .neq("id", parseId)
    .limit(3);

  const suggested = suggestedData || [];

  return (
    <div className="max-w-310 mx-auto px-4 sm:px-6 lg:px-8 mb-20 mt-8 font-inter text-[#141718]">
      <div className="flex flex-wrap items-center gap-3 text-[14px] font-medium mb-8 text-[#6C7275]">
        <Link href="/" className="hover:text-[#141718] transition-colors">
          Home
        </Link>
        <span className="text-xs">{">"}</span>
        <Link href="/blogs" className="hover:text-[#141718] transition-colors">
          Blog
        </Link>
        <span className="text-xs">{">"}</span>
        <span className="text-[#141718]">{blog.title}</span>
      </div>

      <div className="space-y-4 mb-8 md:mb-10 w-full lg:w-[85%]">
        <span className="text-xs font-bold uppercase tracking-wider text-[#6C7275]">
          ARTICLE
        </span>
        <h1 className={`${typography.h3} text-[#141718]`}>{blog.title}</h1>
        <div className="flex items-center gap-6 text-[#6C7275] text-[14px] font-medium pt-2">
          <div className="flex items-center gap-1.5">
            <FiUser size={18} className="text-[#6C7275]" />
            <span>{blog.author || "admin"}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiCalendar size={18} className="text-[#6C7275]" />
            <span>
              {new Date(blog.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full aspect-4/3 md:aspect-21/9 relative rounded-lg overflow-hidden mb-8 md:mb-12">
        <Image
          src={blog.img}
          alt={blog.title}
          fill
          className="object-cover object-center"
        />
      </div>

      <div className="w-full text-[#141718] text-[15px] md:text-[18px] leading-[1.6]">
        <MDXRemote source={blog.content} components={MDXComponents} />
      </div>

      <SuggestedArticles articles={suggested} />
    </div>
  );
};

export default BlogPost;
