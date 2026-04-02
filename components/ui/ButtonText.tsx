import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { typography } from "@/constants/typography";

type ButtonTextProps = {
  heading?: string;
  text: string;
  linkTo?: string;
  color?: "default" | "blue";
};

const ButtonText = ({
  text,
  linkTo,
  heading,
  color = "default",
}: ButtonTextProps) => {
  const isBlue = color === "blue";
  const borderClass = isBlue
    ? "border-b border-transparent hover:border-blue-500"
    : "border-b border-[#141718] hover:border-gray-500";
  const textClass = isBlue
    ? "text-blue-500 group-hover:text-blue-600"
    : "text-[#141718] group-hover:text-gray-600";

  const content = (
    <>
      <p
        className={`${typography.buttonSmall} transition-colors duration-300 ${textClass}`}
      >
        {text}
      </p>
      <ArrowRight
        className={`ml-1 w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1 ${textClass}`}
      />
    </>
  );

  return (
    <>
      {heading && <h1 className={`${typography.h5} mb-2`}>{heading}</h1>}

      {linkTo ? (
        <Link
          href={`/${linkTo}`}
          className={`flex items-center group w-max pb-0.5 transition-all duration-300 ${borderClass}`}
        >
          {content}
        </Link>
      ) : (
        <div
          className={`flex items-center group w-max pb-0.5 transition-all duration-300 ${borderClass}`}
        >
          {content}
        </div>
      )}
    </>
  );
};

export default ButtonText;
