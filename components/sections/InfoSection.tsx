const InfoSection = () => {
  return (
    <div className="home-container flex flex-col min-[960px]:flex-row min-[960px]:items-center justify-between mt-10 sm:mt-12 md:mt-16 lg:mt-10 gap-5 md:gap-6 lg:gap-10 mb-8 md:mb-14 lg:mb-14">
      <div className="w-full min-[960px]:flex-1 min-[960px]:min-w-0 max-w-170">
        <h1 className="text-[28px] sm:text-[38px] md:text-[46px] lg:text-[62px] xl:text-[74px] leading-[1.1] sm:leading-[1.08] lg:leading-[1.05] font-medium text-[#141718] tracking-tight wrap-break-words">
          Simply Unique<span className="text-[#6C7275]">/</span>
          <br />
          Simply Better<span className="text-[#6C7275]">.</span>
        </h1>
      </div>
      <div className="w-full min-[960px]:flex-1 min-[960px]:min-w-0 max-w-130 lg:max-w-120 xl:max-w-140">
        <p className="text-[15px] sm:text-[16px] md:text-[18px] lg:text-[20px] leading-6 md:leading-6.5 text-[#6C7275]">
          <span className="font-semibold text-[#141718]">3legant</span> is a
          gift & decorations store based in HCMC,
          <br className="hidden min-[960px]:block" /> Vietnam. Est since 2019.
        </p>
      </div>
    </div>
  );
};

export default InfoSection;
