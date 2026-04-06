"use client";
import { MdKeyboardArrowRight } from "react-icons/md";

export const colorMap: Record<string, string> = {
  Black: "#343839",
  White: "#FFFFFF",
  Brown: "#8B4513",
  Red: "#DC2626",
  Blue: "#2563EB",
  Green: "#16A34A",
  Gray: "#6B7280",
  Beige: "#D4C5A9",
  Navy: "#1E3A5F",
  Pink: "#EC4899",
  Yellow: "#EAB308",
  Orange: "#EA580C",
  Purple: "#9333EA",
  Cream: "#FFFDD0",
  Walnut: "#5C4033",
  Natural: "#C4A882",
};

interface Props {
  colors: string[];
  selected: string;
  onSelect: (c: string) => void;
  measurements?: string;
}

export default function ColorSelector({
  colors,
  selected,
  onSelect,
  measurements,
}: Props) {
  return (
    <div className="flex flex-col gap-6 border-b border-[#E8ECEF] pb-6">
      {measurements && (
        <div className="flex flex-col gap-2">
          <span className="text-[#6C7275] font-medium">Measurements</span>
          <span className="text-[#141718] text-[20px]">{measurements}</span>
        </div>
      )}
      <div className="flex flex-col gap-4">
        <div className="flex items-center text-[16px] text-[#141718] font-medium">
          Choose Color{" "}
          <MdKeyboardArrowRight className="text-xl ml-1 text-[#6C7275]" />
        </div>
        <p className="text-[#141718] text-[20px]">{selected}</p>
        <div className="flex gap-3 sm:gap-4 overflow-x-auto overflow-y-visible py-2 px-1 scrollbar-hide">
          {colors.map((color) => {
            const bg = colorMap[color] || "#6B7280";
            const isSelected = selected === color;
            return (
              <div
                key={color}
                onClick={() => onSelect(color)}
                title={color}
                className={`w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-full cursor-pointer transition-all flex items-center justify-center border border-black/20 ${isSelected ? "shadow-[inset_0_0_0_2px_#141718]" : "hover:shadow-[inset_0_0_0_2px_#d1d5db]"}`}
                style={{ backgroundColor: bg }}
              >
                {isSelected && (
                  <svg
                    className={`w-4 h-4 ${["White", "Cream", "Beige", "Yellow"].includes(color) ? "text-black" : "text-white"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
