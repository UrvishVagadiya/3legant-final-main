import { ReactNode } from "react";

import { typography } from "@/constants/typography";

type TypographyVariant =
  | "hero"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "h7"
  | "body-xl"
  | "body-large"
  | "body-default"
  | "body-small"
  | "text-26"
  | "text-22"
  | "text-20"
  | "text-18"
  | "text-16"
  | "text-14"
  | "text-12"
  | "text-26-semibold"
  | "text-22-semibold"
  | "text-20-semibold"
  | "text-18-semibold"
  | "text-16-semibold"
  | "text-14-semibold"
  | "text-12-semibold"
  | "text-26-bold"
  | "text-22-bold"
  | "text-20-bold"
  | "text-18-bold"
  | "text-16-bold"
  | "text-14-bold"
  | "text-12-bold"
  | "button-xl"
  | "button-large"
  | "button-medium"
  | "button-small"
  | "button-xsmall";

type TypographyColor =
  | "shade-900"
  | "shade-800"
  | "shade-700"
  | "shade-600"
  | "shade-500"
  | "shade-400"
  | "shade-300"
  | "shade-200"
  | "shade-100"
  | "royal-blue"
  | "sunshine-yellow"
  | "sweet-red"
  | "sky-blue"
  | "white";

interface TypographyProps {
  children: ReactNode;
  variant?: TypographyVariant;
  color?: TypographyColor;
  className?: string;
  as?: React.ElementType;
}

export default function Typography({
  children,
  variant = "body-default",
  color = "shade-900",
  className = "",
  as: Component = "p",
}: TypographyProps) {
  const variantStyles: Record<TypographyVariant, string> = {
    hero: typography.hero,
    h1: typography.h1,
    h2: typography.h2,
    h3: typography.h3,
    h4: typography.h4,
    h5: typography.h5,
    h6: typography.h6,
    h7: typography.h7,
    "body-xl": typography.text20,
    "body-large": typography.text18,
    "body-default": typography.body2,
    "body-small": typography.bodySm,
    "text-26": typography.text26,
    "text-22": typography.text22,
    "text-20": typography.text20,
    "text-18": typography.text18,
    "text-16": typography.body2,
    "text-14": typography.bodySm,
    "text-12": typography.text12,
    "text-26-semibold": typography.text26Semibold,
    "text-22-semibold": typography.text22Semibold,
    "text-20-semibold": typography.text20Semibold,
    "text-18-semibold": typography.text18Semibold,
    "text-16-semibold": typography.text16Semibold,
    "text-14-semibold": typography.text14Semibold,
    "text-12-semibold": typography.text12Semibold,
    "text-26-bold": typography.text26Bold,
    "text-22-bold": typography.text22Bold,
    "text-20-bold": typography.text20Bold,
    "text-18-bold": typography.text18Bold,
    "text-16-bold": typography.text16Bold,
    "text-14-bold": typography.text14Bold,
    "text-12-bold": typography.text12Bold,
    "button-xl": typography.buttonXLarge,
    "button-large": typography.buttonLarge,
    "button-medium": typography.buttonMedium,
    "button-small": typography.buttonSmall,
    "button-xsmall": typography.buttonXSmall,
  };

  const colorStyles: Record<TypographyColor, string> = {
    "shade-900": "text-shade-900",
    "shade-800": "text-shade-800",
    "shade-700": "text-shade-700",
    "shade-600": "text-shade-600",
    "shade-500": "text-shade-500",
    "shade-400": "text-shade-400",
    "shade-300": "text-shade-300",
    "shade-200": "text-shade-200",
    "shade-100": "text-shade-100",
    "royal-blue": "text-royal-blue",
    "sunshine-yellow": "text-sunshine-yellow",
    "sweet-red": "text-sweet-red",
    "sky-blue": "text-sky-blue",
    white: "text-white",
  };

  return (
    <Component
      className={`${variantStyles[variant]} ${colorStyles[color]} ${className}`}
    >
      {children}
    </Component>
  );
}
