import ButtonText from "@/components/ui/ButtonText";
import Link from "next/link";
import { IoCallOutline } from "react-icons/io5";
import { AiOutlineShop } from "react-icons/ai";
import { AiOutlineMail } from "react-icons/ai";
import { LiaMoneyBillSolid, LiaShippingFastSolid } from "react-icons/lia";
import { LuLockKeyhole } from "react-icons/lu";
import ContactForm from "@/components/sections/ContactForm";

const ContactUs = () => {
  const infos = [
    {
      icon: <AiOutlineShop />,
      title: "Address",
      desc: "234 Hai Trieu, Ho Chi Minh City, Viet Nam ",
    },
    {
      icon: <IoCallOutline />,
      title: "Contact Us",
      desc: "+84 234 567 890",
    },
    {
      icon: <AiOutlineMail />,
      title: "Email",
      desc: "hello@3legant.com",
    },
  ];
  const cards = [
    {
      icon: <LiaShippingFastSolid />,
      title: "Free Shipping",
      desc: "Order above $200",
    },
    {
      icon: <LiaMoneyBillSolid />,
      title: "Money-back",
      desc: "30 days guarantee",
    },
    {
      icon: <LuLockKeyhole />,
      title: "Secure Payments",
      desc: "Secured by stripe.",
    },
    {
      icon: <IoCallOutline />,
      title: "24/7 Support",
      desc: "Phone and email support.",
    },
  ];
  return (
    <div className="w-full">
      <div className="mx-4 sm:mx-8 md:mx-16 lg:mx-40">
        <div className="flex gap-3 text-sm md:text-base font-medium mt-3 mb-6">
          <Link
            href={"/"}
            className="text-gray-500 hover:text-gray-900 transition-colors"
          >
            Home
          </Link>
          <span className="text-gray-400">{">"}</span>
          <Link href={"/contact"} className="text-black">
            Contact Us
          </Link>
        </div>
        <div className="flex flex-col gap-5">
          <h1 className="text-[36px] md:text-[54px] w-full md:w-[70%] leading-10 md:leading-14.5 font-medium">
            We believe in sustainable decor. We're passionate about life at
            home.
          </h1>
          <p className="text-[14px] md:text-[16px] leading-5.5 md:leading-6.5 w-full md:w-[72%]">
            Our features timeless furniture, with natural fabrics, curved lines,
            plenty of mirrors and classic design, which can be incorporated into
            any decor project. The pieces enchant for their sobriety, to last
            for generations, faithful to the shapes of each period, with a touch
            of the present
          </p>
        </div>
        <div className="flex flex-col md:flex-row w-full mt-10">
          <div className="w-full md:w-1/2">
            <img
              className="h-75 sm:h-100 md:h-full w-full object-cover"
              src="/ads.png"
              alt="Ads"
            />
          </div>
          <div className="w-full md:w-1/2 bg-[#F3F5F7] flex flex-col px-8 py-12 sm:px-12 md:pl-16 lg:pl-20 justify-center">
            <div className="max-w-md xl:max-w-lg">
              <h1 className="text-[40px] sm:text-[44px] lg:text-[52px] font-medium leading-[1.1] text-[#141718] mb-4 xl:mb-6">
                About US
              </h1>
              <p className="text-[14px] md:text-[16px] leading-5.5 md:leading-6.5 text-[#141718] mb-8">
                3legant is a gift & decorations store based in HCMC, Vietnam.
                Est since 2019. <br />
                Our customer service is always prepared to support you 24/7
              </p>
              <div className="w-fit">
                <ButtonText text="Shop Now" linkTo="shop" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <h1 className="text-[32px] md:text-[40px] font-medium my-8 md:my-10">
            Contact Us
          </h1>
        </div>

        <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6.25">
          {infos.map((value, index) => (
            <div
              key={index}
              className="bg-[#F3F5F7] w-full p-6 lg:p-12 flex flex-col items-center text-center"
            >
              <div className="text-3xl sm:text-4xl lg:text-5xl">
                {value.icon}
              </div>
              <p className="uppercase font-medium mt-4 text-xs sm:text-sm md:text-base text-gray-400">
                {value.title}
              </p>
              <p className="mt-2 font-medium text-sm sm:text-base md:text-lg">
                {value.desc}
              </p>
            </div>
          ))}
        </div>
        <div className="flex flex-col-reverse lg:flex-row w-full gap-8 lg:gap-3 mb-10">
          <ContactForm />
          <div className="w-full lg:w-1/2 h-87.5 lg:h-auto p-0 lg:p-3 mb-2 lg:mb-0 flex flex-col">
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=72.8210623152608%2C21.160240992318026%2C72.8410623152608%2C21.180240992318028&layer=mapnik&marker=21.170240992318026%2C72.8310623152608"
              width="100%"
              height="100%"
              allowFullScreen
              loading="lazy"
              className="grow w-full h-full"
            />
            <a
              href="https://www.openstreetmap.org/?mlat=21.170240992318026&mlon=72.8310623152608#map=15/21.17024/72.83106"
              target="_blank"
              rel="noreferrer"
              className="mt-2 text-xs text-[#6C7275] hover:text-[#141718] transition-colors"
            >
              Open map in a new tab
            </a>
          </div>
        </div>
      </div>
      <div className="w-full border-t border-[#E8ECEF] bg-[#F3F5F7] mt-10 md:mt-14">
        <div className="mx-4 sm:mx-8 md:mx-16 lg:mx-40 ">
          <div className="grid grid-cols-2 lg:grid-cols-4 py-4 gap-4 sm:gap-6 lg:gap-8">
            {cards.map((value, index) => (
              <div key={index} className="w-full p-4 sm:p-6 lg:p-12">
                <div className="text-3xl sm:text-4xl lg:text-5xl">
                  {value.icon}
                </div>
                <p className="font-medium mt-2 sm:mt-4 text-sm sm:text-base lg:text-xl">
                  {value.title}
                </p>
                <p className="mt-1 sm:mt-2 text-[#6C7275] text-xs sm:text-sm md:text-sm">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
