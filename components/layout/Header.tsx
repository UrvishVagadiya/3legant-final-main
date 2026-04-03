"use client";
import { TicketPercent } from "lucide-react";
import { RxCross1 } from "react-icons/rx";
import ButtonText from "../ui/ButtonText";
import { useState } from "react";

const Header = () => {
  const [isVisible, setIsVisible] = useState(true);
  const handleClick = () => {
    setIsVisible((prev) => !prev);
  };
  return (
    isVisible && (
      <div className="relative left-1/2 w-screen -translate-x-1/2 bg-[#F3F5F7] px-4 py-2 flex items-center justify-center">
        <div className="flex justify-center items-center gap-2 mr-6 md:mr-0">
          <TicketPercent className="w-5 h-5 md:w-6 md:h-6" />
          <h3 className="text-sm md:text-base font-medium text-[#141718]">
            30% off storewide - Limited time!
          </h3>
          <div className="hidden md:block ml-2">
            <ButtonText text="Shop Now" linkTo="shop" color="blue" />
          </div>
        </div>
        <RxCross1
          onClick={handleClick}
          className="absolute right-4 text-[#141718] cursor-pointer w-4 h-4 md:w-5 md:h-5 hover:text-gray-500 transition-all duration-300 ease-in-out"
        />
      </div>
    )
  );
};

export default Header;
