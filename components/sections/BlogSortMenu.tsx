"use client";

import { useState, useRef, useEffect } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";

export type BlogSortOption = "default" | "newest" | "oldest" | "az" | "za";

interface BlogSortMenuProps {
  sortOption: BlogSortOption;
  onSort: (option: BlogSortOption) => void;
}

const sortLabels: Record<BlogSortOption, string> = {
  default: "Sort by",
  newest: "Newest",
  oldest: "Oldest",
  az: "Title (A-Z)",
  za: "Title (Z-A)",
};

const options: BlogSortOption[] = ["default", "newest", "oldest", "az", "za"];

const BlogSortMenu = ({ sortOption, onSort }: BlogSortMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const visibleOptions = options.filter((opt) => opt !== "default");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        isOpen
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      ref={menuRef}
      className="relative border border-gray-300 rounded px-2 md:border-none md:p-0 md:rounded-none flex w-full md:w-auto justify-between md:justify-start"
    >
      <div
        className="flex items-center w-full justify-between cursor-pointer py-1.5 md:py-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h1 className="text-sm font-medium text-[#141718] md:whitespace-nowrap grow">
          {sortLabels[sortOption]}
        </h1>
        <RiArrowDropDownLine
          className={`text-3xl text-[#141718] transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      <div
        className={`absolute right-0 top-full md:top-full mt-1 md:mt-0 w-full md:w-48 bg-white border border-gray-100 shadow-lg rounded-md overflow-hidden z-20 transition-all duration-200
        ${isOpen ? "opacity-100 visible" : "opacity-0 invisible max-h-0 md:max-h-none"}`}
      >
        <div className="flex flex-col">
          {visibleOptions.map((opt, i) => (
            <button
              key={opt}
              onClick={() => {
                const nextSort: BlogSortOption =
                  sortOption === opt ? "default" : opt;
                onSort(nextSort);
                setIsOpen(false);
              }}
              className={`text-left px-4 py-3 md:py-2 cursor-pointer text-sm hover:bg-gray-50 ${i > 0 ? "border-t border-gray-50 md:border-none" : ""} ${sortOption === opt ? "font-semibold bg-gray-50" : ""}`}
            >
              {sortLabels[opt]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogSortMenu;
