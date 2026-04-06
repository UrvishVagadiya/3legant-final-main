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
    <section className="mt-10 md:mt-16">
      <div className="mb-5 flex items-center justify-between gap-3 md:mb-6">
        <h2 className="text-xl font-semibold text-[#141718] sm:text-2xl">
          You might also like
        </h2>
        <Link
          href="/shop"
          className="group inline-flex items-center gap-1 text-sm font-medium text-[#141718] transition hover:opacity-70"
        >
          More products
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3">
        {products.map((card: Product) => (
          <div
            key={card.id}
            className="w-60 shrink-0 sm:w-65 md:w-70"
          >
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
    </section>
  );
}
