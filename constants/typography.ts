export const typography = {
    // Poppins headings
    hero: "font-poppins text-[96px] leading-[96px] tracking-[-0.02em] font-medium",
    h1: "font-poppins text-[80px] leading-[84px] tracking-[-3px] font-medium",
    h2: "font-poppins text-[72px] leading-[76px] tracking-[-2px] font-medium",
    h3: "font-poppins text-[54px] leading-[58px] tracking-[-1px] font-medium",
    h4: "font-poppins text-[40px] leading-[44px] tracking-[-0.4px] font-medium",
    h5: "font-poppins text-[34px] leading-[38px] tracking-[-0.6px] font-medium",
    h6: "font-poppins text-[28px] leading-[34px] tracking-[-0.6px] font-medium",
    h7: "font-poppins text-[20px] leading-[28px] tracking-[0px] font-medium",

    // Inter regular
    text26: "font-inter text-[26px] leading-[40px] tracking-[0px] font-normal",
    text22: "font-inter text-[22px] leading-[34px] tracking-[0px] font-normal",
    text20: "font-inter text-[20px] leading-[32px] tracking-[0px] font-normal",
    text18: "font-inter text-[18px] leading-[30px] tracking-[0px] font-normal",
    text16: "font-inter text-[16px] leading-[26px] tracking-[0px] font-normal",
    text14: "font-inter text-[14px] leading-[22px] tracking-[0px] font-normal",
    text12: "font-inter text-[12px] leading-[20px] tracking-[0px] font-normal",

    // Inter semibold
    text26Semibold: "font-inter text-[26px] leading-[40px] tracking-[0px] font-semibold",
    text22Semibold: "font-inter text-[22px] leading-[34px] tracking-[0px] font-semibold",
    text20Semibold: "font-inter text-[20px] leading-[32px] tracking-[0px] font-semibold",
    text18Semibold: "font-inter text-[18px] leading-[30px] tracking-[0px] font-semibold",
    text16Semibold: "font-inter text-[16px] leading-[26px] tracking-[0px] font-semibold",
    text14Semibold: "font-inter text-[14px] leading-[22px] tracking-[0px] font-semibold",
    text12Semibold: "font-inter text-[12px] leading-[20px] tracking-[0px] font-semibold",

    // Inter bold
    text26Bold: "font-inter text-[26px] leading-[40px] tracking-[0px] font-bold",
    text22Bold: "font-inter text-[22px] leading-[34px] tracking-[0px] font-bold",
    text20Bold: "font-inter text-[20px] leading-[32px] tracking-[0px] font-bold",
    text18Bold: "font-inter text-[18px] leading-[30px] tracking-[0px] font-bold",
    text16Bold: "font-inter text-[16px] leading-[26px] tracking-[0px] font-bold",
    text14Bold: "font-inter text-[14px] leading-[22px] tracking-[0px] font-bold",
    text12Bold: "font-inter text-[12px] leading-[20px] tracking-[0px] font-bold",

    // Button text
    buttonXLarge: "font-inter text-[26px] leading-[38px] tracking-[0px] font-medium",
    buttonLarge: "font-inter text-[22px] leading-[34px] tracking-[0px] font-medium",
    buttonMedium: "font-inter text-[18px] leading-[32px] tracking-[-0.4px] font-medium",
    buttonSmall: "font-inter text-[16px] leading-[28px] tracking-[-0.4px] font-medium",
    buttonXSmall: "font-inter text-[14px] leading-[24px] tracking-[0px] font-medium",

    // Backward-compatible aliases
    body1: "font-inter text-[20px] leading-[32px] tracking-[0px] font-normal",
    body2: "font-inter text-[16px] leading-[26px] tracking-[0px] font-normal",
    bodySm: "font-inter text-[14px] leading-[22px] tracking-[0px] font-normal",
    caption1: "font-inter text-[14px] leading-[22px] tracking-[0px] font-semibold",
    caption2: "font-inter text-[12px] leading-[20px] tracking-[0px] font-semibold",
    btnText: "font-inter text-[16px] leading-[28px] tracking-[-0.4px] font-medium",
};

export type TypographyToken = keyof typeof typography;
