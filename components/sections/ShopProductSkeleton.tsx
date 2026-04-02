"use client";
import React from "react";

interface ShopProductSkeletonProps {
  viewGrid: number;
}

const ShopProductSkeleton = ({ viewGrid }: ShopProductSkeletonProps) => {
  const isHorizontal = viewGrid <= 2;

  return (
    <div className={`animate-pulse relative flex flex-col ${isHorizontal ? "lg:flex-row lg:gap-6" : ""}`}>
      <div
        className={`bg-gray-200 rounded w-full aspect-4/5 ${isHorizontal ? "lg:w-65 lg:shrink-0 lg:aspect-square" : ""}`}
      ></div>

      <div
        className={`mt-3 space-y-3 ${isHorizontal ? "lg:mt-0 lg:flex-1 lg:flex lg:flex-col lg:justify-center lg:py-2" : ""}`}
      >
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-3 w-3 bg-gray-200 rounded-full"></div>
          ))}
        </div>

        <div className={`h-4 bg-gray-200 rounded w-3/4 ${isHorizontal ? "lg:h-5" : ""}`}></div>

        <div className="flex gap-2 items-center">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/6"></div>
        </div>

        {isHorizontal && (
          <div className="hidden lg:block space-y-2 mt-4">
            <div className="h-3 bg-gray-100 rounded w-full"></div>
            <div className="h-3 bg-gray-100 rounded w-5/6"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopProductSkeleton;
