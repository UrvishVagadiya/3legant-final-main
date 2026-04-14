import { Check } from "lucide-react";
import Link from "next/link";

interface CheckoutStepperProps {
  step: 1 | 2 | 3;
}

const CheckoutStepper = ({ step }: CheckoutStepperProps) => {
  const steps = [
    { id: 1, name: "Shopping cart" },
    { id: 2, name: "Checkout details" },
    { id: 3, name: "Order complete" },
  ];

  const visibleSteps = steps.filter(
    (s) => s.id === step || (step < 3 && s.id === step + 1),
  );
  const visibleStepIds = new Set(visibleSteps.map((s) => s.id));

  const stepRoutes: Record<number, string> = {
    1: "/cart",
    2: "/checkout",
    3: "/complete",
  };

  return (
    <div className="flex flex-row items-center justify-center gap-8 sm:gap-24 my-6 sm:my-8 w-full max-w-4xl mx-auto  px-2 sm:px-4">
      {steps.map((s) => {
        const isCompleted = step > s.id;
        const isActive = step === s.id;
        const isVisibleOnMobile = visibleStepIds.has(s.id);
        // Only allow navigation to cart/checkout if not on complete page
        const isLink = (s.id === 1 || s.id === 2) && step !== 3;
        const content = (
          <div
            className={`${isVisibleOnMobile ? "flex" : "hidden lg:flex"} flex-row items-center text-left ${isActive ? "gap-2" : "gap-2"} sm:gap-3 pb-2 sm:pb-4 border-b-2 min-w-0 sm:flex-1 sm:min-w-45 ${
              isActive
                ? "border-black text-black"
                : isCompleted
                  ? "border-[#38CB89] text-[#38CB89]"
                  : "border-gray-200 text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-[#141718] text-white"
                  : isCompleted
                    ? "bg-[#38CB89] text-white"
                    : "bg-gray-200 text-gray-500"
              }`}
            >
              {isCompleted ? (
                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <div className="text-[14px]">{s.id}</div>
              )}
            </div>
            <span
              className={`font-semibold text-[18px] leading-4 sm:text-base sm:leading-6 whitespace-nowrap ${
                isActive ? "inline text-black" : "hidden min-[415px]:inline"
              }`}
            >
              {s.name}
            </span>
          </div>
        );
        return isLink ? (
          <Link href={stepRoutes[s.id]} key={s.id} prefetch={false}>
            {content}
          </Link>
        ) : (
          <div key={s.id}>{content}</div>
        );
      })}
    </div>
  );
};

export default CheckoutStepper;
