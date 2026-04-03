"use client";

import {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Autoplay,
} from "swiper/modules";

import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function ImageSlider() {
  return (
    <div className="relative w-full px-3 sm:px-4 md:px-10 lg:px-40">
      <div className="hidden md:flex custom-prev cursor-pointer w-10 h-10 lg:w-14 lg:h-14 justify-center items-center rounded-full absolute z-10 top-1/2 -translate-y-1/2 bg-white left-8 md:left-14 lg:left-48 shadow-md hover:bg-gray-50 transition-colors duration-300 ease-in-out">
        <ArrowLeft className="text-[#141718]" />
      </div>
      <div className="hidden md:flex custom-next cursor-pointer w-10 h-10 lg:w-14 lg:h-14 justify-center items-center rounded-full absolute z-10 top-1/2 -translate-y-1/2 bg-white right-8 md:right-14 lg:right-48 shadow-md hover:bg-gray-50 transition-colors duration-300 ease-in-out">
        <ArrowRight className="text-[#141718]" />
      </div>

      <Swiper
        modules={[Navigation, Pagination, Scrollbar, Autoplay, A11y]}
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        navigation={{
          prevEl: ".custom-prev",
          nextEl: ".custom-next",
        }}
        pagination={{
          clickable: true,
          renderBullet: function (index, className) {
            return '<span class="' + className + ' custom-bullet"></span>';
          },
        }}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        className="w-full h-75 sm:h-100 md:h-125 lg:h-150 bg-[#F3F5F7]"
      >
        <SwiperSlide>
          <div className="relative w-full h-full">
            <Image
              src="/slider.png"
              alt="Slider 1"
              fill
              className="object-cover object-center"
              priority
            />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="relative w-full h-full">
            <Image
              src="/living_room.png"
              alt="Slider 2"
              fill
              className="object-cover object-center"
            />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="relative w-full h-full">
            <Image
              src="/Living-Room5.jpg"
              alt="Slider 3"
              fill
              className="object-cover object-center"
            />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="relative w-full h-full">
            <Image
              src="/Living-Room2.jpg"
              alt="Slider 4"
              fill
              className="object-cover object-center"
            />
          </div>
        </SwiperSlide>
      </Swiper>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .swiper-pagination-bullet.custom-bullet {
          width: 8px;
          height: 8px;
          background-color: white;
          opacity: 0.5;
          border-radius: 50%;
          transition: all 0.3s ease;
          margin: 0 4px !important;
        }
        .swiper-pagination-bullet.custom-bullet.swiper-pagination-bullet-active {
          width: 24px;
          opacity: 1;
          border-radius: 8px;
        }
        .swiper-pagination {
          bottom: 14px !important;
        }
      `,
        }}
      />
    </div>
  );
}
