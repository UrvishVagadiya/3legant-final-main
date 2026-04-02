"use client";
import React, { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import CheckoutStepper from "@/components/sections/CheckoutStepper";
import { useAppDispatch } from "@/store";
import { clearCart } from "@/store/slices/cartSlice";
import { typography } from "@/constants/typography";

interface OrderItem {
  id: string;
  name: string;
  color: string;
  quantity: number;
  price: number;
  image: string;
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

const Complete = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (sessionId) {
      const fetchOrderData = async () => {
        try {
          const res = await fetch(
            `/api/stripe/session?session_id=${encodeURIComponent(sessionId)}`,
          );
          if (res.ok) {
            const data = await res.json();
            setOrderData(data);
            dispatch(clearCart());
            sessionStorage.removeItem("pendingOrder");
          } else {
            router.push("/");
          }
        } catch (err) {
          router.push("/");
        } finally {
          setLoading(false);
        }
      };
      fetchOrderData();
    } else {
      const stored = sessionStorage.getItem("lastOrder");
      if (stored) {
        setOrderData(JSON.parse(stored));
        setLoading(false);
      } else {
        router.push("/");
      }
    }
  }, [searchParams, router, dispatch]);

  if (loading || !orderData) {
    return (
      <div className="max-w-300 mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 mb-20 font-inter text-[#141718]">
        <div className="flex flex-col items-center justify-center mb-8 md:mb-20">
          <h1 className={`${typography.h3} mb-8`}>Processing...</h1>
          <CheckoutStepper step={3} />
        </div>
        <div className="max-w-184.5 w-full mx-auto bg-white rounded-2xl md:shadow-[0px_8px_40px_rgba(0,0,0,0.08)] py-20 md:py-32 px-6 md:px-20 flex flex-col items-center justify-center min-h-100">
          <Loader2 className="w-12 h-12 text-[#141718] animate-spin mb-6" />
          <h2 className={`${typography.h6} text-center`}>
            Confirming your payment...
          </h2>
          <p className={`${typography.text16} text-[#6C7275] mt-2 text-center`}>
            This will only take a moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-300 mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 mb-20 font-inter text-[#141718]">
      <div className="flex flex-col items-center justify-center mb-8 md:mb-20">
        <h1 className={`${typography.h3} mb-8`}>Complete!</h1>
        <CheckoutStepper step={3} />
      </div>

      <div className="max-w-184.5 w-full mx-auto bg-white rounded-2xl md:shadow-[0px_8px_40px_rgba(0,0,0,0.08)] py-12 md:py-20 px-6 md:px-20 flex flex-col items-center">
        <p className={`${typography.text20Semibold} text-[#6C7275] mb-4`}>
          Thank you! 🎉
        </p>
        <h2 className={`${typography.h4} mb-12 text-center`}>
          Your order has been
          <br />
          received
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-12">
          {orderData.items.map((item) => (
            <div
              key={item.id}
              className="relative w-20 h-24 bg-[#F3F5F7] rounded shrink-0 flex items-center justify-center"
            >
              <Image
                src={item.image || "/image-1.png"}
                alt={item.name}
                fill
                unoptimized
                className="object-cover p-2"
              />
              <div className="absolute -top-3 -right-3 bg-[#141718] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 border-white shadow-sm">
                {item.quantity}
              </div>
            </div>
          ))}
        </div>

        <div className="w-full max-w-95">
          <div className="grid grid-cols-[140px_1fr] md:grid-cols-[160px_1fr] gap-y-6 mb-12 text-[15px]">
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
            <span className="font-semibold text-[#141718]">
              {orderData.paymentMethod}
            </span>
          </div>
        </div>

        <Link href="/account?tab=orders">
          <button
            className={`bg-[#141718] text-white px-10 py-3 md:py-4 rounded-full ${typography.buttonSmall} hover:bg-black transition-colors min-w-50 flex items-center justify-center mt-4`}
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
