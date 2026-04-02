import { ReactNode } from "react";

interface GridIconBarProps {
  icons: { icon: ReactNode; grid: number }[];
  activeGrid: number;
  onChange: (grid: number) => void;
}

const GridIconBar = ({ icons, activeGrid, onChange }: GridIconBarProps) => {
  return (
    <div className="flex items-center divide-x divide-gray-200 border border-gray-200 rounded overflow-hidden">
      {icons.map((item, index) => (
        <div
          key={index}
          onClick={() => onChange(item.grid)}
          className={`p-2 text-lg cursor-pointer ${
            activeGrid === item.grid
              ? "bg-gray-100 text-[#141718]"
              : "bg-white text-[#6C7275]"
          }`}
        >
          {item.icon}
        </div>
      ))}
    </div>
  );
};

export default GridIconBar;
