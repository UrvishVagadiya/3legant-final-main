"use client";
import { IoOptionsOutline } from "react-icons/io5";
import FilterDropdown from "@/components/shop/FilterDropdown";
import SortByMenu from "@/components/shop/SortByMenu";
import GridIconBar from "@/components/shop/GridIconBar";

interface FilterItem {
  label: string;
  active: boolean;
}

interface MobileShopFiltersProps {
  mobileViewGrid: number;
  setMobileViewGrid: (grid: number) => void;
  isMobileFilterOpen: boolean;
  setIsMobileFilterOpen: (open: boolean) => void;
  openDropdown: string | null;
  setOpenDropdown: (d: string | null) => void;
  selectedCategory: string;
  categoryItems: FilterItem[];
  priceItems: FilterItem[];
  priceDisplayValue: string;
  onCategorySelect: (cat: string) => void;
  onPriceSelectDirect: (label: string) => void;
  onToggleDropdown: (name: string) => void;
  onSort: (option: string) => void;
  sortOption: string;
  mobileIcons: { icon: React.ReactNode; grid: number }[];
}

const MobileShopFilters = ({
  mobileViewGrid,
  setMobileViewGrid,
  isMobileFilterOpen,
  setIsMobileFilterOpen,
  openDropdown,
  setOpenDropdown,
  selectedCategory,
  categoryItems,
  priceItems,
  priceDisplayValue,
  onCategorySelect,
  onPriceSelectDirect,
  onToggleDropdown,
  onSort,
  sortOption,
  mobileIcons,
}: MobileShopFiltersProps) => {
  const mobilePriceItems = priceItems.map((item) => ({
    ...item,
    active: item.label === priceDisplayValue,
  }));

  const renderFilters = (compact: boolean) => (
    <>
      <FilterDropdown
        label="CATEGORIES"
        displayValue={selectedCategory}
        items={categoryItems}
        isOpen={openDropdown === "category"}
        onToggle={() => onToggleDropdown("category")}
        onSelect={onCategorySelect}
        onClose={() => setOpenDropdown(null)}
        compact={compact}
      />
      <FilterDropdown
        label="PRICE"
        displayValue={priceDisplayValue}
        items={mobilePriceItems}
        isOpen={openDropdown === "price"}
        onToggle={() => onToggleDropdown("price")}
        onSelect={onPriceSelectDirect}
        onClose={() => setOpenDropdown(null)}
        compact={compact}
      />
    </>
  );

  if (mobileViewGrid === 2) {
    return (
      <>
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setIsMobileFilterOpen(!isMobileFilterOpen);
              setOpenDropdown(null);
            }}
            className="flex cursor-pointer items-center gap-2 text-[#141718]"
          >
            <IoOptionsOutline className="text-xl" />
            <span className="font-semibold text-sm">Filter</span>
          </button>
          <GridIconBar
            icons={mobileIcons}
            activeGrid={mobileViewGrid}
            onChange={setMobileViewGrid}
          />
        </div>
        {isMobileFilterOpen && (
          <div className="flex flex-col gap-3 py-3 border-b border-gray-200">
            {renderFilters(true)}
          </div>
        )}
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm text-[#141718]">
            {selectedCategory}
          </h2>
          <SortByMenu onSort={onSort} currentSort={sortOption} />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">{renderFilters(true)}</div>
      <div className="flex items-center justify-between">
        <SortByMenu onSort={onSort} align="left" currentSort={sortOption} />
        <GridIconBar
          icons={mobileIcons}
          activeGrid={mobileViewGrid}
          onChange={setMobileViewGrid}
        />
      </div>
    </>
  );
};

export default MobileShopFilters;
