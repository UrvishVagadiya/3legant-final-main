import Image from "next/image";
import React from "react";
import ButtonText from "../ui/ButtonText";

const Ads = () => {
  return (
    <div className="flex flex-col md:flex-row w-full">
      <div className="w-full md:w-1/2">
        <img
          className="h-[300px] sm:h-[400px] md:h-full w-full object-cover"
          src="/ads.png"
          alt="Ads"
        />
      </div>
      <div className="w-full md:w-1/2 bg-[#F3F5F7] flex flex-col px-8 py-12 sm:px-12 md:pl-16 lg:pl-20 justify-center">
        <div className="max-w-md xl:max-w-lg">
          <h2 className="text-[16px] text-blue-500 font-bold uppercase tracking-wider mb-4">
            SALE UP TO 35% OFF
          </h2>
          <h1 className="text-[40px] sm:text-[44px] lg:text-[52px] font-medium leading-[1.1] text-[#141718] mb-4 xl:mb-6">
            HUNDREDS of
            <br />
            New lower prices!
          </h1>
          <p className="text-[16px] sm:text-[20px] leading-[32px] text-[#141718] mb-8">
            It’s more affordable than ever to give every
            <br className="hidden sm:block" /> room in your home a stylish
            makeover
          </p>
          <div className="w-fit">
            <ButtonText text="Shop Now" linkTo="shop" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ads;
