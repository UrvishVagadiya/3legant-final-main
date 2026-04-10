import Image from "next/image";
import { Ticket } from "lucide-react";
import CouponSuggestions from "@/components/cart/CouponSuggestions";
import { colorMap } from "../product/ColorSelector";
import { getEffectiveCartLineTotal } from "@/utils/getEffectiveCartPrice";

interface CartItem {
  id: string;
  name: string;
  price: number | string;
  image: string;
  color: string;
  quantity: number;
  stock?: number;
}

interface OrderSummaryProps {
  cartItems: CartItem[];
  updateQuantity: (id: string, color: string, qty: number) => void;
  subtotal: number;
  shippingCost: number;
  shippingMethod: string;
  discount: number;
  total: number;
  couponCode: string;
  setCouponCode: (v: string) => void;
  onApplyCoupon: () => void;
  couponLoading: boolean;
  appliedCoupon: { id: string; code: string } | null;
  onRemoveCoupon: () => void;
  setShippingMethod: (method: string) => void;
  placing: boolean;
  onPlaceOrder: () => void;
}

const shippingOptions = [
  { value: "free", label: "Free shipping", price: 0, priceLabel: "$0.00" },
  {
    value: "express",
    label: "Express shipping",
    price: 15,
    priceLabel: "+$15.00",
  },
  { value: "pickup", label: "Pick Up", price: 0.21, priceLabel: "+21%" },
];

export default function OrderSummary({
  cartItems,
  updateQuantity,
  subtotal,
  shippingCost,
  shippingMethod,
  discount,
  total,
  couponCode,
  setCouponCode,
  onApplyCoupon,
  couponLoading,
  appliedCoupon,
  onRemoveCoupon,
  setShippingMethod,
  placing,
  onPlaceOrder,
}: OrderSummaryProps) {
  const handleDecrease = (item: CartItem) => {
    if (item.quantity <= 0) return;
    updateQuantity(item.id, item.color, item.quantity - 1);
  };

  const handleIncrease = (item: CartItem) => {
    const stock = item.stock ?? 0;
    if (stock <= 0 || item.quantity >= stock) return;
    updateQuantity(item.id, item.color, item.quantity + 1);
  };

  const toSoftTint = (hexColor?: string) => {
    if (!hexColor) return undefined;

    if (/^#[\da-fA-F]{6}$/.test(hexColor)) {
      return `${hexColor}38`;
    }

    if (/^#[\da-fA-F]{3}$/.test(hexColor)) {
      const expanded = `#${hexColor[1]}${hexColor[1]}${hexColor[2]}${hexColor[2]}${hexColor[3]}${hexColor[3]}`;
      return `${expanded}38`;
    }

    return hexColor;
  };

  return (
    <div className="border border-gray-300 rounded-lg p-5 md:p-4 lg:p-6 md:sticky md:top-24">
      <h2 className="text-xl font-semibold mb-6">Order summary</h2>

      <div className="space-y-4 mb-5 md:mb-4 lg:mb-6 max-h-90 lg:max-h-100 overflow-y-auto pr-2">
        {cartItems.map((item) => (
          <div key={item.id} className="flex gap-4 items-center">
            <div
              className="relative w-16 h-20 bg-[#F3F5F7] rounded shrink-0 flex items-center justify-center"
              style={{
                backgroundColor:
                  item.color?.toLowerCase() !== "white" && colorMap[item.color]
                    ? toSoftTint(colorMap[item.color])
                    : undefined,
              }}
            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                unoptimized
                className="object-contain p-2 transition-all duration-300"
                style={{
                  mixBlendMode:
                    item.color?.toLowerCase() !== "white" &&
                    colorMap[item.color]
                      ? "multiply"
                      : "normal",
                }}
              />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-sm">{item.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Color: {item.color}
                  </p>
                </div>
                <span className="font-semibold text-sm">
                  ${getEffectiveCartLineTotal(item).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center border border-gray-300 rounded px-2 py-0.5 mt-2 w-fit gap-3">
                <button
                  type="button"
                  onClick={() => handleDecrease(item)}
                  disabled={item.quantity <= 0}
                  className={`text-sm ${item.quantity <= 0 ? "text-gray-300 " : "text-gray-500 hover:text-black"} cursor-pointer`}
                >
                  -
                </button>
                <span className="font-semibold text-sm">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => handleIncrease(item)}
                  disabled={
                    (item.stock ?? 0) <= 0 || item.quantity >= (item.stock ?? 0)
                  }
                  className={`text-sm ${(item.stock ?? 0) <= 0 || item.quantity >= (item.stock ?? 0) ? "text-gray-300 " : "text-gray-500 hover:text-black"} cursor-pointer`}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center border border-gray-300 rounded overflow-hidden mb-2">
        <input
          type="text"
          placeholder="Coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          className="w-full py-3 px-4 outline-none text-sm placeholder-gray-400"
        />
        <button
          onClick={onApplyCoupon}
          className="px-6 cursor-pointer py-3 font-semibold text-sm bg-[#141718] text-white hover:bg-black transition-colors"
        >
          {couponLoading ? "..." : "Apply"}
        </button>
      </div>

      <div className="mb-6">
        <CouponSuggestions
          onSelect={(code: string) => {
            setCouponCode(code);
            // Use a short timeout to ensure state is updated before applying
            setTimeout(() => onApplyCoupon(), 0);
          }}
          subtotal={subtotal}
        />
      </div>

      <div className="space-y-3 mb-6">
        {shippingOptions.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-center justify-between border rounded p-3 cursor-pointer transition-colors ${
              shippingMethod === opt.value
                ? "border-black bg-gray-50"
                : "border-gray-200 hover:border-gray-400"
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="shipping"
                value={opt.value}
                checked={shippingMethod === opt.value}
                onChange={() => setShippingMethod(opt.value)}
                className="w-4 h-4 cursor-pointer text-black focus:ring-black border-gray-300 accent-black"
              />
              <span className="text-sm font-medium">{opt.label}</span>
            </div>
            <span className="text-sm font-medium">{opt.priceLabel}</span>
          </label>
        ))}
      </div>

      <div className="space-y-3 border-b border-gray-200 pb-4 mb-4">
        {appliedCoupon && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Ticket size={16} />
              <span>{appliedCoupon.code}</span>
            </div>
            <div className="text-[#38CB89] font-medium text-sm">
              -${discount.toFixed(2)}{" "}
              <span
                onClick={onRemoveCoupon}
                className="text-gray-400 ml-1 cursor-pointer hover:text-black"
              >
                [Remove]
              </span>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium">
            {shippingMethod === "free" && "Free"}
            {shippingMethod === "express" && "$15.00"}
            {shippingMethod === "pickup" && `$${shippingCost.toFixed(2)} (21%)`}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <span className="text-lg font-semibold">Total</span>
        <span className="text-xl font-semibold">${total.toFixed(2)}</span>
      </div>

      <div className="hidden lg:block">
        <button
          onClick={onPlaceOrder}
          disabled={placing || cartItems.length === 0}
          className="w-full bg-[#141718] cursor-pointer text-white py-4 rounded font-semibold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cartItems.length === 0
            ? "No items in cart"
            : placing
              ? "Redirecting to Payment..."
              : "Pay with Stripe"}
        </button>
      </div>
    </div>
  );
}
