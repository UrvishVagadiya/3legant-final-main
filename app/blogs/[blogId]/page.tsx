import Link from "next/link";
import { FiUser, FiCalendar } from "react-icons/fi";
import SuggestedArticles from "@/components/sections/SuggestedArticles";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const normalizeContentLayout = (content: string) => {
  return content.replace(
    /!\[[^\]]*\]\(([^)]+)\)\s*\n\s*!\[[^\]]*\]\(([^)]+)\)/g,
    (_match, left, right) => `<ImageRow left="${left}" right="${right}" />`,
  );
};

const MDXComponents = {
  Link,
  h2: ({ children }: any) => (
    <h2 className="mt-7 mb-2 text-[30px] leading-[1.15] tracking-[-0.02em] font-medium text-[#141718]">
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="mt-6 mb-2 text-[28px] leading-[1.2] tracking-[-0.02em] font-medium text-[#141718]">
      {children}
    </h3>
  ),
  p: ({ children }: any) => (
    <p className="mb-5 text-[12px] md:text-[13px] text-[#343839] leading-[1.45]">
      {children}
    </p>
  ),
  ul: ({ children }: any) => (
    <ul className="list-disc ml-6 mb-6 space-y-2 text-[#343839] text-[13px]">
      {children}
    </ul>
  ),
  img: ({ src, alt }: any) => (
    <img
      src={src || ""}
      alt={alt || "Blog image"}
      className="w-full h-auto object-cover my-6"
    />
  ),
  ImageRow: ({ left, right }: { left?: string; right?: string }) => (
    <div className="grid grid-cols-2 gap-4 md:gap-5 my-6 md:my-8">
      <div className="bg-[#F3F5F7] min-h-60">
        {left ? (
          <img
            src={left}
            alt="Blog section image"
            className="w-full h-full object-cover"
          />
        ) : null}
      </div>
      <div className="bg-[#F3F5F7] min-h-60">
        {right ? (
          <img
            src={right}
            alt="Blog section image"
            className="w-full h-full object-cover"
          />
        ) : null}
      </div>
    </div>
  ),
  SplitFeature: ({
    image,
    title1,
    content1,
    title2,
    content2,
  }: {
    image?: string;
    title1?: string;
    content1?: string;
    title2?: string;
    content2?: string;
  }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-7 my-8 md:my-10 items-start">
      <div className="bg-[#F3F5F7] min-h-80 md:min-h-95">
        {image ? (
          <img
            src={image}
            alt="Featured blog section"
            className="w-full h-full object-cover"
          />
        ) : null}
      </div>
      <div className="pt-1">
        {title1 ? (
          <h3 className="text-[30px] leading-[1.12] tracking-[-0.02em] font-medium text-[#141718] mb-2">
            {title1}
          </h3>
        ) : null}
        {content1 ? (
          <p className="text-[12px] md:text-[13px] text-[#343839] leading-[1.45] mb-6">
            {content1}
          </p>
        ) : null}
        {title2 ? (
          <h3 className="text-[30px] leading-[1.12] tracking-[-0.02em] font-medium text-[#141718] mb-2">
            {title2}
          </h3>
        ) : null}
        {content2 ? (
          <p className="text-[12px] md:text-[13px] text-[#343839] leading-[1.45]">
            {content2}
          </p>
        ) : null}
      </div>
    </div>
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
    <div className="max-w-295 mx-auto px-4 sm:px-6 lg:px-8 mb-20 mt-8 text-[#141718]">
      <div className="max-w-245 mx-auto">
        <div className="flex flex-wrap items-center gap-3 text-[12px] font-medium mb-7 text-[#6C7275]">
          <Link href="/" className="hover:text-[#141718] transition-colors">
            Home
          </Link>
          <span className="text-[10px]">{">"}</span>
          <Link
            href="/blogs"
            className="hover:text-[#141718] transition-colors"
          >
            Blog
          </Link>
          <span className="text-[10px]">{">"}</span>
          <span className="text-[#141718]">{blog.title}</span>
        </div>

        <div className="space-y-3 mb-7">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6C7275]">
            ARTICLE
          </span>
          <h1 className="max-w-190 text-[44px] md:text-[58px] leading-[1.04] tracking-[-0.03em] font-medium text-[#141718]">
            {blog.title}
          </h1>
          <div className="flex items-center gap-5 text-[#6C7275] text-[12px] font-medium pt-1">
            <div className="flex items-center gap-1.5">
              <FiUser size={15} className="text-[#6C7275]" />
              <span>{blog.author || "admin"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FiCalendar size={15} className="text-[#6C7275]" />
              <span>
                {new Date(blog.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="w-full h-auto mb-6 md:mb-8 bg-[#F3F5F7]">
          <img
            src={blog.img}
            alt={blog.title}
            className="w-full h-auto object-cover"
          />
        </div>

        <article className="w-full">
          <MDXRemote
            source={normalizeContentLayout(blog.content || "")}
            components={MDXComponents}
          />
        </article>
      </div>

      <div className="max-w-245 mx-auto">
        <SuggestedArticles articles={suggested} />
      </div>
    </div>
  );
};

export default BlogPost;
