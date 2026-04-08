import { Edit2, Trash2, Star } from "lucide-react";

interface DbAddress {
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

interface AddressCardProps {
  address: DbAddress;
  onEdit: (addr: DbAddress) => void;
  onDelete: (id: string) => void;
  onSetDefault: (addr: DbAddress) => void;
}

const AddressCard = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}: AddressCardProps) => {
  const formatDisplay = (a: DbAddress) =>
    `${a.street_address}, ${a.city}, ${a.state} ${a.zip_code}, ${a.country}`;

  return (
    <div
      className={`border rounded-xl p-4 md:p-5 bg-white transition-colors relative ${
        address.is_default
          ? "border-black ring-1 ring-black"
          : "border-gray-300 hover:border-gray-500"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          {address.label && (
            <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
              {address.label}
            </span>
          )}
          {address.is_default && (
            <span className="text-xs font-semibold bg-black text-white px-2 py-0.5 rounded">
              Default
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!address.is_default && (
            <button
              onClick={() => onSetDefault(address)}
              title="Set as default"
              className="text-gray-400 cursor-pointer hover:text-yellow-500 transition-colors"
            >
              <Star size={16} />
            </button>
          )}
          <button
            onClick={() => onEdit(address)}
            className="text-gray-400 cursor-pointer hover:text-gray-900 transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(address.id)}
            className="text-gray-400 cursor-pointer hover:text-red-500 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-1 text-[#141718] text-[14px]">
        <p className="font-medium">
          {address.first_name} {address.last_name}
        </p>
        <p className="text-gray-500">{address.phone || "No phone"}</p>
        <p className="text-gray-500">{formatDisplay(address)}</p>
      </div>
    </div>
  );
};

export default AddressCard;
export type { DbAddress };
