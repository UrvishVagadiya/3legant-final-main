import { ArrowRight } from "lucide-react";
import Image from "next/image";
import ButtonText from "./ButtonText";

const Cards = () => {
  return (
    <div className="home-container mt-6 sm:mt-10">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
        <div className="relative w-full lg:w-1/2 bg-[#F3F5F7] rounded-md overflow-hidden flex min-w-0">
          <div className="absolute top-6 left-6 sm:top-8 sm:left-8 md:top-10 md:left-10 lg:top-12 lg:left-12 z-10 w-3/4">
            <h3 className="text-xl sm:text-2xl lg:text-[34px] font-medium mb-2 lg:mb-4">
              Living Room
            </h3>
            <div className="flex">
              <ButtonText text="Shop Now" linkTo="shop" />
            </div>
          </div>
          <Image
            className="w-full h-auto object-cover object-center sm:mt-0"
            height={650}
            width={648}
            src="/card1.png"
            alt="Living Room"
          />
        </div>

        <div className="flex flex-col md:flex-row lg:flex-col gap-4 sm:gap-6 w-full lg:w-1/2 min-w-0">
          <div className="relative w-full md:w-1/2 lg:w-full bg-[#F3F5F7] rounded-md overflow-hidden flex min-w-0">
            <div className="absolute left-6 bottom-6 sm:left-8 sm:bottom-8 lg:bottom-10 lg:left-10 xl:bottom-12 xl:left-12 z-10 w-3/4">
              <h3 className="text-lg sm:text-xl md:text-[28px] lg:text-[34px] font-medium mb-2">
                Bedroom
              </h3>
              <div className="flex">
                <ButtonText text="Shop Now" linkTo="shop" />
              </div>
            </div>
            <Image
              className="w-full h-auto object-cover object-center"
              height={500}
              width={648}
              src="/card2.png"
              alt="Bedroom"
            />
          </div>

          <div className="relative w-full md:w-1/2 lg:w-full bg-[#F3F5F7] rounded-md overflow-hidden flex min-w-0">
            <div className="absolute left-6 bottom-6 sm:left-8 sm:bottom-8 lg:bottom-10 lg:left-10 xl:bottom-12 xl:left-12 z-10 w-3/4">
              <h3 className="text-lg sm:text-xl md:text-[28px] lg:text-[34px] font-medium mb-2">
                Kitchen
              </h3>
              <div className="flex">
                <ButtonText text="Shop Now" linkTo="shop" />
              </div>
            </div>
            <Image
              className="w-full h-auto object-cover object-center"
              height={500}
              width={648}
              src="/card3.png"
              alt="Kitchen"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cards;
