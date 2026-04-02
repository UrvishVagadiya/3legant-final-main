export default function PaymentMethodCard() {
  return (
    <>
      <div className="flex items-center justify-between border border-black bg-gray-50 rounded p-4 mb-6">
        <div className="flex items-center gap-3">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="2"
              y="5"
              width="20"
              height="14"
              rx="2"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path d="M2 10H22" stroke="currentColor" strokeWidth="2" />
          </svg>
          <span className="font-medium text-sm">Secure Card Payment</span>
        </div>
        <span className="text-xs font-medium text-[#6772E5] bg-[#6772E5]/10 px-2 py-1 rounded">
          Powered by Stripe
        </span>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
              stroke="#6772E5"
              strokeWidth="2"
            />
            <path
              d="M9 12L11 14L15 10"
              stroke="#6772E5"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>
            You will be securely redirected to{" "}
            <strong className="text-[#6772E5]">Stripe</strong> to complete your
            payment
          </span>
        </div>
      </div>
    </>
  );
}
