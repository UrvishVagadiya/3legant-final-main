"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useMemo, useEffect } from "react";
import { MdKeyboardArrowRight } from "react-icons/md";
import { useAppDispatch, useAppSelector, RootState } from "@/store";
import { addToCart, updateQuantity } from "@/store/slices/cartSlice";
import { useGetReviewsQuery } from "@/store/api/reviewApi";
import {
  useGetWishlistItemsQuery,
  useToggleWishlistMutation,
} from "@/store/api/wishlistApi";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useIsMounted } from "@/hooks/useIsMounted";
import YouMightAlsoLike from "./YouMightAlsoLike";
import CountdownTimer from "./CountdownTimer";
import ColorSelector, { colorMap } from "./ColorSelector";
import { isOfferExpired } from "@/utils/isOfferExpired";
import { isProductNew } from "@/utils/isProductNew";
import ProductActions from "./ProductActions";
import AccordionItem from "./AccordionItem";
import AdditionalInfo from "./AdditionalInfo";
import FAQList from "./FAQList";
import ReviewsSection from "./ReviewsSection";
import TintedProductImage from "./TintedProductImage";
import { RatingStars } from "@/components/ui/ProductCard";
import { typography } from "@/constants/typography";
import { Swiper, SwiperSlide } from "swiper/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Autoplay,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import type { Product } from "@/store/slices/productSlice";
import type { Review } from "@/store/api/reviewApi";

const refImages = [
  "/table/tray_table_premium.png",
  "/table/image-1.png",
  "/table/image-2.png",
  "/table/table10.png",
  "/table/table3.png",
  "/table/table5.png",
];

export const DisplayProduct = ({ p }: { p: Product }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { items: cartItems } = useAppSelector((state: RootState) => state.cart);
  const isMounted = useIsMounted();
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState<string | null>("");
  const colorOptions: string[] = Array.isArray(p.color)
    ? p.color
    : p.color
      ? [p.color]
      : ["Black"];
  const [selectedColor, setSelectedColor] = useState(
    colorOptions[0] || "Black",
  );

  const { data: reviews = [] } = useGetReviewsQuery({
    productId: String(p.id),
    userId: user?.id,
  });
  const { data: wishlistItems = [] } = useGetWishlistItemsQuery(
    user?.id ?? "",
    { skip: !user?.id },
  );
  const [toggleWishlist] = useToggleWishlistMutation();

  const isInWishlist = (id: string | number) =>
    wishlistItems.some((i) => i.id == id);
  const { requireAuth } = useAuthGuard();

  const pid = String(p.id || p.sku || "");
  const expired = isOfferExpired(p.valid_until || p.validUntil);
  const rawPrice =
    typeof p.price === "number"
      ? p.price
      : parseFloat(String(p.price).replace("$", ""));
  const rawMrp =
    typeof (p.mrp || p.oldprice) === "number"
      ? p.mrp || p.oldprice
      : parseFloat(String(p.mrp || p.oldprice).replace("$", ""));
  const safeMrp = rawMrp || 0;
  const price = expired && safeMrp > rawPrice ? safeMrp : rawPrice;
  const mrp = expired ? 0 : safeMrp;
  const stockCount = p.stock ?? 0;

  const img = p.img || p.image_url || p.image || refImages[0];
  const colorHex = colorMap[selectedColor] || "#6B7280";
  const shouldTint = selectedColor.toLowerCase() !== "white";

  const handleWishlistToggle = () =>
    requireAuth(async () => {
      const currentlyIn = isInWishlist(pid);
      await toggleWishlist({
        userId: user!.id,
        productId: String(pid),
        color: selectedColor,
        adding: !currentlyIn,
      });
    });

  const handleAddToCart = () =>
    requireAuth(() => {
      dispatch(
        addToCart({
          item: {
            id: String(pid),
            name: p.name || p.title || "Tray Table",
            price,
            mrp: safeMrp || undefined,
            validUntil: p.validUntil || p.valid_until || null,
            image: img,
            color: selectedColor,
            stock: p.stock || 0,
          },
        }),
      );
      if (quantity > 1) {
        dispatch(
          updateQuantity({ id: String(pid), color: selectedColor, quantity }),
        );
      }
    });

  useEffect(() => {
    const matchingItem = cartItems.find(
      (item) => item.id === String(pid) && item.color === selectedColor,
    );

    setQuantity(matchingItem?.quantity ?? 1);
  }, [cartItems, pid, selectedColor]);

  if (!isMounted) return null;

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) /
        reviews.length
      : 0;

  const productImages =
    p.images && Array.isArray(p.images) && p.images.length > 0
      ? p.images
      : [img, ...refImages.slice(1)];

  const primaryCategory = Array.isArray(p.category)
    ? p.category[0]
    : String(p.category || "")
        .split(",")[0]
        .trim();

  return (
    <div className="w-full max-w-full overflow-x-hidden px-4 md:px-8 xl:px-40 py-4 md:py-10">
      <div className="flex flex-wrap items-center gap-3 text-[14px] font-medium mb-8 text-[#6C7275]">
        <Link href="/" className="hover:text-[#141718] transition-colors">
          Home
        </Link>
        <MdKeyboardArrowRight className="text-xl" />
        <Link href="/shop" className="hover:text-[#141718] transition-colors">
          Shop
        </Link>
        {primaryCategory && (
          <>
            <MdKeyboardArrowRight className="text-xl" />
            <Link
              href={`/shop?category=${encodeURIComponent(primaryCategory)}`}
            >
              <span className="hover:text-[#141718] transition-colors cursor-pointer capitalize">
                {primaryCategory}
              </span>
            </Link>
          </>
        )}
        <MdKeyboardArrowRight className="text-xl" />
        <span className="text-[#141718]">{p.name || p.title || "Product"}</span>
      </div>

      <div className="w-full max-w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 relative overflow-hidden">
        <div className="w-full">
          <div className="sm:hidden mb-4 relative">
            <button
              className="product-swiper-prev absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center shadow"
              aria-label="Previous product image"
            >
              <ChevronLeft size={18} className="text-[#141718]" />
            </button>
            <button
              className="product-swiper-next absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center shadow"
              aria-label="Next product image"
            >
              <ChevronRight size={18} className="text-[#141718]" />
            </button>
            <Swiper
              modules={[Navigation, Pagination, Scrollbar, Autoplay, A11y]}
              spaceBetween={12}
              slidesPerView={1}
              loop={true}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              navigation={{
                prevEl: ".product-swiper-prev",
                nextEl: ".product-swiper-next",
              }}
              pagination={{ clickable: true }}
              className="w-full"
            >
              {productImages.slice(0, 6).map((itemSrc: string, idx: number) => (
                <SwiperSlide key={idx}>
                  <div className="relative w-full aspect-3/4 bg-[#F3F5F7] group">
                    {idx === 0 && (
                      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                        {(p.isNew ??
                          isProductNew(p.created_at || p.createdAt)) && (
                          <span className="bg-white text-black text-sm font-bold px-3 py-1 rounded w-fit">
                            NEW
                          </span>
                        )}
                        {!expired &&
                          (safeMrp > p.price ||
                            (p.oldprice ?? 0) > p.price) && (
                            <span className="bg-[#38CB89] text-white text-sm font-bold px-3 py-1 rounded w-fit">
                              -
                              {Math.round(
                                ((safeMrp - p.price) / safeMrp) * 100,
                              )}
                              %
                            </span>
                          )}
                      </div>
                    )}

                    {idx === 0 ? (
                      <TintedProductImage
                        src={itemSrc}
                        alt={`Product view ${idx + 1}`}
                        fill
                        unoptimized
                        className="w-full h-full max-w-full object-cover object-center transition-all duration-500"
                        colorHex={shouldTint ? colorHex : null}
                      />
                    ) : (
                      <Image
                        src={itemSrc}
                        alt={`Product view ${idx + 1}`}
                        fill
                        unoptimized
                        className="w-full h-full max-w-full object-cover object-center transition-all duration-500"
                      />
                    )}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <div className="hidden sm:grid sm:grid-cols-2 gap-4">
            <div className="relative w-full aspect-3/4 bg-[#F3F5F7] group mb-4 sm:mb-0">
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {(p.isNew ?? isProductNew(p.created_at || p.createdAt)) && (
                  <span className="bg-white text-black text-sm font-bold px-3 py-1 rounded w-fit">
                    NEW
                  </span>
                )}
                {!expired &&
                  (safeMrp > p.price || (p.oldprice ?? 0) > p.price) && (
                    <span className="bg-[#38CB89] text-white text-sm font-bold px-3 py-1 rounded w-fit">
                      -{Math.round(((safeMrp - p.price) / safeMrp) * 100)}%
                    </span>
                  )}
              </div>
              <TintedProductImage
                src={productImages[0]}
                alt="Product view 1"
                fill
                unoptimized
                className="w-full h-full max-w-full object-cover object-center transition-all duration-500"
                colorHex={shouldTint ? colorHex : null}
              />
            </div>
            {productImages.slice(1, 6).map((itemSrc: string, n: number) => (
              <div
                key={n}
                className="relative w-full aspect-3/4 bg-[#F3F5F7] hidden sm:block"
              >
                <Image
                  src={itemSrc}
                  alt={`Product view ${n + 2}`}
                  fill
                  unoptimized
                  className="w-full h-full max-w-full object-cover object-center transition-all duration-500"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:sticky lg:top-10 h-fit flex flex-col gap-6">
          <div className="flex flex-col gap-4 border-b border-[#E8ECEF] pb-6">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <RatingStars
                  rating={avgRating}
                  className="text-[#141718] text-lg md:text-xl"
                />
                <span className="text-sm font-medium text-[#141718] ml-1">
                  {avgRating.toFixed(1)}
                </span>
              </div>
              <span className="text-[#6C7275] text-sm">
                ({reviews.length} {reviews.length === 1 ? "Review" : "Reviews"})
              </span>
            </div>
            <h1 className={`${typography.h4} text-[#141718]`}>
              {p.name || "Tray Table"}
            </h1>
            <p className={`${typography.text16} text-[#6C7275]`}>
              {p.description ||
                "Buy one or buy a few and make every space where you sit more convenient. Light and easy to move around with removable tray top, handy for serving snacks."}
            </p>
            <div className="flex items-center gap-3">
              <p className="text-[28px] font-medium text-[#141718] tracking-tight">
                ${price.toFixed(2)}
              </p>
              {mrp > 0 && mrp > price && (
                <p className="text-[20px] font-medium text-[#6C7275] line-through">
                  ${mrp.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          {!expired && (
            <CountdownTimer
              validUntil={p.validUntil ?? p.valid_until ?? undefined}
            />
          )}
          <ColorSelector
            colors={colorOptions}
            selected={selectedColor}
            onSelect={setSelectedColor}
            measurements={p.measurements ?? undefined}
          />
          <ProductActions
            quantity={quantity}
            onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
            onIncrease={() =>
              setQuantity((q) =>
                stockCount > 0 ? Math.min(stockCount, q + 1) : q + 1,
              )
            }
            isWishlisted={isMounted && wishlistItems.some((i) => i.id == pid)}
            onWishlistToggle={handleWishlistToggle}
            onAddToCart={handleAddToCart}
            stock={p.stock}
          />

          <div className="flex flex-col gap-3 py-2 text-[#6C7275] text-[12px]">
            <div className="flex uppercase">
              <span className="w-24 text-[14px]">SKU</span>
              <span className="text-[#141718] text-[14px]">
                {p.sku || "1117"}
              </span>
            </div>
            <div className="flex uppercase">
              <span className="w-24 text-[14px]">CATEGORY</span>
              <span className="text-[#141718] text-[14px] capitalize">
                {Array.isArray(p.category)
                  ? p.category.join(", ")
                  : p.category || "Living Room, Bedroom"}
              </span>
            </div>
          </div>

          <div className="flex flex-col pt-4">
            <AccordionItem
              id="details"
              title="Additional Info"
              isOpen={openAccordion === "details"}
              onToggle={(id) =>
                setOpenAccordion(openAccordion === id ? null : id)
              }
            >
              <AdditionalInfo
                measurements={p.measurements ?? undefined}
                weight={p.weight ?? undefined}
              />
            </AccordionItem>
            <AccordionItem
              id="questions"
              title="Questions"
              isOpen={openAccordion === "questions"}
              onToggle={(id) =>
                setOpenAccordion(openAccordion === id ? null : id)
              }
              maxHeight="max-h-[600px]"
            >
              <FAQList />
            </AccordionItem>
            <AccordionItem
              id="reviews"
              title={`Reviews (${reviews.length})`}
              isOpen={openAccordion === "reviews"}
              onToggle={(id) =>
                setOpenAccordion(openAccordion === id ? null : id)
              }
              maxHeight="max-h-[800px]"
              scrollOnOpen
              borderClass="border-y border-[#E8ECEF]"
            >
              <ReviewsSection
                productId={String(p.id)}
                productName={p.name || "Product"}
              />
            </AccordionItem>
          </div>
        </div>
      </div>
      <YouMightAlsoLike />
    </div>
  );
};
