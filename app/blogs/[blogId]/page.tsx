import Link from "next/link";
import { FiUser, FiCalendar } from "react-icons/fi";
import { ArrowLeft } from "lucide-react";
import SuggestedArticles from "@/components/sections/SuggestedArticles";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { Blog } from "@/types/blog";

export const dynamic = "force-dynamic";

const normalizeContentLayout = (content: string) => {
  return content.replace(
    /!\[[^\]]*\]\(([^)]+)\)\s*\n\s*!\[[^\]]*\]\(([^)]+)\)/g,
    (_match, left, right) => `<ImageRow left="${left}" right="${right}" />`,
  );
};

const buildContentFromSections = (blog: Blog) => {
  const parts: string[] = [];

  const intro = String(blog.intro || "").trim();
  if (intro) {
    parts.push(intro);
  }

  for (const section of blog.sections || []) {
    const title = String(section.title || "").trim();
    const content = String(section.content || "").trim();
    const image = String(section.image || "").trim();
    const image2 = String(section.image2 || "").trim();
    const title1 = String(section.title1 || "").trim();
    const content1 = String(section.content1 || "").trim();
    const title2 = String(section.title2 || "").trim();
    const content2 = String(section.content2 || "").trim();

    if (title) {
      parts.push(`## ${title}`);
    }
    if (content) {
      parts.push(content);
    }

    if (image && image2) {
      parts.push(`![section image](${image})\n![section image](${image2})`);
    } else if (image) {
      parts.push(`![section image](${image})`);
    }

    if (title1) {
      parts.push(`### ${title1}`);
    }
    if (content1) {
      parts.push(content1);
    }
    if (title2) {
      parts.push(`### ${title2}`);
    }
    if (content2) {
      parts.push(content2);
    }
  }

  return parts.join("\n\n").trim();
};

const getBlogRenderSource = (blog: Blog) => {
  const content = String(blog.content || "").trim();
  const sectionsContent = buildContentFromSections(blog);

  // Keep authored markdown when it is rich enough; otherwise build from sections.
  if (content.length >= 180) {
    return content;
  }

  if (sectionsContent) {
    if (!content) return sectionsContent;
    return `${content}\n\n${sectionsContent}`.trim();
  }

  return content;
};

const MDXComponents = {
  Link,
  h2: ({ children }: { children?: ReactNode }) => (
    <h2 className="mt-8 mb-3 text-[28px] md:text-[32px] lg:text-[38px] leading-[1.15] tracking-[-0.02em] font-medium text-[#141718]">
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: ReactNode }) => (
    <h3 className="mt-7 mb-3 text-[24px] md:text-[28px] lg:text-[34px] leading-[1.2] tracking-[-0.02em] font-medium text-[#141718]">
      {children}
    </h3>
  ),
  p: ({ children }: { children?: ReactNode }) => (
    <p className="mb-6 text-[15px] md:text-[17px] text-[#343839] leading-[1.65]">
      {children}
    </p>
  ),
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="list-disc ml-6 mb-7 space-y-2.5 text-[#343839] text-[15px] md:text-[17px] leading-[1.65]">
      {children}
    </ul>
  ),
  img: ({ src, alt }: ComponentPropsWithoutRef<"img">) => (
    <img
      src={src || ""}
      alt={alt || "Blog image"}
      className="w-full h-auto object-cover my-6"
    />
  ),
  ImageRow: ({ left, right }: { left?: string; right?: string }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 my-6 md:my-8">
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-7 my-8 md:my-10 items-start">
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
          <h3 className="text-[26px] md:text-[30px] lg:text-[36px] leading-[1.12] tracking-[-0.02em] font-medium text-[#141718] mb-3">
            {title1}
          </h3>
        ) : null}
        {content1 ? (
          <p className="text-[15px] md:text-[17px] text-[#343839] leading-[1.65] mb-7">
            {content1}
          </p>
        ) : null}
        {title2 ? (
          <h3 className="text-[26px] md:text-[30px] lg:text-[36px] leading-[1.12] tracking-[-0.02em] font-medium text-[#141718] mb-3">
            {title2}
          </h3>
        ) : null}
        {content2 ? (
          <p className="text-[15px] md:text-[17px] text-[#343839] leading-[1.65]">
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

  const typedBlog = blog as Blog | null;

  if (blogError || !typedBlog) {
    return notFound();
  }

  const { data: suggestedData } = await supabase
    .from("blogs")
    .select("id, title, img, date")
    .neq("id", parseId)
    .limit(3);

  const suggested = suggestedData || [];
  const renderSource = getBlogRenderSource(typedBlog);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 pt-5 md:pt-6 text-[#141718]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 text-[13px] md:text-[15px] font-medium text-[#6C7275] hover:text-[#141718] transition-colors"
          >
            <ArrowLeft size={16} />
            back
          </Link>
        </div>

        <div className="space-y-3.5 mb-8">
          <span className="text-[12px] md:text-[13px] font-semibold uppercase tracking-[0.12em] text-[#6C7275]">
            ARTICLE
          </span>
          <h1 className="max-w-260 text-[34px] sm:text-[40px] md:text-[46px] lg:text-[56px] xl:text-[64px] leading-[1.08] lg:leading-[1.06] tracking-[-0.03em] font-medium text-[#141718] wrap-anywhere">
            {typedBlog.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 md:gap-5 text-[#6C7275] text-[13px] md:text-[15px] font-medium pt-1">
            <div className="flex items-center gap-1.5">
              <FiUser size={15} className="text-[#6C7275]" />
              <span>{typedBlog.author || "admin"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FiCalendar size={15} className="text-[#6C7275]" />
              <span>
                {new Date(typedBlog.date).toLocaleDateString("en-US", {
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
            src={typedBlog.img}
            alt={typedBlog.title}
            className="w-full h-auto object-cover"
          />
        </div>

        <article className="w-full">
          <MDXRemote
            source={normalizeContentLayout(renderSource)}
            components={MDXComponents}
          />
        </article>
      </div>

      <div className="max-w-7xl">
        <SuggestedArticles articles={suggested} />
      </div>
    </div>
  );
};

export default BlogPost;
