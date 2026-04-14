import ButtonText from "../ui/ButtonText";

const Ads = () => {
  return (
    <div className="home-container flex flex-col md:flex-row w-full">
      <div className="w-full md:w-1/2">
        <img
          className="h-65 sm:h-85 md:h-full w-full object-cover"
          src="/ads.png"
          alt="Ads"
        />
      </div>
      <div className="w-full md:w-1/2 bg-[#F3F5F7] flex flex-col px-4 py-8 sm:px-8 sm:py-10 md:pl-16 lg:pl-20 justify-center">
        <div className="max-w-full sm:max-w-md xl:max-w-lg">
          <h2 className="text-[12px] sm:text-[14px] md:text-[16px] text-blue-500 font-bold uppercase tracking-wider mb-3 sm:mb-4">
            SALE UP TO 35% OFF
          </h2>
          <h1 className="text-[28px] sm:text-[36px] md:text-[44px] lg:text-[52px] font-medium leading-[1.05] text-[#141718] mb-4 xl:mb-6 wrap-break-word">
            HUNDREDS of
            <br />
            New lower prices!
          </h1>
          <p className="text-[14px] sm:text-[16px] md:text-[20px] leading-6 sm:leading-7 md:leading-8 text-[#141718] mb-8">
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
