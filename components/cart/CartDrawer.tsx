"use client";

import { X, Plus, Minus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useIsMounted } from "@/hooks/useIsMounted";
import { useAppDispatch, useAppSelector, RootState } from "@/store";
import { useEffect } from "react";
import {
  toggleCart,
  removeFromCart,
  updateQuantity,
} from "@/store/slices/cartSlice";
import { useSyncCartMutation } from "@/store/api/cartApi";
import { colorMap } from "../product/ColorSelector";
import { typography } from "@/constants/typography";
import {
  getEffectiveCartLineTotal,
  getEffectiveCartPrice,
} from "@/utils/getEffectiveCartPrice";

export default function CartDrawer() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { isCartOpen, items } = useAppSelector(
    (state: RootState) => state.cart,
  );
  const isMounted = useIsMounted();
  const [syncCart] = useSyncCartMutation();

  useEffect(() => {
    if (user && isMounted) {
      syncCart({ userId: user.id, items });
    }
  }, [items, user, syncCart, isMounted]);

  if (!isMounted) return null;

  const computedSubtotal = items.reduce(
    (acc, item) => acc + getEffectiveCartLineTotal(item),
    0,
  );

  const handleDecrease = (item: (typeof items)[number]) => {
    if (item.quantity <= 0) return;
    dispatch(
      updateQuantity({
        id: item.id,
        color: item.color,
        quantity: item.quantity - 1,
      }),
    );
  };

  const handleIncrease = (item: (typeof items)[number]) => {
    if (item.stock <= 0 || item.quantity >= item.stock) return;
    dispatch(
      updateQuantity({
        id: item.id,
        color: item.color,
        quantity: item.quantity + 1,
      }),
    );
  };

  const handleRemove = (item: (typeof items)[number]) => {
    dispatch(removeFromCart({ id: item.id, color: item.color }));
  };

  const toSoftTint = (hexColor?: string) => {
    if (!hexColor) return undefined;

    if (/^#[\da-fA-F]{6}$/.test(hexColor)) {
      // 22% opacity tint to avoid over-darkening product images
      return `${hexColor}38`;
    }

    if (/^#[\da-fA-F]{3}$/.test(hexColor)) {
      const expanded = `#${hexColor[1]}${hexColor[1]}${hexColor[2]}${hexColor[2]}${hexColor[3]}${hexColor[3]}`;
      return `${expanded}38`;
    }

    return hexColor;
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-99996 transition-opacity duration-300 ${isCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => dispatch(toggleCart())}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-103.5 bg-white z-99997 transform transition-transform duration-300 ease-in-out flex flex-col font-inter ${isCartOpen ? "translate-x-0 shadow-2xl" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className={`${typography.h6} text-[#141718]`}>Cart</h2>
          <button
            onClick={() => dispatch(toggleCart())}
            className="p-2 -mr-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-6 h-6 text-[#141718]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-2 flex flex-col gap-6 scrollbar-hide">
          {items.map((item) => (
            <div
              key={`${item.id}-${item.color}`}
              className="flex gap-4 border-b border-[#E8ECEF] pb-6 last:border-0 last:pb-0"
            >
              <div
                className="relative w-20 h-24 bg-[#F3F5F7] rounded overflow-hidden shrink-0"
                style={{
                  backgroundColor:
                    item.color?.toLowerCase() !== "white" &&
                    colorMap[item.color as string]
                      ? toSoftTint(colorMap[item.color as string])
                      : undefined,
                }}
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  unoptimized
                  className="object-cover p-1 transition-all duration-300"
                  style={{
                    mixBlendMode:
                      item.color?.toLowerCase() !== "white" &&
                      colorMap[item.color as string]
                        ? "multiply"
                        : "normal",
                  }}
                />
              </div>
              <div className="flex flex-col flex-1 justify-between">
                <div className="flex justify-between items-start">
                  <div className="pt-1">
                    <h3
                      className={`${typography.text14Semibold} text-[#141718] mb-1`}
                    >
                      {item.name}
                    </h3>
                    <p className="text-[#6C7275] text-[12px] mb-3">
                      Color: {item.color}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 pt-1">
                    <span className="text-[#141718] font-semibold text-[14px]">
                      ${getEffectiveCartPrice(item).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemove(item)}
                      className="text-[#6C7275] hover:text-[#141718] cursor-pointer transition-colors p-1 mt-1 -mr-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between border border-[#6C7275] rounded w-20 h-8 px-2">
                  {/** Disable decrement at 1 and increment when stock limit is reached */}
                  <button
                    type="button"
                    onClick={() => handleDecrease(item)}
                    disabled={item.quantity <= 0}
                    className={`${item.quantity <= 0 ? "text-gray-300 " : "text-[#141718] hover:text-black"} cursor-pointer transition-colors`}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-[#141718] text-[12px] font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleIncrease(item)}
                    disabled={item.stock <= 0 || item.quantity >= item.stock}
                    className={`${item.stock <= 0 || item.quantity >= item.stock ? "text-gray-300 " : "text-[#141718] hover:text-black"} cursor-pointer transition-colors`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 pt-4 border-t border-[#E8ECEF] bg-white">
          <div className="flex justify-between items-center mb-4">
            <span className={`${typography.text16} text-[#141718]`}>
              Subtotal
            </span>
            <span className={`${typography.text16Semibold} text-[#141718]`}>
              ${computedSubtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center mb-6">
            <span className="text-[#141718] font-medium text-[20px]">
              Total
            </span>
            <span className="font-semibold text-[#141718] text-[20px]">
              ${computedSubtotal.toFixed(2)}
            </span>
          </div>

          {items.length === 0 ? (
            <button
              disabled
              className="w-full bg-gray-300 cursor-pointer text-gray-500  py-3.5 rounded-lg font-medium text-[16px] mb-4"
            >
              Checkout
            </button>
          ) : (
            <Link href="/checkout" onClick={() => dispatch(toggleCart())}>
              <button className="w-full cursor-pointer bg-[#141718] text-white py-3.5 rounded-lg font-medium text-[16px] mb-4 hover:bg-black transition-colors">
                Checkout
              </button>
            </Link>
          )}
          <Link
            href="/cart"
            onClick={() => dispatch(toggleCart())}
            className="block text-center w-full text-[#141718] font-medium text-[14px] underline hover:text-[#6C7275] transition-colors"
          >
            View Cart
          </Link>
        </div>
      </div>
    </>
  );
}
