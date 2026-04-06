import Link from "next/link";
import { IoLogoInstagram } from "react-icons/io";
import { FiFacebook } from "react-icons/fi";
import { GoVideo } from "react-icons/go";
import { typography } from "@/constants/typography";

const Footer = () => {
  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 bg-[#141718]">
      <div className="max-w-400 mx-auto px-5 md:px-10 lg:px-40 py-12 md:py-18 w-full">
        <div className="flex flex-col md:flex-row justify-between mb-8 md:mb-19 text-white items-center gap-8 md:gap-0">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-5">
            <h3 className={`${typography.h6} leading-none`}>3legant.</h3>
            <div className="hidden md:block w-px h-6 bg-gray-500"></div>
            <div className="md:hidden w-8 h-px bg-gray-500 mt-1 mb-2"></div>
            <h3 className={`${typography.text14} text-[#E8ECEF]`}>
              Gift & Decoration Store
            </h3>
          </div>

          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center text-sm">
            <Link
              className="hover:text-gray-300 transition-all duration-300 ease-in-out"
              href="/"
            >
              Home
            </Link>
            <Link
              className="hover:text-gray-300 transition-all duration-300 ease-in-out"
              href="/shop"
            >
              Shop
            </Link>
            <Link
              className="hover:text-gray-300 transition-all duration-300 ease-in-out"
              href={"/blogs"}
            >
              Blog
            </Link>
            <Link
              className="hover:text-gray-300 transition-all duration-300 ease-in-out"
              href="/contact"
            >
              Contact Us
            </Link>
          </div>
        </div>

        <hr className="border-gray-600 mb-8" />

        <div className="flex flex-col-reverse md:flex-row text-white justify-between items-center gap-8 md:gap-0">
          <div className="flex flex-col md:flex-row items-center gap-5 md:gap-6 text-xs md:text-sm">
            <h3
              className={`${typography.text14} text-[#E8ECEF] md:mr-4 order-3 md:order-1 text-center md:text-left mt-4 md:mt-0`}
            >
              Copyright © 2023 3legant. All rights reserved
            </h3>
            <Link
              href="/privacy"
              className={`${typography.text14Semibold} order-1 md:order-2 cursor-pointer hover:underline transition-all duration-300 ease-in-out`}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className={`${typography.text14Semibold} order-2 md:order-3 cursor-pointer hover:underline transition-all duration-300 ease-in-out`}
            >
              Terms of Use
            </Link>
          </div>

          <div className="flex gap-6 text-2xl text-white">
            <Link href="#">
            <IoLogoInstagram className="cursor-pointer hover:text-gray-300 transition-all duration-300 ease-in-out" />
            </Link>
            <Link href="#">
            <FiFacebook className="cursor-pointer hover:text-gray-300 transition-all duration-300 ease-in-out" />
            </Link>
             <Link href="#">
            <GoVideo className="cursor-pointer hover:text-gray-300 transition-all duration-300 ease-in-out" />
              </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
