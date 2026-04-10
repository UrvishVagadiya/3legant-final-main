"use client";

import { useEffect, useState } from "react";
import { Ticket, Sparkles, AlertCircle } from "lucide-react";
import { Coupon } from "@/utils/coupon";

interface CouponSuggestionsProps {
  onSelect: (code: string) => void;
  subtotal: number;
}

export default function CouponSuggestions({
  onSelect,
  subtotal,
}: CouponSuggestionsProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await fetch("/api/coupons/active");
        if (res.ok) {
          const data = await res.json();
          setCoupons(data);
        }
      } catch (error) {
        console.error("Failed to fetch coupons:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  if (loading) return null;
  if (coupons.length === 0) return null;

  const shouldScroll = coupons.length > 1;

  return (
    <div className="mt-4 p-4 bg-[#F3F5F7] rounded-xl border border-[#E8ECEF] animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} className="text-[#38CB89]" />
        <h4 className="text-sm font-semibold text-[#141718]">
          Available Offers
        </h4>
      </div>

      <div
        className={`flex flex-col gap-2 ${shouldScroll ? "max-h-27 overflow-y-auto pr-1 scrollbar-subtle" : ""}`}
      >
        {coupons.map((coupon) => {
          const isEligible = subtotal >= coupon.min_order_amount;

          return (
            <button
              key={coupon.id}
              onClick={() => isEligible && onSelect(coupon.code)}
              disabled={!isEligible}
              className={`group relative cursor-pointer flex flex-col items-start p-3 rounded-lg border transition-all text-left ${
                isEligible
                  ? "bg-white border-[#E8ECEF] hover:border-[#38CB89] hover:shadow-sm"
                  : "bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1 rounded ${isEligible ? "bg-[#38CB89]/10 text-[#38CB89]" : "bg-gray-200 text-gray-500"}`}
                  >
                    <Ticket size={14} />
                  </div>
                  <span className="font-bold text-[14px] tracking-tight">
                    {coupon.code}
                  </span>
                </div>
                <span
                  className={`text-[13px] font-bold ${isEligible ? "text-[#38CB89]" : "text-gray-400"}`}
                >
                  {coupon.discount_type === "percentage"
                    ? `${coupon.discount_value}% OFF`
                    : `$${coupon.discount_value} OFF`}
                </span>
              </div>

              {!isEligible && (
                <div className="flex items-center gap-1 mt-1 text-[11px] text-[#6C7275]">
                  <AlertCircle size={12} />
                  <span>
                    Add ${(coupon.min_order_amount - subtotal).toFixed(2)} more
                    to unlock
                  </span>
                </div>
              )}

              {isEligible && (
                <span className="text-[11px] cursor-pointer text-[#6C7275] group-hover:text-[#38CB89] transition-colors">
                  Tap to apply discount
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
