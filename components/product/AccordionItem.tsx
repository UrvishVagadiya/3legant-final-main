"use client";
import {
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowUp,
} from "react-icons/md";

interface Props {
  id: string;
  title: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
  maxHeight?: string;
  children: React.ReactNode;
  borderClass?: string;
}

export default function AccordionItem({
  id,
  title,
  isOpen,
  onToggle,
  maxHeight = "max-h-125",
  children,
  borderClass = "border-t border-[#E8ECEF]",
}: Props) {
  return (
    <div className={borderClass}>
      <button
        onClick={() => onToggle(id)}
        className="w-full cursor-pointer flex justify-between items-center py-5 text-[18px] font-medium text-[#141718]"
      >
        {title}
        {isOpen ? (
          <MdOutlineKeyboardArrowUp className="text-2xl" />
        ) : (
          <MdOutlineKeyboardArrowDown className="text-2xl" />
        )}
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? `${maxHeight} pb-6` : "max-h-0"}`}
      >
        {children}
      </div>
    </div>
  );
}
