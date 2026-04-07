"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLazySearchProductsQuery } from "@/store/api/productApi";
import type { Product } from "@/store/slices/productSlice";
import { colorMap } from "../product/ColorSelector";
import TintedProductImage from "../product/TintedProductImage";
import { typography } from "@/constants/typography";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchOverlay = ({ isOpen, onClose }: SearchOverlayProps) => {
  const [query, setQuery] = useState("");
  const [searchedQuery, setSearchedQuery] = useState("");
  const [triggerSearch, { data: results = [], isFetching: loading }] =
    useLazySearchProductsQuery();
  const lastTriggeredQueryRef = useRef("");

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setSearchedQuery("");
      lastTriggeredQueryRef.current = "";
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const trimmed = query.trim();

    if (!trimmed) {
      setSearchedQuery("");
      lastTriggeredQueryRef.current = "";
      return;
    }

    const timer = setTimeout(() => {
      if (lastTriggeredQueryRef.current === trimmed) return;

      setSearchedQuery(trimmed);
      lastTriggeredQueryRef.current = trimmed;
      triggerSearch(trimmed);
    }, 400);

    return () => clearTimeout(timer);
  }, [query, isOpen, triggerSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99995] flex flex-col">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Search Panel */}
      <div className="relative bg-white w-full shadow-xl animate-in slide-in-from-top duration-200">
        <div className="max-w-200 mx-auto px-4 sm:px-6 py-6">
          {/* Search Input */}
          <div className="flex justify-between items-center gap-3 border-b-2 border-[#141718] pb-3">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-[#6C7275] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Search for products..."
                className={`${typography.text18} text-[#141718] placeholder:text-[#6C7275] outline-none bg-transparent`}
              />
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-[#6C7275]" />
            </button>
          </div>

          {/* Results */}
          <div className="mt-4 max-h-[60vh] overflow-y-auto">
            {loading && (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-[#141718] border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!loading && searchedQuery && results.length === 0 && (
              <p className="text-center text-[#6C7275] py-8 text-sm">
                No products found for &quot;{searchedQuery}&quot;
              </p>
            )}

            {!loading && searchedQuery && results.length > 0 && (
              <div className="flex flex-col divide-y divide-gray-100">
                {results.map((product: Product) => (
                  <Link
                    key={product.id}
                    href={`/product?id=${product.id}`}
                    onClick={onClose}
                    className="flex items-center gap-4 py-3 px-2 hover:bg-[#F3F5F7] rounded-lg transition-colors group"
                  >
                    <div className="w-16 h-16 bg-[#F3F5F7] rounded-md overflow-hidden shrink-0 flex items-center justify-center relative">
                      <TintedProductImage
                        src={
                          product.img ||
                          product.image_url ||
                          product.image ||
                          product.images?.[0] ||
                          "/image-1.png"
                        }
                        alt={product.title}
                        fill
                        unoptimized
                        className="object-cover object-center"
                        colorHex={
                          product.color
                            ? colorMap[
                                Array.isArray(product.color)
                                  ? product.color[0]
                                  : product.color
                              ]
                            : null
                        }
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4
                        className={`${typography.text14Semibold} text-[#141718] truncate group-hover:underline`}
                      >
                        {product.title}
                      </h4>
                      {product.category && (
                        <p className="text-xs text-[#6C7275] mt-0.5">
                          {Array.isArray(product.category)
                            ? product.category.join(", ")
                            : product.category}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-semibold text-[#141718]">
                        ${Number(product.price).toFixed(2)}
                      </span>
                      {(product.mrp ?? 0) > product.price && (
                        <span className="text-xs text-[#6C7275] line-through">
                          ${Number(product.mrp).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {!loading && !searchedQuery && (
              <p className="text-center text-[#6C7275] py-8 text-sm">
                Start typing to search products...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
