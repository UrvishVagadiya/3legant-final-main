"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector, RootState } from "@/store";
import { setFilters } from "@/store/slices/productSlice";
import { useGetProductsQuery } from "@/store/api/productApi";
import { BsGrid3X3GapFill, BsGridFill } from "react-icons/bs";
import { PiColumnsFill, PiRowsFill } from "react-icons/pi";
import ShopHeader from "@/components/layout/ShopHeader";
import ShopSidebar from "@/components/layout/ShopSidebar";
import ShopProductGrid from "@/components/sections/ShopProductGrid";
import FilterDropdown from "@/components/shop/FilterDropdown";
import SortByMenu from "@/components/shop/SortByMenu";
import GridIconBar from "@/components/shop/GridIconBar";
import MobileShopFilters from "@/components/shop/MobileShopFilters";
import { categories, priceRanges } from "@/constants/shopFilters";
import { typography } from "@/constants/typography";
import { isOfferExpired } from "@/utils/isOfferExpired";
import type { Product } from "@/store/slices/productSlice";

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

const getEffectivePrice = (product: Product) => {
  const rawMrp = Number(
    product.mrp || product.old_price || product.oldprice || 0,
  );
  const basePrice = Number(product.price || 0);
  const offerEndsAt = product.valid_until || product.validUntil;
  const expired = isOfferExpired(offerEndsAt);

  if (expired && rawMrp > basePrice) {
    return rawMrp;
  }

  return basePrice;
};

const Shop = () => {
  const PAGE_SIZE = 9;
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { selectedCategory, selectedPrices, sortOption } = useAppSelector(
    (state: RootState) => state.product,
  );
  const { data: products = [], isLoading } = useGetProductsQuery();

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewGrid, setViewGrid] = useState(3);
  const [mobileViewGrid, setMobileViewGrid] = useState(2);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [hasMounted, setHasMounted] = useState(false);
  const lastAppliedQueryCategory = useRef<string>("");

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const categoryFromQuery = searchParams.get("category")?.trim() || "";
    const normalizedQuery = categoryFromQuery.toLowerCase();

    if (!categoryFromQuery) {
      lastAppliedQueryCategory.current = "";
      return;
    }

    // Apply query category once per unique query value; do not override manual filter changes.
    if (lastAppliedQueryCategory.current === normalizedQuery) {
      return;
    }

    const matchedCategory = categories.find(
      (category) => category.toLowerCase() === normalizedQuery,
    );

    if (matchedCategory) {
      dispatch(setFilters({ category: matchedCategory }));
      lastAppliedQueryCategory.current = normalizedQuery;
    }
  }, [searchParams, dispatch]);

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  };

  const handlePriceChange = (priceLabel: string) => {
    const individualPriceLabels = priceRanges
      .map((range) => range.label)
      .filter((label) => label !== "All Price");

    let updated: string[];

    if (priceLabel === "All Price") {
      updated = selectedPrices.includes("All Price") ? [] : ["All Price"];
    } else {
      if (selectedPrices.includes("All Price")) {
        // If All Price is active and user clicks one label,
        // uncheck both "All Price" and that clicked label.
        updated = individualPriceLabels.filter((label) => label !== priceLabel);
      } else {
        updated = selectedPrices.includes(priceLabel)
          ? selectedPrices.filter((p) => p !== priceLabel)
          : [...selectedPrices, priceLabel];
      }

      const allIndividualSelected = individualPriceLabels.every((label) =>
        updated.includes(label),
      );

      if (allIndividualSelected) {
        updated = ["All Price"];
      }
    }

    dispatch(setFilters({ prices: updated }));
  };

  const toggleDropdown = (name: string) =>
    setOpenDropdown((p) => (p === name ? null : name));
  const handleCategorySelect = (cat: string) => {
    dispatch(setFilters({ category: cat }));
    setOpenDropdown(null);
  };
  const handlePriceSelect = (label: string) => {
    handlePriceChange(label);
    if (label === "All Price") setOpenDropdown(null);
  };
  const handleDesktopPriceSelect = (label: string) => {
    dispatch(setFilters({ prices: [label] }));
    setOpenDropdown(null);
  };
  const handleMobilePriceSelect = (label: string) => {
    dispatch(setFilters({ prices: [label] }));
    setOpenDropdown(null);
  };
  const handleSortChange = (sort: string) => dispatch(setFilters({ sort }));

  const filtered = useMemo(() => {
    let r = [...products];
    if (selectedCategory !== "All Rooms") {
      r = r.filter((p) =>
        Array.isArray(p.category)
          ? p.category.includes(selectedCategory)
          : p.category === selectedCategory,
      );
    }
    if (!selectedPrices.includes("All Price")) {
      const ranges = priceRanges.filter((rr) =>
        selectedPrices.includes(rr.label),
      );
      r = r.filter((p) =>
        ranges.some((rr) => {
          const effectivePrice = getEffectivePrice(p);
          return effectivePrice >= rr.min && effectivePrice <= rr.max;
        }),
      );
    }
    if (sortOption === "az") r.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortOption === "za")
      r.sort((a, b) => b.title.localeCompare(a.title));
    else if (sortOption === "price-low-high")
      r.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
    else if (sortOption === "price-high-low")
      r.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
    return r;
  }, [products, selectedCategory, selectedPrices, sortOption]);

  useEffect(() => {
    // Reset pagination when filters or sorting change.
    setVisibleCount(PAGE_SIZE);
  }, [selectedCategory, selectedPrices, sortOption]);

  const visibleProducts = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount],
  );

  const hasMore = filtered.length > visibleCount;

  const categoryItems = categories.map((c) => ({
    label: c,
    active: selectedCategory === c,
  }));
  const isAllPricesSelected =
    hasMounted && selectedPrices.includes("All Price");
  const priceItems = priceRanges.map((r) => ({
    label: r.label,
    active: isAllPricesSelected || selectedPrices.includes(r.label),
  }));
  const priceDisplay = selectedPrices.includes("All Price")
    ? "All Price"
    : selectedPrices[0];
  const desktopPriceItems = priceRanges.map((r) => ({
    label: r.label,
    active: priceDisplay === r.label,
  }));
  const isSidebarOpen = viewGrid === 3;

  return (
    <div className="max-w-310 mx-auto px-4 sm:px-6 lg:px-8 mb-20 font-inter">
      <ShopHeader />
      <div className="flex flex-col lg:flex-row gap-8 my-8 md:my-12 relative w-full items-start">
        {isSidebarOpen && (
          <div className="hidden lg:block w-full lg:w-1/4 pb-4">
            <ShopSidebar
              isFilterOpen
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={(cat: string) =>
                dispatch(setFilters({ category: cat }))
              }
              priceRanges={priceRanges}
              selectedPrices={selectedPrices}
              handlePriceChange={handlePriceChange}
            />
          </div>
        )}
        <div
          className={`w-full flex-1 transition-all duration-300 ${!isSidebarOpen ? "lg:w-full" : "lg:w-3/4"}`}
        >
          <div className="lg:hidden flex flex-col gap-3 mb-4">
            <MobileShopFilters
              mobileViewGrid={mobileViewGrid}
              setMobileViewGrid={setMobileViewGrid}
              isMobileFilterOpen={isMobileFilterOpen}
              setIsMobileFilterOpen={setIsMobileFilterOpen}
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
              selectedCategory={selectedCategory}
              categoryItems={categoryItems}
              priceItems={priceItems}
              priceDisplayValue={priceDisplay}
              onCategorySelect={handleCategorySelect}
              onPriceSelectDirect={handleMobilePriceSelect}
              onToggleDropdown={toggleDropdown}
              onSort={handleSortChange}
              sortOption={sortOption}
              mobileIcons={mobileIcons}
            />
          </div>
          <div className="hidden lg:flex flex-row justify-between items-end gap-4 mb-8">
            {isSidebarOpen ? (
              <h1
                className={`${typography.text20Semibold} text-[#141718] pb-2`}
              >
                {selectedCategory}
              </h1>
            ) : (
              <div className="flex flex-row gap-4 pb-1">
                <FilterDropdown
                  label="CATEGORIES"
                  displayValue={selectedCategory}
                  items={categoryItems}
                  isOpen={openDropdown === "category"}
                  onToggle={() => toggleDropdown("category")}
                  onSelect={handleCategorySelect}
                  compact={false}
                />
                <FilterDropdown
                  label="PRICE"
                  displayValue={priceDisplay}
                  items={desktopPriceItems}
                  isOpen={openDropdown === "price"}
                  onToggle={() => toggleDropdown("price")}
                  onSelect={handleDesktopPriceSelect}
                  compact={false}
                />
              </div>
            )}
            <div className="flex items-center gap-6 pb-1">
              <SortByMenu onSort={handleSortChange} currentSort={sortOption} />
              <GridIconBar
                icons={desktopIcons}
                activeGrid={viewGrid}
                onChange={setViewGrid}
              />
            </div>
          </div>
          <ShopProductGrid
            products={visibleProducts}
            isLoading={isLoading}
            viewGrid={viewGrid}
            mobileViewGrid={mobileViewGrid}
            hasMore={hasMore}
            isLoadingMore={false}
            onShowMore={handleShowMore}
            isSidebarOpen={isSidebarOpen}
          />
        </div>
      </div>
    </div>
  );
};

export default Shop;
