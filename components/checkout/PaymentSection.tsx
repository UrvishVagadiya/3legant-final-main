import PaymentMethodCard from "./PaymentMethodCard";

interface PaymentSectionProps {
  placing: boolean;
  hasItems: boolean;
  onPlaceOrder: () => void;
}

export default function PaymentSection({
  placing,
  hasItems,
  onPlaceOrder,
}: PaymentSectionProps) {
  return (
    <div className="border border-gray-300 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Payment method</h2>
      <PaymentMethodCard />
      <div className="mt-8 lg:hidden ">
        <button
          onClick={onPlaceOrder}
          disabled={placing || !hasItems}
          className="w-full bg-[#141718] cursor-pointer text-white py-4 rounded font-semibold hover:bg-black transition-colors disabled:opacity-50 "
        >
          {!hasItems
            ? "No items in cart"
            : placing
              ? "Redirecting to Payment..."
              : "Pay with Stripe"}
        </button>
      </div>
    </div>
  );
}
