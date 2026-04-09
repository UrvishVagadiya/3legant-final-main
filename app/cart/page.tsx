"use client";
import { useEffect, useState } from "react";
import { X, Ticket } from "lucide-react";
import CheckoutStepper from "@/components/sections/CheckoutStepper";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import CouponSuggestions from "@/components/cart/CouponSuggestions";
import { useAppDispatch, useAppSelector, RootState } from "@/store";
import {
  removeFromCart,
  updateQuantity,
  setShippingMethod,
  setAppliedCoupon,
  removeCoupon,
} from "@/store/slices/cartSlice";
import { useIsMounted } from "@/hooks/useIsMounted";
import { getShippingCost } from "@/utils/getShippingCost";
import { calculateCouponDiscount, validateCoupon } from "@/utils/coupon";
import toast from "react-hot-toast";
import { typography } from "@/constants/typography";
import { getEffectiveCartLineTotal } from "@/utils/getEffectiveCartPrice";

const Cart = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { items, shippingMethod, appliedCoupon, couponDiscount } =
    useAppSelector((state: RootState) => state.cart);

  const isMounted = useIsMounted();
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const handleRemoveItem = (id: string, color: string) => {
    dispatch(removeFromCart({ id, color }));
  };

  const handleUpdateQuantity = (
    id: string,
    color: string,
    quantity: number,
  ) => {
    const item = items.find((i) => i.id === id && i.color === color);
    if (!item) return;

    if (quantity < 0) return;
    if (quantity === 0) {
      dispatch(updateQuantity({ id, color, quantity }));
      return;
    }

    if (item.stock <= 0 || quantity > item.stock) return;

    dispatch(updateQuantity({ id, color, quantity }));
  };

  const handleSetShippingMethod = (method: string) => {
    dispatch(setShippingMethod(method));
  };

  const subtotal = items.reduce(
    (acc, curr) => acc + getEffectiveCartLineTotal(curr),
    0,
  );
  const total =
    subtotal + getShippingCost(shippingMethod, subtotal) - couponDiscount;

  useEffect(() => {
    if (!appliedCoupon) {
      return;
    }

    if (subtotal < appliedCoupon.min_order_amount) {
      dispatch(removeCoupon());
      toast.error(
        `Coupon removed. Minimum order amount is $${appliedCoupon.min_order_amount.toFixed(2)}`,
      );
      return;
    }

    const nextDiscount = calculateCouponDiscount(appliedCoupon, subtotal);
    if (nextDiscount !== couponDiscount) {
      dispatch(
        setAppliedCoupon({ coupon: appliedCoupon, discount: nextDiscount }),
      );
    }
  }, [appliedCoupon, subtotal, couponDiscount, dispatch]);

  if (!isMounted) return null;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    const result = await validateCoupon(couponCode.trim(), subtotal, user?.id);
    if (result.valid && result.coupon) {
      dispatch(
        setAppliedCoupon({ coupon: result.coupon, discount: result.discount }),
      );
      setCouponCode("");
      toast.success(`Coupon applied! -$${result.discount.toFixed(2)}`);
    } else {
      toast.error(result.error || "Invalid coupon");
    }
    setCouponLoading(false);
  };

  return (
    <div className="max-w-300 mx-auto px-4 sm:px-6 md:px-7 lg:px-8 py-8 md:py-10 mb-6 font-inter text-[#141718]">
      <div className="flex flex-col items-center justify-center mb-8">
        <h1 className={`${typography.h3} mb-4`}>Cart</h1>
        <CheckoutStepper step={1} />
      </div>

      <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-6 lg:gap-16 w-full">
        <div className="w-full md:w-[58%] lg:w-[65%]">
          <div className="hidden md:grid grid-cols-12 pb-4 border-b border-gray-300 text-sm font-semibold text-gray-500">
            <div className="col-span-6">Product</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-center">Price</div>
            <div className="col-span-2 text-right">Subtotal</div>
          </div>

          {items.map((item) => (
            <CartItem
              key={`${item.id}-${item.color}`}
              item={item}
              onRemove={handleRemoveItem}
              onUpdateQuantity={handleUpdateQuantity}
            />
          ))}

          <div className="mt-8 md:mt-6 lg:mt-8">
            <h3 className={`${typography.text18Semibold} mb-2`}>
              Have a coupon?
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Add your code for an instant cart discount
            </p>
            {appliedCoupon && (
              <div className="flex items-center gap-2 mb-3 text-sm">
                <Ticket size={16} className="text-[#38CB89]" />
                <span className="font-medium">{appliedCoupon.code}</span>
                <span className="text-[#38CB89]">
                  -${couponDiscount.toFixed(2)}
                </span>
                <button
                  onClick={() => {
                    dispatch(removeCoupon());
                  }}
                  className="cursor-pointer text-gray-400 hover:text-black ml-1"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            <div className="flex items-center border border-gray-300 rounded overflow-hidden max-w-sm md:max-w-full lg:max-w-sm mb-2">
              <div className="pl-3 text-gray-400">
                <Ticket size={20} />
              </div>
              <input
                type="text"
                placeholder="Coupon Code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="w-full py-2 px-3 outline-none text-sm placeholder-gray-400"
              />
              <button
                onClick={handleApplyCoupon}
                className="px-4 py-2 cursor-pointer font-semibold text-sm hover:bg-gray-100 transition-colors"
              >
                {couponLoading ? "..." : "Apply"}
              </button>
            </div>
            <div className="max-w-sm md:max-w-full lg:max-w-sm">
              <CouponSuggestions
                onSelect={(code: string) => {
                  setCouponCode(code);
                  setTimeout(() => handleApplyCoupon(), 0);
                }}
                subtotal={subtotal}
              />
            </div>
          </div>
        </div>

        <CartSummary
          subtotal={subtotal}
          total={total}
          shippingMethod={shippingMethod}
          setShippingMethod={handleSetShippingMethod}
          hasItems={items.length > 0}
        />
      </div>
    </div>
  );
};

export default Cart;
