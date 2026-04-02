import { LockKeyhole, Phone, Truck, Wallet } from "lucide-react";
import { IoCallOutline } from "react-icons/io5";
import { LiaMoneyBillSolid, LiaShippingFastSolid } from "react-icons/lia";
import { LuLockKeyhole } from "react-icons/lu";

const About = () => {
  const infos = [
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
    <div className="px-5 md:px-10 lg:px-40 my-7 lg:my-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-[16px]">
        {infos.map((value, index) => (
          <div key={index} className="bg-[#F3F5F7] w-full p-6 lg:p-12">
            <div className="text-3xl lg:text-4xl">{value.icon}</div>
            <p className="font-medium mt-4 text-sm lg:text-xl">{value.title}</p>
            <p className="mt-2 text-[#6C7275] text-xs sm:text-sm">
              {value.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default About;
