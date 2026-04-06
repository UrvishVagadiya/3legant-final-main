import Link from "next/link";

const ShopHeader = () => {
  return (
    <div
      className="w-full min-h-72 sm:min-h-80 md:min-h-98 flex items-center justify-center rounded-lg mt-4 sm:mt-6"
      style={{
        backgroundImage: 'url("/shop.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex flex-col justify-center items-center text-center px-4 sm:px-6">
        <div className="font-inter text-xs sm:text-sm md:text-base font-semibold flex gap-2 sm:gap-3">
          <Link
            href={"/"}
            className="text-gray-500 hover:text-gray-900 transition-colors"
          >
            Home
          </Link>
          <span className="text-gray-400">{">"}</span>
          <Link href={"/shop"} className="text-black">
            Shop
          </Link>
        </div>
        <h1 className="font-poppins text-[32px] leading-9.5 tracking-[-0.4px] sm:text-[42px] sm:leading-12 md:text-[54px] md:leading-14.5 md:tracking-[-1px] font-medium my-3 sm:my-4 md:my-5">
          Shop Page
        </h1>
        <p className="font-inter text-[14px] leading-5.5 sm:text-[16px] sm:leading-6.5 md:text-[20px] md:leading-8 text-[#121212] max-w-[320px] sm:max-w-105 md:max-w-none">
          Let's design the place you always imagined.
        </p>
      </div>
    </div>
  );
};

export default ShopHeader;
