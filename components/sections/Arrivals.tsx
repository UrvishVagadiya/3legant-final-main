"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import ButtonText from "../ui/ButtonText";
import { useAppDispatch, useAppSelector, RootState } from "@/store";
import { useIsMounted } from "@/hooks/useIsMounted";
import { useGetNewArrivalProductsQuery } from "@/store/api/productApi";
import { addToCart } from "@/store/slices/cartSlice";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/store/slices/wishlistSlice";
import {
  useGetRatingsByProductsQuery,
  useToggleLikeReviewMutation,
} from "@/store/api/reviewApi";
import { useToggleWishlistMutation } from "@/store/api/wishlistApi";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import ArrivalCard from "./ArrivalCard";
import type { Product } from "@/store/slices/productSlice";

const Arrivals = () => {
  const dispatch = useAppDispatch();
  const { data: products = [], isLoading } = useGetNewArrivalProductsQuery();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasHorizontalOverflow, setHasHorizontalOverflow] = useState(false);

  const { user } = useAppSelector((state: RootState) => state.auth);
  const wishlistItems = useAppSelector(
    (state: RootState) => state.wishlist.items,
  );
  const { requireAuth } = useAuthGuard();
  const isMounted = useIsMounted();
  const [toggleWishlistMutation] = useToggleWishlistMutation();

  const productIds = useMemo(
    () => products.map((p: Product) => p.id),
    [products],
  );
  const { data: ratingsByProduct = {} } = useGetRatingsByProductsQuery(
    productIds,
    { skip: productIds.length === 0 },
  );

  const isInWishlist = (id: string | number) =>
    wishlistItems.some((i) => i.id == id);

  const getRating = (productId: string | number) => {
    return (
      ratingsByProduct[String(productId)] || { avgRating: 0, reviewCount: 0 }
    );
  };

  const handleWishlistToggle = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    requireAuth(async () => {
      const isAdding = !isInWishlist(product.id);
      if (isAdding) {
        const productColors = Array.isArray(product.color)
          ? product.color
          : product.color
            ? [product.color]
            : [];
        const preferredColor = productColors[0];
        dispatch(
          addToWishlist({
            item: {
              id: product.id,
              name: product.title || product.name || "",
              price: product.price,
              MRP: product.mrp || product.old_price || product.oldprice || 0,
              image: product.img || product.image_url || "/image-1.png",
              color: preferredColor,
              stock: Number(product.stock) || 0,
            },
          }),
        );
      } else {
        dispatch(removeFromWishlist({ id: product.id }));
      }

      if (user) {
        try {
          const productColors = Array.isArray(product.color)
            ? product.color
            : product.color
              ? [product.color]
              : [];
          const preferredColor = productColors[0];
          await toggleWishlistMutation({
            userId: user.id,
            productId: String(product.id),
            color: preferredColor,
            adding: isAdding,
          }).unwrap();
        } catch (error) {
          console.error("Failed to sync wishlist:", error);
        }
      }
    });
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    requireAuth(() => {
      const productColors = Array.isArray(product.color)
        ? product.color
        : product.color
          ? [product.color]
          : [];
      const preferredColor = productColors[0];
      dispatch(
        addToCart({
          item: {
            id: String(product.id),
            name: product.title || product.name || "",
            price: product.price,
            image: product.img || product.image_url || "/image-1.png",
            color: preferredColor,
            stock: Number(product.stock) || 0,
          },
        }),
      );
    });
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll > 0) setScrollProgress(el.scrollLeft / maxScroll);
  };

  useEffect(() => {
    const updateOverflowState = () => {
      const el = scrollRef.current;
      if (!el) {
        setHasHorizontalOverflow(false);
        setScrollProgress(0);
        return;
      }

      const maxScroll = el.scrollWidth - el.clientWidth;
      setHasHorizontalOverflow(maxScroll > 0);

      if (maxScroll <= 0) {
        setScrollProgress(0);
      }
    };

    updateOverflowState();
    window.addEventListener("resize", updateOverflowState);

    return () => {
      window.removeEventListener("resize", updateOverflowState);
    };
  }, [products]);

  return (
    <div className="w-full">
      <div className="px-3 sm:px-5 md:px-10 lg:px-40 pt-5 md:pt-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-0">
          <h1 className="text-[28px] sm:text-4xl lg:text-5xl font-medium leading-[1.08] sm:leading-[1.1] wrap-break-word">
            New <br className="block sm:hidden" /> Arrivals
          </h1>
          <div className="hidden md:block self-end">
            <ButtonText text="More Products" linkTo="shop" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="pl-3 sm:pl-5 md:pl-10 lg:pl-40 mt-6 md:mt-10 flex gap-4 md:gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-55 sm:w-60 md:w-60 shrink-0 animate-pulse"
            >
              <div className="w-full aspect-4/5 bg-gray-200 rounded" />
              <div className="mt-3 h-4 bg-gray-200 rounded w-3/4" />
              <div className="mt-2 h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="pl-3 sm:pl-5 md:pl-10 lg:pl-40 mt-6 md:mt-10">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className={`flex gap-4 md:gap-6 pb-2 ${hasHorizontalOverflow ? "overflow-x-auto" : "overflow-x-hidden"}`}
          >
            {products.map((card: Product) => (
              <ArrivalCard
                key={card.id}
                card={card}
                isMounted={isMounted}
                isInWishlist={isInWishlist}
                handleWishlistToggle={handleWishlistToggle}
                handleAddToCart={handleAddToCart}
                getRating={getRating}
              />
            ))}
          </div>
          <div className="pr-5 md:pr-10 lg:pr-40 mt-2">
            <div
              className={`h-0.5 bg-gray-200 rounded-full relative ${hasHorizontalOverflow ? "opacity-100" : "opacity-0"}`}
            >
              <div
                className="h-full bg-[#141718] rounded-full absolute top-0 left-0 transition-all duration-150"
                style={{ width: "33%", left: `${scrollProgress * 67}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="md:hidden px-3 sm:px-5 mt-6 pb-8">
        <ButtonText text="More Products" linkTo="shop" />
      </div>
    </div>
  );
};

export default Arrivals;
