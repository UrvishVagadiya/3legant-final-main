import { Check } from "lucide-react";
import Link from "next/link";

interface CheckoutStepperProps {
  step: 1 | 2 | 3;
}

const CheckoutStepper = ({ step }: CheckoutStepperProps) => {
  const steps = [
    { id: 1, name: "Shopping cart", href: "/cart" },
    { id: 2, name: "Checkout details", href: "/checkout" },
    { id: 3, name: "Order complete", href: "/complete" },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 my-8 w-full max-w-4xl mx-auto px-4">
      {steps.map((s, index) => {
        const isCompleted = step > s.id;
        const isActive = step === s.id;
        const isPending = step < s.id;

        return (
          <div
            key={s.id}
            className={`flex items-center gap-3 pb-4 border-b-2 flex-1 sm:flex-none sm:w-62.5 ${
              isActive
                ? "border-black text-black"
                : isCompleted
                  ? "border-[#38CB89] text-[#38CB89]"
                  : "border-gray-200 text-gray-400"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-[#141718] text-white"
                  : isCompleted
                    ? "bg-[#38CB89] text-white"
                    : "bg-gray-200 text-gray-500"
              }`}
            >
              {isCompleted ? <Check className="w-5 h-5" /> : s.id}
            </div>
            <span
              className={`font-semibold ${
                isActive || isCompleted ? "" : "text-gray-400"
              }`}
            >
              {s.name}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default CheckoutStepper;
