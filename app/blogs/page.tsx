"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { BsGrid3X3GapFill, BsGridFill } from "react-icons/bs";
import { PiColumnsFill, PiRowsFill } from "react-icons/pi";
import GridIconBar from "@/components/shop/GridIconBar";
import BlogSortMenu, {
  type BlogSortOption,
} from "@/components/sections/BlogSortMenu";
import {
  useGetBlogsQuery,
  useLazyGetBlogsPageQuery,
} from "@/store/api/blogApi";
import { typography } from "@/constants/typography";

import { Blog } from "@/types/blog";

const PAGE_SIZE = 9;

const desktopIcons = [
  { icon: <BsGrid3X3GapFill />, grid: 3 },
  { icon: <BsGridFill />, grid: 4 },
  { icon: <PiColumnsFill />, grid: 2 },
  { icon: <PiRowsFill />, grid: 1 },
];

const mobileIcons = [
  { icon: <PiColumnsFill />, grid: 2 },
  { icon: <PiRowsFill />, grid: 1 },
];

const getBlogExcerpt = (article: Blog) => {
  const fallback = [
    article.intro,
    ...(article.sections || []).flatMap((section) => [
      section.content,
      section.content1,
      section.content2,
    ]),
  ]
    .find((part) => String(part || "").trim().length > 0)
    ?.toString();

  const raw = (article.content || fallback || "").replace(/[#*`]/g, "");
  if (!raw.trim()) return "";
  return `${raw.substring(0, 160)}...`;
};

const getFeaturedBlogs = (items: Blog[]) => {
  const featuredByCategory = items.filter(
    (blog) => String(blog.category || "").toLowerCase() === "featured",
  );

  if (featuredByCategory.length > 0) {
    return [...featuredByCategory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }

  return [...items]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
};

const Blogs = () => {
  const [fetchBlogsPage] = useLazyGetBlogsPageQuery();
  const { data: allBlogs = [] } = useGetBlogsQuery();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadedCount, setLoadedCount] = useState<number>(0);
  const [viewGrid, setViewGrid] = useState<number>(3);
  const [mobileViewGrid, setMobileViewGrid] = useState<number>(1);
  const [sortOption, setSortOption] = useState<BlogSortOption>("default");
  const [activeTab, setActiveTab] = useState<"all" | "featured">("all");

  const featuredBlogs = useMemo(() => getFeaturedBlogs(allBlogs), [allBlogs]);
  const displayedBlogs = activeTab === "featured" ? featuredBlogs : blogs;

  useEffect(() => {
    const loadInitialBlogs = async () => {
      setLoading(true);
      setHasMore(true);
      setLoadedCount(0);

      try {
        const data = await fetchBlogsPage(
          { offset: 0, limit: PAGE_SIZE, sortOption },
          true,
        ).unwrap();

        setBlogs(data);
        setLoadedCount(data.length);
        setHasMore(data.length === PAGE_SIZE);
      } catch {
        setBlogs([]);
        setLoadedCount(0);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    void loadInitialBlogs();
  }, [fetchBlogsPage, sortOption]);

  const handleShowMore = async () => {
    if (activeTab === "featured" || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    try {
      const nextBlogs = await fetchBlogsPage(
        {
          offset: loadedCount,
          limit: PAGE_SIZE,
          sortOption,
        },
        true,
      ).unwrap();

      setBlogs((prev) => [...prev, ...nextBlogs]);
      setLoadedCount((prev) => prev + nextBlogs.length);
      setHasMore(nextBlogs.length === PAGE_SIZE);
    } catch {
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const gridClass =
    viewGrid === 1
      ? "md:grid-cols-1"
      : viewGrid === 2
        ? "md:grid-cols-2"
        : viewGrid === 3
          ? "md:grid-cols-3"
          : "md:grid-cols-4";

  const mobileGridClass =
    mobileViewGrid === 1
      ? "grid-cols-1"
      : "grid-cols-1 min-[400px]:grid-cols-2";

  const isHorizontalGrid = viewGrid <= 2;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 space-y-8 md:space-y-12">
      <div
        className="w-full min-h-72 sm:min-h-80 md:min-h-98 flex items-center justify-center rounded-lg mt-4 sm:mt-6"
        style={{
          backgroundImage: 'url("/blog.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex flex-col justify-center items-center text-center px-4 sm:px-6">
          <div className="font-inter text-xs sm:text-sm md:text-base font-semibold flex gap-2 sm:gap-3">
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              Home
            </Link>
            <span className="text-gray-400">{">"}</span>
            <Link href="/blogs" className="text-black">
              Blog
            </Link>
          </div>
          <h1 className="font-poppins text-[32px] leading-9.5 tracking-[-0.4px] sm:text-[42px] sm:leading-12 md:text-[54px] md:leading-14.5 md:tracking-[-1px] font-medium my-3 sm:my-4 md:my-5">
            Our Blog
          </h1>
          <p className="font-inter text-[14px] leading-5.5 sm:text-[16px] sm:leading-6.5 md:text-[20px] md:leading-8 text-[#121212] max-w-[320px] sm:max-w-105 md:max-w-none">
            Home ideas and design inspiration
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-4 md:border-none md:pb-0 gap-4 md:gap-0">
        <div className="flex gap-6 md:gap-10 w-full md:w-auto">
          <h1
            className={`${activeTab === "all" ? `${typography.text16Semibold} border-b-2 border-black pb-1 text-[#141718]` : `${typography.text16} text-gray-400 hover:text-gray-800`} transition-colors cursor-pointer whitespace-nowrap`}
            onClick={() => setActiveTab("all")}
          >
            All Blog
          </h1>
          <h1
            className={`${typography.text16} ${activeTab === "featured" ? "text-[#141718] border-b-2 border-black pb-1" : "text-gray-400 hover:text-gray-800"} transition-colors cursor-pointer whitespace-nowrap`}
            onClick={() => setActiveTab("featured")}
          >
            Featured
          </h1>
        </div>
        <div className="flex items-center justify-between w-full md:w-auto gap-6 pb-2 md:pb-0">
          <BlogSortMenu sortOption={sortOption} onSort={setSortOption} />
          <div className="hidden md:flex items-center">
            <GridIconBar
              icons={desktopIcons}
              activeGrid={viewGrid}
              onChange={setViewGrid}
            />
          </div>
        </div>
      </div>

      <div
        className={`grid gap-x-4 gap-y-8 md:gap-8 transition-all duration-300 w-full ${mobileGridClass} ${gridClass}`}
      >
        {loading ? (
          <div className="col-span-full py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          displayedBlogs.map((article) => (
            <Link
              href={`/blogs/${article.id}`}
              key={article.id}
              className={`group flex flex-col ${isHorizontalGrid ? "md:flex-row md:items-center md:gap-6 lg:gap-8" : ""}`}
            >
              <div
                className={`overflow-hidden rounded-sm bg-[#F3F5F7] w-full ${isHorizontalGrid ? "md:w-65 md:shrink-0 md:aspect-square" : ""} ${mobileViewGrid === 2 ? "aspect-square" : ""}`}
              >
                <img
                  className={`w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 ${isHorizontalGrid ? "aspect-square md:aspect-square" : "aspect-square"} ${mobileViewGrid === 1 ? "aspect-video md:aspect-square" : "aspect-square"}`}
                  src={article.img}
                  alt={article.title}
                />
              </div>
              <div
                className={`mt-4 ${isHorizontalGrid ? "md:mt-0 md:flex-1 md:flex md:flex-col md:justify-center" : ""}`}
              >
                <h3
                  className={`font-medium text-[#141718] mb-2 leading-relaxed ${isHorizontalGrid ? "text-xl md:text-2xl font-semibold" : "text-base md:text-lg"} ${mobileViewGrid === 2 ? "text-sm md:text-base line-clamp-2" : "text-base"}`}
                >
                  {article.title}
                </h3>
                <p className="text-[12px] md:text-sm text-[#6C7275] font-medium">
                  {new Date(article.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                {isHorizontalGrid && (
                  <p className="hidden md:block mt-4 text-[#6C7275] line-clamp-3 leading-relaxed">
                    {getBlogExcerpt(article)}
                  </p>
                )}
              </div>
            </Link>
          ))
        )}
      </div>

      {!loading && displayedBlogs.length === 0 && (
        <div className="text-center text-[#6C7275] py-8">No blogs found.</div>
      )}

      {activeTab === "all" && hasMore && !loading && (
        <div className="flex justify-center items-center mt-8 md:mt-8">
          <button
            onClick={handleShowMore}
            disabled={isLoadingMore}
            className="border cursor-pointer border-[#141718] text-[#141718] py-2 md:py-2.5 px-8 md:px-10 rounded-[80px] font-medium hover:bg-[#141718] hover:text-white transition-all duration-300"
          >
            {isLoadingMore ? "Loading..." : "Show more"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Blogs;
