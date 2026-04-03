"use client";
import React from "react";
import { GoHeart, GoHeartFill } from "react-icons/go";
import { IoMdStar, IoMdStarHalf, IoMdStarOutline } from "react-icons/io";
import Link from "next/link";
import Image from "next/image";
import { isOfferExpired } from "@/utils/isOfferExpired";
import { isProductNew } from "@/utils/isProductNew";
import { colorMap } from "../product/ColorSelector";
import TintedProductImage from "../product/TintedProductImage";

interface ProductCardProps {
  product: {
    id: number | string;
    img?: string;
    image_url?: string;
    image?: string;
    title?: string;
    name?: string;
    price: number;
    mrp?: number | null;
    MRP?: number | null;
    old_price?: number | null;
    isNew?: boolean;
    created_at?: string;
    createdAt?: string;
    valid_until?: string | number | null;
    color?: string[] | string;
    stock?: number;
  };
  isMounted: boolean;
  isWishlisted: boolean;
  onWishlistToggle: (e: React.MouseEvent) => void;
  onAddToCart: (e: React.MouseEvent) => void;
  linkTo?: string;
  sizes?: "sm" | "md";
  avgRating?: number;
  reviewCount?: number;
  showColors?: boolean;
}

const RatingStars = ({
  rating,
  className = "",
}: {
  rating: number;
  className?: string;
}) => {
  return (
    <div className={`flex ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        if (rating >= star) return <IoMdStar key={star} />;
        if (rating >= star - 0.5) return <IoMdStarHalf key={star} />;
        return <IoMdStarOutline key={star} />;
      })}
    </div>
  );
};

export { RatingStars };

const ProductCard = ({
  product,
  isMounted,
  isWishlisted,
  onWishlistToggle,
  onAddToCart,
  linkTo,
  sizes = "md",
  avgRating = 0,
  reviewCount = 0,
  showColors = true,
}: ProductCardProps) => {
  const image =
    product.img || product.image_url || product.image || "/image-1.png";
  const title = product.title || product.name || "";
  const rawMrp = product.mrp || product.MRP || product.old_price || 0;
  const expired = isOfferExpired(product.valid_until);
  const displayPrice =
    expired && rawMrp > product.price ? rawMrp : product.price;
  const mrp = expired ? 0 : rawMrp;
  const discount =
    mrp > displayPrice ? Math.round(((mrp - displayPrice) / mrp) * 100) : 0;

  const isSmall = sizes === "sm";
  const badgeText = isSmall
    ? "text-[11px] md:text-sm"
    : "text-[10px] md:text-xs";
  const badgePad = isSmall ? "px-3" : "px-2.5";
  const padding = isSmall ? "p-3 md:p-4" : "p-3";

  const colorOptions = Array.isArray(product.color)
    ? product.color
    : product.color
      ? [product.color]
      : [];
  const firstColor = colorOptions[0];
  const [selectedColor, setSelectedColor] = React.useState(firstColor || "");
  const colorHex = selectedColor ? colorMap[selectedColor] : null;
  const shouldTint = selectedColor && selectedColor.toLowerCase() !== "white";

  const isOutOfStock = (product.stock ?? 0) <= 0;

  const card = (
    <div className="group relative flex flex-col">
      <div className="relative bg-[#F3F5F7] flex items-center justify-center overflow-hidden rounded w-full aspect-4/5">
        <TintedProductImage
          src={image}
          alt={title}
          fill
          unoptimized
          className="w-full h-full object-cover object-center"
          colorHex={shouldTint ? colorHex : null}
        />

        <div
          className={`w-full absolute top-0 ${padding} flex justify-between items-start z-10`}
        >
          <div className="flex flex-col gap-2">
            {isProductNew(product.created_at || product.createdAt) && (
              <div
                className={`bg-[#FFFFFF] text-[#141718] font-bold ${badgeText} py-1 ${badgePad} rounded flex justify-center items-center shadow-sm`}
              >
                NEW
              </div>
            )}
            {discount > 0 && (
              <div
                className={`bg-[#38CB89] text-white font-bold ${badgeText} py-1 ${badgePad} rounded flex justify-center items-center shadow-sm`}
              >
                -{discount}%
              </div>
            )}
          </div>
          <div
            onClick={onWishlistToggle}
            className={`${isMounted && isWishlisted ? "opacity-100" : "opacity-0 group-hover:opacity-100"} bg-white cursor-pointer w-8 h-8 shadow-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110`}
          >
            {isMounted && isWishlisted ? (
              <GoHeartFill className="text-black text-lg" />
            ) : (
              <GoHeart className="text-[#6C7275] text-lg" />
            )}
          </div>
        </div>

        <div
          onClick={!isOutOfStock ? onAddToCart : undefined}
          className={`absolute ${isOutOfStock ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-all duration-300 left-3 right-3 ${isSmall ? "md:left-4 md:right-4 bottom-3 md:bottom-4 py-2 md:py-3 rounded-lg" : "bottom-3 py-2.5 rounded"} ${isOutOfStock ? "bg-gray-400 cursor-not-allowed" : "bg-[#141718] cursor-pointer hover:bg-black"} flex items-center justify-center shadow-lg`}
        >
          <h2
            className={`text-white font-medium ${isSmall ? "text-sm md:text-base" : "text-sm"}`}
          >
            {isOutOfStock ? "Out of Stock" : "Add to cart"}
          </h2>
        </div>
      </div>

      <div className={isSmall ? "my-3" : "mt-3"}>
        <div className="flex items-center gap-1 mb-1">
          <RatingStars
            rating={avgRating}
            className={`text-[#141718] ${isSmall ? "text-sm md:text-base" : "text-[14px]"}`}
          />
          <span className="text-xs text-[#6C7275] ml-1">({reviewCount})</span>
          {showColors && colorOptions.length > 1 && (
            <div className="flex gap-1.5 z-20 ml-auto">
              {colorOptions.slice(0, 4).map((c: string) => (
                <button
                  key={c}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedColor(c);
                  }}
                  title={c}
                  className={`w-3.5 h-3.5 rounded-full border border-gray-200 transition-transform hover:scale-110 ${selectedColor === c ? "ring-1 ring-[#141718] ring-offset-1" : ""}`}
                  style={{ backgroundColor: colorMap[c] || "#E8ECEF" }}
                />
              ))}
              {colorOptions.length > 4 && (
                <span className="text-[10px] text-gray-400 font-medium">
                  +{colorOptions.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
        <h3
          className={`font-semibold text-[#141718] mb-1 truncate ${isSmall ? "text-base md:text-lg" : "text-[15px]"}`}
        >
          {title}
        </h3>
        <div className="flex gap-2.5 items-center mt-0.5">
          <p
            className={`font-semibold text-[#141718] ${isSmall ? "text-sm md:text-base" : "text-sm"}`}
          >
            ${Number(displayPrice).toFixed(2)}
          </p>
          {mrp > 0 && mrp > displayPrice && (
            <p
              className={`line-through text-[#6C7275] ${isSmall ? "text-xs md:text-sm" : "text-xs"}`}
            >
              ${Number(mrp).toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (linkTo) {
    return <Link href={linkTo}>{card}</Link>;
  }
  return card;
};

export default ProductCard;
