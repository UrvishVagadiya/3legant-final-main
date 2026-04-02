"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { BsGrid3X3GapFill, BsGridFill } from "react-icons/bs";
import { PiColumnsFill, PiRowsFill } from "react-icons/pi";
import GridIconBar from "@/components/shop/GridIconBar";
import BlogSortMenu from "@/components/sections/BlogSortMenu";
import { useGetBlogsQuery } from "@/store/api/blogApi";
import { typography } from "@/constants/typography";

import { Blog } from "@/types/blog";

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

const Blogs = () => {
  const { data: blogs = [], isLoading: loading } = useGetBlogsQuery();
  const [viewGrid, setViewGrid] = useState<number>(3);
  const [mobileViewGrid, setMobileViewGrid] = useState<number>(1);
  const [sortOption, setSortOption] = useState("default");
  const [visibleCount, setVisibleCount] = useState<number>(9);

  const sortedArticles = useMemo(() => {
    let result = [...blogs];
    if (sortOption === "az")
      result.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortOption === "za")
      result.sort((a, b) => b.title.localeCompare(a.title));
    else if (sortOption === "newest")
      result.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
    else if (sortOption === "oldest")
      result.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
    return result;
  }, [sortOption, blogs]);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 space-y-8 md:space-y-12">
      <div
        className="w-full min-h-75 md:min-h-98 flex items-center justify-center rounded-lg mt-6"
        style={{
          backgroundImage: 'url("/blog.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex flex-col justify-center items-center text-center px-4">
          <div className="flex gap-3 text-sm md:text-base font-medium">
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
          <h1 className={`${typography.h3} my-5`}>Our Blog</h1>
          <p className={`${typography.text20} text-[#121212]`}>
            Home ideas and design inspiration
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-4 border-b md:border-none md:pb-0 gap-4 md:gap-0">
        <div className="flex gap-6 md:gap-10 w-full md:w-auto">
          <h1
            className={`${typography.text16Semibold} border-b-2 border-black pb-1 text-[#141718] whitespace-nowrap`}
          >
            All Blog
          </h1>
          <h1
            className={`${typography.text16} text-gray-400 hover:text-gray-800 transition-colors cursor-pointer whitespace-nowrap`}
          >
            Featured
          </h1>
        </div>
        <div className="flex items-center justify-between w-full md:w-auto gap-6 pb-2 md:pb-0">
          <BlogSortMenu sortOption={sortOption} onSort={setSortOption} />
          <div className="md:hidden">
            <GridIconBar
              icons={mobileIcons}
              activeGrid={mobileViewGrid}
              onChange={setMobileViewGrid}
            />
          </div>
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
          sortedArticles.slice(0, visibleCount).map((article) => (
            <Link
              href={`/blogs/${article.id}`}
              key={article.id}
              className={`flex flex-col group ${viewGrid === 1 ? "md:flex-row md:items-center md:gap-8" : ""}`}
            >
              <div
                className={`overflow-hidden rounded-sm bg-[#F3F5F7] ${viewGrid === 1 ? "w-full md:w-1/3 shrink-0" : "w-full"} ${mobileViewGrid === 2 ? "aspect-square" : ""}`}
              >
                <img
                  className={`w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 ${viewGrid === 1 ? "md:aspect-4/3" : "aspect-square"} ${mobileViewGrid === 1 ? "aspect-video md:aspect-square" : "aspect-square"}`}
                  src={article.img}
                  alt={article.title}
                />
              </div>
              <div className={`mt-4 ${viewGrid === 1 ? "md:mt-0 flex-1" : ""}`}>
                <h3
                  className={`font-medium text-[#141718] mb-2 leading-relaxed ${viewGrid === 1 ? "text-xl md:text-2xl font-semibold" : "text-base md:text-lg"} ${mobileViewGrid === 2 ? "text-sm md:text-base line-clamp-2" : "text-base"}`}
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
                {viewGrid === 1 && (
                  <p className="hidden md:block mt-4 text-[#6C7275] line-clamp-3 leading-relaxed">
                    {article.content?.replace(/[#*`]/g, "").substring(0, 160)}
                    ...
                  </p>
                )}
              </div>
            </Link>
          ))
        )}
      </div>

      {sortedArticles.length > visibleCount && (
        <div className="flex justify-center items-center mt-12 md:mt-20">
          <button
            onClick={() => setVisibleCount((prev) => prev + 3)}
            className="border border-[#141718] text-[#141718] py-2 md:py-2.5 px-8 md:px-10 rounded-[80px] font-medium hover:bg-[#141718] hover:text-white transition-all duration-300"
          >
            Show more
          </button>
        </div>
      )}
    </div>
  );
};

export default Blogs;
