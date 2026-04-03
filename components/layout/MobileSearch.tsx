"use client";

import { Search } from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector, RootState } from "@/store";
import { useSearchProductsQuery } from "@/store/api/productApi";
import { setSearchQuery } from "@/store/slices/productSlice";
import { colorMap } from "../product/ColorSelector";
import TintedProductImage from "../product/TintedProductImage";
import type { Product } from "@/store/slices/productSlice";

interface MobileSearchProps {
  onResultClick: () => void;
}

const MobileSearch = ({ onResultClick }: MobileSearchProps) => {
  const dispatch = useAppDispatch();
  const { searchQuery } = useAppSelector((state: RootState) => state.product);

  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { data: searchResults = [], isFetching: searchLoading } =
    useSearchProductsQuery(searchQuery, {
      skip: !searchQuery.trim(),
    });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    dispatch(setSearchQuery(value));
    setShowResults(!!value.trim());
  };

  const handleClick = (productId: string | number) => {
    onResultClick();
    router.push(`/product?id=${productId}`);
  };

  return (
    <div className="px-5 py-3 shrink-0 relative">
      <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5">
        <Search className="w-4 h-4 text-[#6C7275] shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder="Search"
          className="flex-1 text-sm text-[#141718] placeholder:text-[#6C7275] outline-none bg-transparent"
        />
      </div>

      {showResults && (
        <div className="absolute left-0 right-0 mx-5 mt-1 bg-white border border-gray-100 rounded-lg shadow-lg max-h-50 overflow-y-auto z-10">
          {searchLoading && (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-[#141718] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!searchLoading &&
            searchResults.length === 0 &&
            searchQuery.trim() && (
              <p className="text-center text-[#6C7275] py-4 text-xs">
                No products found
              </p>
            )}
          {!searchLoading &&
            searchResults.map((product: Product) => (
              <button
                key={product.id}
                onClick={() => handleClick(product.id)}
                className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-[#F3F5F7] transition-colors text-left"
              >
                <div className="w-10 h-10 bg-[#F3F5F7] rounded overflow-hidden shrink-0 flex items-center justify-center relative">
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
                    className="object-cover"
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
                  <p className="text-sm font-medium text-[#141718] truncate">
                    {product.title}
                  </p>
                  <p className="text-xs text-[#6C7275]">
                    ${Number(product.price).toFixed(2)}
                  </p>
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

export default MobileSearch;
