"use client";
import { useIsMounted } from "@/hooks/useIsMounted";
import { useAppDispatch, useAppSelector, RootState } from "@/store";
import { useGetRatingsByProductsQuery } from "@/store/api/reviewApi";
import { useToggleWishlistMutation } from "@/store/api/wishlistApi";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { addToCart } from "@/store/slices/cartSlice";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/store/slices/wishlistSlice";
import { useMemo } from "react";
import ShopProductCard from "./ShopProductCard";
import ShopProductSkeleton from "./ShopProductSkeleton";
import type { Product } from "@/store/slices/productSlice";

interface ShopProductGridProps {
  products: Product[];
  viewGrid: number;
  mobileViewGrid?: number;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onShowMore?: () => void;
  isSidebarOpen?: boolean;
  isLoading?: boolean;
}

const mobileGridClasses: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
};
const desktopGridClasses: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

const ShopProductGrid = ({
  products,
  viewGrid,
  mobileViewGrid = 2,
  hasMore = false,
  isLoadingMore = false,
  onShowMore,
  isLoading,
}: ShopProductGridProps) => {
  const dispatch = useAppDispatch();
  const isMounted = useIsMounted();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { items: wishlistItems } = useAppSelector(
    (state: RootState) => state.wishlist,
  );
  const { requireAuth } = useAuthGuard();
  const [toggleWishlistMutation] = useToggleWishlistMutation();

  const productIds = useMemo(() => products.map((p) => p.id), [products]);
  const { data: ratingsByProduct = {} } = useGetRatingsByProductsQuery(
    productIds,
    { skip: productIds.length === 0 },
  );

  const getRating = (id: number | string) =>
    ratingsByProduct[String(id)] || { avgRating: 0, reviewCount: 0 };
  const isInWishlist = (id: number | string) =>
    wishlistItems.some((i) => i.id == id);

  const handleWishlistToggle = (e: React.MouseEvent, card: Product) => {
    e.preventDefault();
    e.stopPropagation();
    requireAuth(() => {
      const isAdding = !isInWishlist(card.id);
      if (!isAdding) {
        dispatch(removeFromWishlist({ id: card.id }));
      } else {
        const productColors = Array.isArray(card.color)
          ? card.color
          : card.color
            ? [card.color]
            : [];
        const preferredColor = productColors[0];
        dispatch(
          addToWishlist({
            item: {
              id: card.id,
              name: card.title || card.name || "",
              price: card.price,
              MRP: card.mrp || card.old_price || card.oldprice || 0,
              image: card.img || card.image_url || "/image-1.png",
              color: preferredColor,
              stock: Number(card.stock) || 0,
            },
          }),
        );
      }

      if (user) {
        const productColors = Array.isArray(card.color)
          ? card.color
          : card.color
            ? [card.color]
            : [];
        const preferredColor = productColors[0];
        toggleWishlistMutation({
          userId: user.id,
          productId: String(card.id),
          color: preferredColor,
          adding: isAdding,
        });
      }
    });
  };

  const handleAddToCart = (e: React.MouseEvent, card: Product) => {
    e.preventDefault();
    e.stopPropagation();
    requireAuth(() => {
      const productColors = Array.isArray(card.color)
        ? card.color
        : card.color
          ? [card.color]
          : [];
      const preferredColor = productColors[0];
      dispatch(
        addToCart({
          item: {
            id: String(card.id),
            name: card.title || card.name || "",
            price: card.price,
            mrp: card.mrp || card.oldprice || card.old_price || undefined,
            validUntil: card.validUntil || card.valid_until || null,
            image: card.img || card.image_url || "/image-1.png",
            color: preferredColor,
            stock: Number(card.stock) || 0,
          },
        }),
      );
    });
  };

  if (isLoading) {
    const gridClass = `${mobileGridClasses[mobileViewGrid] || "grid-cols-2"} ${desktopGridClasses[viewGrid] || "lg:grid-cols-4"}`;
    return (
      <div className={`grid gap-4 md:gap-6 pb-4 ${gridClass}`}>
        {Array.from({ length: 9 }).map((_, i) => (
          <ShopProductSkeleton key={i} viewGrid={viewGrid} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex justify-center items-center py-20 text-[#6C7275]">
        <p>No products found matching these filters.</p>
      </div>
    );
  }

  const gridClass = `${mobileGridClasses[mobileViewGrid] || "grid-cols-2"} ${desktopGridClasses[viewGrid] || "lg:grid-cols-4"}`;

  return (
    <>
      <div
        className={`grid gap-4 md:gap-6 pb-4 transition-all duration-300 ${gridClass}`}
      >
        {products.map((card) => (
          <ShopProductCard
            key={card.id}
            card={card}
            viewGrid={viewGrid}
            mobileViewGrid={mobileViewGrid}
            isMounted={isMounted}
            isInWishlist={isInWishlist}
            wishlistItems={wishlistItems}
            handleWishlistToggle={handleWishlistToggle}
            handleAddToCart={handleAddToCart}
            getRating={getRating}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-10 mb-2">
          <button
            onClick={onShowMore}
            disabled={isLoadingMore}
            className="px-10 py-2 cursor-pointer border border-[#141718] text-[#141718] rounded-[80px] font-medium hover:bg-[#141718] hover:text-white transition-all duration-300"
          >
            {isLoadingMore ? "Loading..." : "Show more"}
          </button>
        </div>
      )}
    </>
  );
};

export default ShopProductGrid;
