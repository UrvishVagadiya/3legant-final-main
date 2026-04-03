import Image from "next/image";
import Link from "next/link";
import React from "react";
import { typography } from "@/constants/typography";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden">
      <div className="w-full h-[46vh] md:h-full md:w-1/2 bg-[#F3F5F7] flex flex-col items-center justify-center p-4 md:p-10 relative shrink-0">
        <div className="absolute top-4 md:top-8 text-center w-full z-10">
          <Link
            href="/"
            className={`${typography.h6} leading-none text-black decoration-none`}
          >
            3legant<span className="text-gray-400">.</span>
          </Link>
        </div>
        <div className="relative w-full max-w-90 sm:max-w-115 md:max-w-180 aspect-4/3 mx-auto">
          <Image
            src="/chair/chair.png"
            alt="3legant Chair"
            fill
            className="object-contain object-center"
            priority
          />
        </div>
      </div>
      <div className="w-full h-[65vh] md:h-full md:w-1/2 flex items-center justify-center p-6 md:p-8 lg:px-24 bg-white overflow-hidden">
        <div className="w-full max-w-md my-auto flex flex-col h-full justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
