import { Search, Plus } from "lucide-react";

interface AdminSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  onAdd?: () => void;
  addLabel?: string;
  children?: React.ReactNode;
}

export default function AdminSearchBar({
  searchQuery,
  onSearchChange,
  placeholder = "Search...",
  onAdd,
  addLabel = "Add",
  children,
}: AdminSearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="relative flex-1 max-w-md">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#141718]"
        />
      </div>
      {children}
      {onAdd && (
        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-[#141718] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-black transition-colors"
        >
          <Plus size={18} />
          {addLabel}
        </button>
      )}
    </div>
  );
}
