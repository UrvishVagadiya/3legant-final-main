import Link from "next/link";

interface CartSummaryProps {
  subtotal: number;
  total: number;
  shippingMethod: string;
  setShippingMethod: (method: string) => void;
  hasItems: boolean;
}

const shippingOptions = [
  { value: "free", label: "Free shipping", price: "$0.00" },
  { value: "express", label: "Express shipping", price: "+$15.00" },
  { value: "pickup", label: "Pick Up", price: "%21.00" },
];

const CartSummary = ({
  subtotal,
  total,
  shippingMethod,
  setShippingMethod,
  hasItems,
}: CartSummaryProps) => (
  <div className="w-full lg:w-[35%]">
    <div className="border border-gray-300 rounded p-6">
      <h2 className="text-xl font-semibold mb-6">Cart summary</h2>

      <div className="space-y-3 mb-6">
        {shippingOptions.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center justify-between border border-gray-300 rounded p-3 cursor-pointer hover:border-black transition-colors"
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="shipping"
                value={opt.value}
                checked={shippingMethod === opt.value}
                onChange={() => setShippingMethod(opt.value)}
                className="w-4 h-4 text-black focus:ring-black border-gray-300"
              />
              <span className="text-sm font-medium">{opt.label}</span>
            </div>
            <span className="text-sm font-medium">{opt.price}</span>
          </label>
        ))}
      </div>

      <div className="flex items-center justify-between py-4 border-b border-gray-200">
        <span className="text-sm font-medium">Subtotal</span>
        <span className="font-semibold">${subtotal.toFixed(2)}</span>
      </div>

      <div className="flex items-center justify-between pt-4 pb-6">
        <span className="text-lg font-semibold">Total</span>
        <span className="text-xl font-semibold">${total.toFixed(2)}</span>
      </div>

      {!hasItems ? (
        <button
          disabled
          className="w-full bg-gray-300 text-gray-500 cursor-not-allowed py-4 rounded font-semibold transition-colors"
          title="Your cart is empty"
        >
          Checkout
        </button>
      ) : (
        <Link href="/checkout" className="block">
          <button className="w-full cursor-pointer bg-[#141718] text-white py-4 rounded font-semibold hover:bg-black transition-colors">
            Checkout
          </button>
        </Link>
      )}
    </div>
  </div>
);

export default CartSummary;
