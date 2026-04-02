"use client";
import { GoHeart, GoHeartFill } from "react-icons/go";
import { RatingStars } from "@/components/ui/ProductCard";
import Link from "next/link";
import { isOfferExpired } from "@/utils/isOfferExpired";
import { isProductNew } from "@/utils/isProductNew";
import { colorMap } from "../product/ColorSelector";
import TintedProductImage from "../product/TintedProductImage";

import { Product } from "@/store/slices/productSlice";

interface ArrivalCardProps {
  card: Product;
  isMounted: boolean;
  isInWishlist: (id: number | string) => boolean;
  handleWishlistToggle: (e: React.MouseEvent, card: Product) => void;
  handleAddToCart: (e: React.MouseEvent, card: Product) => void;
  getRating: (id: number | string) => { avgRating: number; reviewCount: number };
}

const discount = (price: number, mrp?: number) => {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
};

const ArrivalCard = ({
  card,
  isMounted,
  isInWishlist,
  handleWishlistToggle,
  handleAddToCart,
  getRating,
}: ArrivalCardProps) => {
  const expired = isOfferExpired(card.valid_until);
  const displayPrice =
    expired && card.mrp && card.mrp > card.price ? card.mrp : card.price;
  const displayMrp = expired ? undefined : card.mrp;
  const colorOptions = Array.isArray(card.color) ? card.color : card.color ? [card.color] : [];
  const firstColor = colorOptions[0];
  const colorHex = firstColor ? colorMap[firstColor] : null;
  const shouldTint = firstColor && firstColor.toLowerCase() !== "white";
  const isOutOfStock = (card.stock ?? 0) <= 0;

  return (
    <Link
      href={`/product/${card.id}`}
      className="group w-55 md:w-65.5 shrink-0 flex flex-col relative pb-4"
    >
      <div className="relative w-full aspect-4/5 bg-[#F3F5F7] flex items-center justify-center overflow-hidden rounded">
        <TintedProductImage
          src={card.img}
          alt={card.title}
          fill
          unoptimized
          className="w-full h-full object-cover object-center"
          colorHex={shouldTint ? colorHex : null}
        />
        <div className="w-full absolute top-0 p-3 md:p-4 flex justify-between items-start">
          <div className="flex flex-col gap-2">
            {isProductNew(card.created_at) && (
              <div className="bg-[#FFFFFF] text-[#141718] font-bold text-[11px] md:text-sm py-1 px-3 rounded flex justify-center items-center uppercase shadow-sm">
                New
              </div>
            )}
            {discount(displayPrice, displayMrp) > 0 && (
              <div className="bg-[#38CB89] text-white font-bold text-[11px] md:text-sm py-1 px-3 rounded flex justify-center items-center shadow-sm">
                -{discount(displayPrice, displayMrp)}%
              </div>
            )}
          </div>
          <div
            onClick={(e) => handleWishlistToggle(e, card)}
            className={`${isMounted && isInWishlist(card.id) ? "opacity-100" : "opacity-0 group-hover:opacity-100"} cursor-pointer w-8 h-8 bg-white shadow-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-gray-100`}
          >
            {isMounted && isInWishlist(card.id) ? (
              <GoHeartFill className="text-black text-lg" />
            ) : (
              <GoHeart className="text-[#6C7275] text-lg" />
            )}
          </div>
        </div>
        <div
          onClick={!isOutOfStock ? (e) => handleAddToCart(e, card) : undefined}
          className={`absolute ${isOutOfStock ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-all duration-300 left-3 right-3 md:left-4 md:right-4 bottom-3 md:bottom-4 py-2 md:py-3 rounded-lg ${isOutOfStock ? "bg-gray-400 cursor-not-allowed" : "bg-black cursor-pointer hover:bg-gray-800 hover:scale-[1.02]"} flex items-center justify-center shadow-lg`}
        >
          <h2 className="text-white font-medium text-sm md:text-base">
            {isOutOfStock ? "Out of Stock" : "Add to cart"}
          </h2>
        </div>
      </div>
      <div className="my-3">
        <div className="flex items-center gap-1 mb-1.5 md:mb-2">
          <RatingStars
            rating={getRating(card.id).avgRating}
            className="text-[#141718] text-sm md:text-base"
          />
          <span className="text-xs text-[#6C7275] ml-1">
            ({getRating(card.id).reviewCount})
          </span>
        </div>
        <h3 className="font-semibold text-base md:text-lg mb-1">
          {card.title}
        </h3>
        <div className="flex gap-2.5 items-center mt-1">
          <p className="text-sm md:text-base font-semibold text-[#141718]">
            ${Number(displayPrice).toFixed(2)}
          </p>
          {displayMrp && displayMrp > displayPrice && (
            <p className="text-xs md:text-sm line-through text-[#6C7275]">
              ${Number(displayMrp).toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ArrivalCard;
