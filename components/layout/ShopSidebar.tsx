import { IoOptionsOutline } from "react-icons/io5";
import { useEffect, useState } from "react";

interface ShopSidebarProps {
  isFilterOpen: boolean;
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  priceRanges: { label: string; min: number; max: number }[];
  selectedPrices: string[];
  handlePriceChange: (label: string) => void;
  onClose?: () => void;
}

const ShopSidebar = ({
  isFilterOpen,
  categories,
  selectedCategory,
  setSelectedCategory,
  priceRanges,
  selectedPrices,
  handlePriceChange,
  onClose,
}: ShopSidebarProps) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const isAllPricesSelected =
    hasMounted && selectedPrices.includes("All Price");

  return (
    <div className={`w-full ${isFilterOpen ? "block" : "hidden"} lg:block`}>
      <div
        className="hidden lg:flex gap-2 font-medium items-center mb-6 cursor-pointer hover:text-gray-600 transition-colors w-max"
        onClick={onClose}
      >
        <IoOptionsOutline className="text-xl" />
        <h2 className="text-lg">Filter</h2>
      </div>

      <div className="mb-8 p-4 lg:p-0 bg-gray-50 lg:bg-transparent rounded-lg">
        <h1 className="uppercase font-semibold text-sm tracking-widest text-[#141718] mb-4">
          Categories
        </h1>
        <div className="flex flex-col gap-3 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pr-1">
          {categories.map((category, index) => (
            <h3
              key={index}
              onClick={() => setSelectedCategory(category)}
              className={`text-sm cursor-pointer transition-colors w-fit ${
                selectedCategory === category
                  ? "text-[#141718] font-semibold border-b border-black"
                  : "text-[#807E7E] hover:text-[#141718]"
              }`}
            >
              {category}
            </h3>
          ))}
        </div>
      </div>

      <div className="p-4 lg:p-0 bg-gray-50 lg:bg-transparent rounded-lg">
        <h1 className="uppercase font-semibold text-sm tracking-widest text-[#141718] mb-4">
          Price
        </h1>
        <div className="flex flex-col gap-3">
          {priceRanges.map((price, index) => {
            const isChecked =
              isAllPricesSelected || selectedPrices.includes(price.label);
            return (
              <div
                key={index}
                className="flex justify-between items-center group"
              >
                <h3
                  onClick={() => handlePriceChange(price.label)}
                  className={`text-sm cursor-pointer transition-colors ${
                    isChecked
                      ? "text-[#141718] font-semibold"
                      : "text-[#807E7E] group-hover:text-[#141718]"
                  }`}
                >
                  {price.label}
                </h3>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handlePriceChange(price.label)}
                  className="w-5 h-5 border-gray-300 rounded text-black focus:ring-black accent-black cursor-pointer"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ShopSidebar;
