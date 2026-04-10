"use client";
import React, { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import CheckoutStepper from "@/components/sections/CheckoutStepper";
import TintedProductImage from "@/components/product/TintedProductImage";
import { colorMap } from "@/components/product/ColorSelector";
import { useAppDispatch } from "@/store";
import { clearCart } from "@/store/slices/cartSlice";
import { typography } from "@/constants/typography";
import { createClient } from "@/utils/supabase/client";

interface OrderItem {
  id: string;
  name: string;
  color: string;
  quantity: number;
  price: number;
  image?: string;
}

interface OrderData {
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  orderCode: string;
  date: string;
}

type ProductRow = {
  id: string;
  img?: string | null;
  images?: string[] | null;
};

const Complete = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  const normalizeImage = (image?: string) => {
    const value = String(image || "").trim();
    if (!value || value === "null" || value === "undefined") {
      return "/image-1.png";
    }
    return value;
  };

  const getColorHex = (color?: string) => {
    if (!color) return null;
    const normalized = color.trim();
    if (!normalized) return null;

    const direct = colorMap[normalized];
    if (direct) return direct;

    const titleCase =
      normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
    return colorMap[titleCase] || null;
  };

  const fetchProductImages = async (items: OrderItem[]) => {
    const supabase = createClient();
    const productIds = Array.from(
      new Set(items.map((item) => item.id).filter(Boolean)),
    );

    if (productIds.length === 0) {
      return items.map((item) => ({
        ...item,
        image: normalizeImage(item.image),
      }));
    }

    const { data } = await supabase
      .from("products")
      .select("id, img, images")
      .in("id", productIds);

    const productMap = new Map<string, ProductRow>(
      (data || []).map((product: ProductRow) => [product.id, product]),
    );

    return items.map((item) => {
      const product = productMap.get(item.id);
      const productImage =
        product?.img ||
        (Array.isArray(product?.images) ? product.images?.[0] : undefined) ||
        item.image;

      return {
        ...item,
        image: normalizeImage(productImage),
      };
    });
  };

  useEffect(() => {
    const loadOrder = async () => {
      const sessionId = searchParams.get("session_id");

      try {
        if (sessionId) {
          const res = await fetch(
            `/api/stripe/session?session_id=${encodeURIComponent(sessionId)}`,
          );

          if (!res.ok) {
            router.push("/");
            return;
          }

          const data = await res.json();
          const itemsWithImages = await fetchProductImages(
            (data.items || []) as OrderItem[],
          );

          setOrderData({
            ...data,
            items: itemsWithImages,
          });
          dispatch(clearCart());
          sessionStorage.removeItem("pendingOrder");
          return;
        }

        const stored = sessionStorage.getItem("pendingOrder");
        if (!stored) {
          router.push("/");
          return;
        }

        const parsed = JSON.parse(stored);
        const itemsWithImages = await fetchProductImages(
          (parsed.items || []).map((item: OrderItem) => ({
            ...item,
            image: normalizeImage(item.image),
          })),
        );

        setOrderData({
          ...parsed,
          items: itemsWithImages,
          paymentMethod: parsed.paymentMethod || "Credit Card (Stripe)",
          orderCode: parsed.orderCode || "Pending Confirmation",
          date:
            parsed.date ||
            new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
        });
      } catch {
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [searchParams, router, dispatch]);

  if (loading || !orderData) {
    return (
      <div className="navbar-container py-8 md:py-16 mb-16 md:mb-20 font-inter text-[#141718]">
        <div className="flex flex-col items-center justify-center mb-8 md:mb-20">
          <h1 className="font-poppins text-[32px] leading-[1.1] sm:text-[42px] md:text-[54px] md:leading-[1.05] tracking-tight mb-6 md:mb-8 text-center">
            Processing...
          </h1>
          <CheckoutStepper step={3} />
        </div>
        <div className="max-w-184.5 w-full mx-auto bg-white rounded-2xl md:shadow-[0px_8px_40px_rgba(0,0,0,0.08)] py-14 sm:py-16 md:py-24 px-5 sm:px-6 md:px-20 flex flex-col items-center justify-center min-h-80 sm:min-h-100">
          <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-[#141718] animate-spin mb-5 sm:mb-6" />
          <h2 className="font-poppins text-[24px] sm:text-[28px] leading-[1.2] text-center">
            Confirming your payment...
          </h2>
          <p className="text-sm sm:text-base text-[#6C7275] mt-2 text-center">
            This will only take a moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="navbar-container py-8 md:py-16 mb-16 md:mb-20 font-inter text-[#141718]">
      <div className="flex flex-col items-center justify-center mb-8 md:mb-20">
        <h1 className="font-poppins text-[32px] leading-[1.1] sm:text-[42px] md:text-[54px] md:leading-[1.05] tracking-tight mb-6 md:mb-8 text-center">
          Complete!
        </h1>
        <CheckoutStepper step={3} />
      </div>

      <div className="max-w-184.5 w-full mx-auto bg-white rounded-2xl md:shadow-[0px_8px_40px_rgba(0,0,0,0.08)] py-10 sm:py-12 md:py-20 px-5 sm:px-6 md:px-20 flex flex-col items-center">
        <p className="text-base sm:text-lg md:text-xl font-semibold text-[#6C7275] mb-3 md:mb-4">
          Thank you! 🎉
        </p>
        <h2 className="font-poppins text-[28px] leading-[1.15] sm:text-[34px] md:text-[40px] md:leading-[1.1] mb-8 sm:mb-10 md:mb-12 text-center">
          Your order has been
          <br />
          received
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-8 mb-8 sm:mb-10 md:mb-12">
          {orderData.items.map((item, index) => (
            <div
              key={`${item.id}-${item.color}-${index}`}
              className="relative w-18 h-22 sm:w-20 sm:h-24 bg-[#F3F5F7] rounded shrink-0 flex items-center justify-center"
            >
              <div className="absolute inset-0 rounded overflow-hidden">
                <TintedProductImage
                  src={normalizeImage(item.image)}
                  alt={item.name}
                  fill
                  unoptimized
                  className="object-cover p-1.5 sm:p-2"
                  colorHex={
                    item.color?.toLowerCase() !== "white"
                      ? getColorHex(item.color)
                      : null
                  }
                  tintOpacity={0.22}
                />
              </div>
              <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-[#141718] text-white w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold border-2 border-white shadow-sm">
                {Number(item.quantity) || 1}
              </div>
            </div>
          ))}
        </div>

        <div className="w-full max-w-95">
          <div className="grid grid-cols-[105px_1fr] sm:grid-cols-[130px_1fr] md:grid-cols-[160px_1fr] gap-y-4 sm:gap-y-5 md:gap-y-6 mb-10 md:mb-12 text-sm sm:text-[15px]">
            <span className="font-semibold text-[#6C7275]">Order code:</span>
            <span className="font-semibold text-[#141718]">
              {orderData.orderCode}
            </span>

            <span className="font-semibold text-[#6C7275]">Date:</span>
            <span className="font-semibold text-[#141718]">
              {orderData.date}
            </span>

            <span className="font-semibold text-[#6C7275]">Total:</span>
            <span className="font-semibold text-[#141718]">
              ${Number(orderData.total).toFixed(2)}
            </span>

            <span className="font-semibold text-[#6C7275]">
              Payment method:
            </span>
            <span className="font-semibold text-[#141718] wrap-break-word">
              {orderData.paymentMethod}
            </span>
          </div>
        </div>

        <Link href="/account?tab=orders" className="w-full sm:w-auto">
          <button
            className={`bg-[#141718] cursor-pointer text-white px-8 sm:px-10 py-3 md:py-4 rounded-full ${typography.buttonSmall} hover:bg-black transition-colors w-full sm:min-w-50 flex items-center justify-center mt-2 sm:mt-4`}
          >
            Purchase history
          </button>
        </Link>
      </div>
    </div>
  );
};

export default function Page() {
  return (
    <Suspense>
      <Complete />
    </Suspense>
  );
}
