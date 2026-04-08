import { useEffect, useRef, useState } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";

const defaultSortOptions = [
  { value: "default", label: "Default" },
  { value: "az", label: "A-Z" },
  { value: "za", label: "Z-A" },
  { value: "price-low-high", label: "Price (Low to High)" },
  { value: "price-high-low", label: "Price (High to Low)" },
];

interface SortOption {
  value: string;
  label: string;
}

interface SortByMenuProps {
  onSort: (option: string) => void;
  currentSort?: string;
  align?: "left" | "right";
  options?: SortOption[];
}

const SortByMenu = ({
  onSort,
  currentSort = "default",
  align = "right",
  options = defaultSortOptions,
}: SortByMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen]);

  const currentLabel =
    options.find((opt) => opt.value === currentSort)?.label || "Default";

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1 cursor-pointer"
      >
        <span className="font-semibold text-sm text-[#141718]">
          {currentLabel === "Default" ? "Sort by" : currentLabel}
        </span>
        <RiArrowDropDownLine className="text-2xl text-[#141718]" />
      </button>
      {isOpen && (
        <div
          className={`absolute z-999 ${align === "right" ? "right-0" : "left-0"} top-full mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-lg overflow-hidden`}
        >
          <div className="flex flex-col py-1 text-sm">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onSort(opt.value);
                  setIsOpen(false);
                }}
                className={`text-left px-4 py-2 cursor-pointer hover:bg-gray-50 ${
                  currentSort === opt.value
                    ? "font-bold bg-gray-50 text-black"
                    : "text-[#6C7275]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SortByMenu;
