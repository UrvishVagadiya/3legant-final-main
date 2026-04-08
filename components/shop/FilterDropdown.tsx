import { useEffect, useRef } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";

interface FilterDropdownProps {
  label: string;
  displayValue: string;
  items: { label: string; active: boolean }[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (label: string) => void;
  onClose?: () => void;
  compact?: boolean;
}

const FilterDropdown = ({
  label,
  displayValue,
  items,
  isOpen,
  onToggle,
  onSelect,
  onClose,
  compact = false,
}: FilterDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !onClose) return;

    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  return (
    <div ref={dropdownRef} className={`relative ${compact ? "flex-1" : ""}`}>
      <button
        onClick={onToggle}
        className={`flex items-center cursor-pointer justify-between gap-2 border border-gray-300 rounded-lg text-sm font-medium text-[#141718] bg-white ${
          compact
            ? "w-full px-3 py-2.5"
            : "px-4 py-2.5 min-w-40 hover:border-[#141718] transition-colors"
        }`}
      >
        <span
          className={`text-[#6C7275] absolute -top-2 left-3 bg-white px-1 ${
            compact ? "text-[10px]" : "text-xs"
          }`}
        >
          {label}
        </span>
        <span className={compact ? "text-xs" : ""}>{displayValue}</span>
        <RiArrowDropDownLine className={compact ? "text-xl" : "text-2xl"} />
      </button>
      {isOpen && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => onSelect(item.label)}
              className={`w-full cursor-pointer text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                item.active
                  ? "font-semibold text-[#141718] bg-gray-50"
                  : "text-[#6C7275]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
