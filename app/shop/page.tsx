"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector, RootState } from "@/store";
import { setFilters } from "@/store/slices/productSlice";
import { useGetShopProductsQuery } from "@/store/api/productApi";
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

const Shop = () => {
  const PAGE_SIZE = 9;
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { selectedCategory, selectedPrices, sortOption } = useAppSelector(
    (state: RootState) => state.product,
  );
  const [page, setPage] = useState(1);
  const [shopProducts, setShopProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewGrid, setViewGrid] = useState(3);
  const [mobileViewGrid, setMobileViewGrid] = useState(2);
  const [hasMounted, setHasMounted] = useState(false);
  const lastAppliedQueryCategory = useRef<string>("");

  const activePriceFilters = useMemo(() => {
    if (selectedPrices.includes("All Price")) {
      return [];
    }

    return priceRanges
      .filter((range) => selectedPrices.includes(range.label))
      .map((range) => ({
        min: range.min,
        max: Number.isFinite(range.max) ? range.max : null,
      }));
  }, [selectedPrices]);

  const shopQueryArgs = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      category: selectedCategory,
      hasPriceSelection: selectedPrices.length > 0,
      sort: sortOption as
        | "default"
        | "az"
        | "za"
        | "price-low-high"
        | "price-high-low",
      priceFilters: activePriceFilters,
    }),
    [
      page,
      selectedCategory,
      selectedPrices.length,
      sortOption,
      activePriceFilters,
    ],
  );

  const {
    data: shopResponse,
    isLoading,
    isFetching,
  } = useGetShopProductsQuery(shopQueryArgs);

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

  useEffect(() => {
    setOpenDropdown(null);
  }, [searchParams]);

  const handleShowMore = () => {
    if (!isFetching && shopProducts.length < totalCount) {
      setPage((prev) => prev + 1);
    }
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
    const nextCategory = selectedCategory === cat ? "All Rooms" : cat;
    dispatch(setFilters({ category: nextCategory }));
    setOpenDropdown(null);
  };
  const handlePriceSelect = (label: string) => {
    handlePriceChange(label);
    if (label === "All Price") setOpenDropdown(null);
  };
  const handleDesktopPriceSelect = (label: string) => {
    const nextPrice = priceDisplay === label ? "All Price" : label;
    dispatch(setFilters({ prices: [nextPrice] }));
    setOpenDropdown(null);
  };
  const handleMobilePriceSelect = (label: string) => {
    const nextPrice = priceDisplay === label ? "All Price" : label;
    dispatch(setFilters({ prices: [nextPrice] }));
    setOpenDropdown(null);
  };
  const handleSortChange = (sort: string) => {
    const nextSort = sortOption === sort ? "default" : sort;
    dispatch(setFilters({ sort: nextSort }));
  };

  useEffect(() => {
    setPage(1);
    setShopProducts([]);
    setTotalCount(0);
  }, [selectedCategory, selectedPrices, sortOption]);

  useEffect(() => {
    if (selectedPrices.length === 0) {
      setTotalCount(0);
      setShopProducts([]);
      return;
    }

    if (!shopResponse) {
      return;
    }

    setTotalCount(shopResponse.total);

    setShopProducts((prev) => {
      if (page === 1) {
        return shopResponse.products;
      }

      const seen = new Set(prev.map((product) => String(product.id)));
      const incoming = shopResponse.products.filter(
        (product) => !seen.has(String(product.id)),
      );

      return [...prev, ...incoming];
    });
  }, [shopResponse, page, selectedPrices.length]);

  const displayedProducts = shopProducts;

  const hasMore = shopProducts.length < totalCount;

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
    : selectedPrices[0] || "Price";
  const desktopPriceItems = priceRanges.map((r) => ({
    label: r.label,
    active: priceDisplay === r.label,
  }));
  const isSidebarOpen = viewGrid === 3;

  return (
    <div className="max-w-310 mx-auto px-4 sm:px-6 lg:px-8 mb-9 font-inter">
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
                  onClose={() => setOpenDropdown(null)}
                  compact={false}
                />
                <FilterDropdown
                  label="PRICE"
                  displayValue={priceDisplay}
                  items={desktopPriceItems}
                  isOpen={openDropdown === "price"}
                  onToggle={() => toggleDropdown("price")}
                  onSelect={handleDesktopPriceSelect}
                  onClose={() => setOpenDropdown(null)}
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
            products={displayedProducts}
            isLoading={isLoading && page === 1}
            viewGrid={viewGrid}
            mobileViewGrid={mobileViewGrid}
            hasMore={hasMore}
            isLoadingMore={isFetching && page > 1}
            onShowMore={handleShowMore}
            isSidebarOpen={isSidebarOpen}
          />
        </div>
      </div>
    </div>
  );
};

export default Shop;
