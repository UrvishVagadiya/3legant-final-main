"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAppDispatch, useAppSelector, RootState } from "@/store";
import { addToCart } from "@/store/slices/cartSlice";
import { useGetProductsQuery } from "@/store/api/productApi";
import {
  useGetWishlistItemsQuery,
  useToggleWishlistMutation,
} from "@/store/api/wishlistApi";
import { useGetRatingsByProductsQuery } from "@/store/api/reviewApi";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useIsMounted } from "@/hooks/useIsMounted";
import ProductCard from "@/components/ui/ProductCard";
import { typography } from "@/constants/typography";
import type { Product } from "@/store/slices/productSlice";

export default function YouMightAlsoLike() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { requireAuth } = useAuthGuard();
  const isMounted = useIsMounted();

  const { data: allProducts = [] } = useGetProductsQuery();
  const { data: wishlistItems = [] } = useGetWishlistItemsQuery(
    user?.id ?? "",
    { skip: !user?.id },
  );
  const [toggleWishlist] = useToggleWishlistMutation();

  const productIds = useMemo(
    () => allProducts.map((p) => String(p.id)),
    [allProducts],
  );
  const { data: ratingsByProduct = {} } = useGetRatingsByProductsQuery(
    productIds,
    { skip: productIds.length === 0 },
  );

  const products = useMemo(() => {
    if (allProducts.length === 0) return [];
    const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6);
  }, [allProducts]);

  const getRating = (productId: string | number) => {
    return (
      ratingsByProduct[String(productId)] || { avgRating: 0, reviewCount: 0 }
    );
  };

  const isInWishlist = (id: string | number) =>
    wishlistItems.some((i) => i.id == id);

  const handleWishlistToggle = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    requireAuth(async () => {
      if (!user) return;
      const productColors = Array.isArray(product.color)
        ? product.color
        : product.color
          ? [product.color]
          : [];
      const preferredColor = productColors[0];
      const currentlyIn = isInWishlist(product.id);
      await toggleWishlist({
        userId: user.id,
        productId: String(product.id),
        color: preferredColor,
        adding: !currentlyIn,
      });
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

  return (
    <div className="w-full mt-10 md:mt-20">
      <div className="flex justify-between items-end mb-8">
        <h2 className={`${typography.h5}`}>You might also like</h2>
        <Link
          href="/shop"
          className={`group flex items-center gap-1 ${typography.buttonSmall} hover:text-gray-600 transition-colors border-b-2 border-black pb-0.5`}
        >
          More Products{" "}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="flex overflow-x-auto gap-4 md:gap-6 pb-4">
        {products.map((card: Product) => (
          <div key={card.id} className="w-62.5 md:w-70 shrink-0">
            <ProductCard
              product={card}
              isMounted={isMounted}
              isWishlisted={isInWishlist(card.id)}
              onWishlistToggle={(e) => handleWishlistToggle(e, card)}
              onAddToCart={(e) => handleAddToCart(e, card)}
              linkTo={`/product/${card.id}`}
              avgRating={getRating(card.id).avgRating}
              reviewCount={getRating(card.id).reviewCount}
              showColors={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
