export interface SavedAddress {
  id: string;
  type: string;
  label: string | null;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default: boolean;
}

interface SavedAddressSelectorProps {
  addresses: SavedAddress[];
  selectedId: string;
  onSelect: (id: string) => void;
  radioName: string;
  label?: string;
}

export default function SavedAddressSelector({
  addresses,
  selectedId,
  onSelect,
  radioName,
  label = "CHOOSE SAVED ADDRESS",
}: SavedAddressSelectorProps) {
  if (addresses.length === 0) return null;

  return (
    <div className="mb-6">
      <label className="block text-xs font-semibold text-gray-500 mb-1">
        {label}
      </label>
      <div className="space-y-2">
        {addresses.map((address) => (
          <label
            key={address.id}
            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedId === address.id
                ? "border-black bg-gray-50"
                : "border-gray-200 hover:border-gray-400"
            }`}
          >
            <input
              type="radio"
              name={radioName}
              value={address.id}
              checked={selectedId === address.id}
              onChange={() => onSelect(address.id)}
              className="w-4 h-4 accent-black"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">
                  {address.first_name} {address.last_name}
                </span>
                {address.label && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded shrink-0">
                    {address.label}
                  </span>
                )}
                {address.is_default && (
                  <span className="text-xs bg-black text-white px-1.5 py-0.5 rounded shrink-0">
                    Default
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">
                {address.street_address}, {address.city}, {address.state} {address.zip_code}
              </p>
            </div>
          </label>
        ))}
        <label
          className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
            selectedId === "new"
              ? "border-black bg-gray-50"
              : "border-gray-200 hover:border-gray-400"
          }`}
        >
          <input
            type="radio"
            name={radioName}
            value="new"
            checked={selectedId === "new"}
            onChange={() => onSelect("new")}
            className="w-4 h-4 accent-black"
          />
          <span className="text-sm font-medium">+ Enter a new address</span>
        </label>
      </div>
    </div>
  );
}
