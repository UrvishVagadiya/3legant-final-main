const InfoSection = () => {
  return (
    <div className="px-3 sm:px-5 md:px-10 lg:px-20 xl:px-40 flex flex-col lg:flex-row lg:items-center justify-between mt-10 sm:mt-12 md:mt-20 lg:mt-24 gap-5 md:gap-6 lg:gap-10 mb-8 md:mb-16">
      <div className="w-full lg:flex-1 lg:min-w-0">
        <h1 className="text-[24px] sm:text-[32px] md:text-[44px] lg:text-[62px] xl:text-[74px] leading-[1.08] sm:leading-[1.05] font-medium text-[#141718] tracking-tight wrap-break-words">
          Simply Unique<span className="text-[#6C7275]">/</span>
          <br />
          Simply Better<span className="text-[#6C7275]">.</span>
        </h1>
      </div>
      <div className="w-full lg:flex-1 lg:min-w-0 lg:max-w-120 xl:max-w-140">
        <p className="text-[13px] sm:text-[14px] md:text-[18px] lg:text-[20px] leading-5.5 sm:leading-6 md:leading-6.5 text-[#6C7275]">
          <span className="font-semibold text-[#141718]">3legant</span> is a
          gift & decorations store based in HCMC,
          <br className="hidden lg:block" /> Vietnam. Est since 2019.
        </p>
      </div>
    </div>
  );
};

export default InfoSection;
