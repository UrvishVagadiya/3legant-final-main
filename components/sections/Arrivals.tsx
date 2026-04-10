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
            mrp:
              product.mrp || product.oldprice || product.old_price || undefined,
            validUntil: product.validUntil || product.valid_until || null,
            image: product.img || product.image_url || "/image-1.png",
            color: preferredColor,
            stock: Number(product.stock) || 0,
          },
        }),
      );
    });
  };

  useEffect(() => {
    const updateOverflowState = () => {
      const el = scrollRef.current;
      if (!el) {
        setHasHorizontalOverflow(false);
        return;
      }

      const maxScroll = el.scrollWidth - el.clientWidth;
      setHasHorizontalOverflow(maxScroll > 0);
    };

    updateOverflowState();
    window.addEventListener("resize", updateOverflowState);

    return () => {
      window.removeEventListener("resize", updateOverflowState);
    };
  }, [products]);

  return (
    <div className="w-full overflow-x-hidden">
      <div className="home-container pt-5 md:pt-14">
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
        <div className="home-container mt-6 md:mt-10 flex gap-4 md:gap-6 overflow-x-hidden">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-55 sm:w-60 md:w-65.5 shrink-0 animate-pulse"
            >
              <div className="w-full aspect-4/5 bg-gray-200 rounded" />
              <div className="mt-3 h-4 bg-gray-200 rounded w-3/4" />
              <div className="mt-2 h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="home-container mt-6 md:mt-10 overflow-x-hidden">
          <div
            ref={scrollRef}
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
        </div>
      )}

      <div className="home-container md:hidden mt-6 pb-8">
        <ButtonText text="More Products" linkTo="shop" />
      </div>
    </div>
  );
};

export default Arrivals;
