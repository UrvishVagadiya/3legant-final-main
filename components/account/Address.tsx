"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import AddressModal from "./AddressModal";
import AddressCard from "./AddressCard";
import { useAppSelector, RootState } from "@/store";
import toast from "react-hot-toast";
import {
  useGetAddressesQuery,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
  useSaveAddressMutation,
} from "@/store/api/addressApi";
import type { DbAddress, AddressData } from "@/store/api/addressApi";

function dbToFormData(address: DbAddress): AddressData {
  return {
    id: address.id,
    label: address.label || "",
    type: address.type as "shipping" | "billing",
    name: `${address.first_name} ${address.last_name}`.trim(),
    phone: address.phone || "",
    address: `${address.street_address}, ${address.city}, ${address.state} ${address.zip_code}, ${address.country}`,
    street_address: address.street_address || "",
    city: address.city || "",
    state: address.state || "",
    zip_code: address.zip_code || "",
    country: address.country || "",
    is_default: address.is_default,
  };
}

interface AddressProps {
  fullName: string;
}

const AddressSection = ({
  title,
  type,
  addresses,
  onAdd,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  title: string;
  type: "shipping" | "billing";
  addresses: DbAddress[];
  onAdd: (type: "shipping" | "billing") => void;
  onEdit: (address: DbAddress) => void;
  onDelete: (id: string) => void;
  onSetDefault: (address: DbAddress) => void;
}) => (
  <div className={type === "shipping" ? "mb-8" : ""}>
    <div className="flex justify-between items-center mb-4">
      <h2 className="font-semibold text-[16px] text-gray-900">{title}</h2>
      <button
        onClick={() => onAdd(type)}
        className="flex items-center cursor-pointer gap-1.5 text-sm font-semibold text-gray-600 hover:text-black transition-colors"
      >
        <Plus size={16} />
        Add New
      </button>
    </div>
    {addresses.length === 0 ? (
      <p className="text-sm text-[#6C7275]">No {type} addresses saved.</p>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((address) => (
          <AddressCard
            key={address.id}
            address={address}
            onEdit={onEdit}
            onDelete={onDelete}
            onSetDefault={onSetDefault}
          />
        ))}
      </div>
    )}
  </div>
);

const Address = ({ fullName }: AddressProps) => {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { data: addresses = [], isLoading: loading } = useGetAddressesQuery(
    user?.id ?? "",
    { skip: !user?.id },
  );
  const [deleteAddr] = useDeleteAddressMutation();
  const [setDefault] = useSetDefaultAddressMutation();
  const [saveAddr] = useSaveAddressMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressData | null>(
    null,
  );
  const [modalFixedType, setModalFixedType] = useState<
    "shipping" | "billing" | undefined
  >(undefined);

  const handleAdd = (type?: "shipping" | "billing") => {
    setEditingAddress(null);
    setModalFixedType(type);
    setModalOpen(true);
  };

  const handleEdit = (address: DbAddress) => {
    setEditingAddress(dbToFormData(address));
    setModalFixedType(address.type as "shipping" | "billing");
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (user?.id) {
      await deleteAddr({ id, userId: user.id });
    }
  };

  const handleSetDefault = async (address: DbAddress) => {
    if (user?.id) {
      await setDefault({ id: address.id, userId: user.id, type: address.type });
    }
  };

  const handleSave = async (data: AddressData) => {
    if (user?.id) {
      try {
        await saveAddr({ data, userId: user.id, modalFixedType }).unwrap();
        setModalOpen(false);
      } catch {
        toast.error("Please fill all required address fields.");
        throw new Error("Address save failed");
      }
    }
  };

  const shippingAddresses = addresses.filter((a) => a.type === "shipping");
  const billingAddresses = addresses.filter((a) => a.type === "billing");

  if (loading) {
    return (
      <div>
        <h1 className="font-semibold text-[20px] mb-4 md:mb-6">Address</h1>
        <p className="text-[#6C7275]">Loading addresses...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-semibold text-[20px] mb-4 md:mb-6">Address</h1>

      <AddressSection
        title="Shipping Addresses"
        type="shipping"
        addresses={shippingAddresses}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSetDefault={handleSetDefault}
      />

      <AddressSection
        title="Billing Addresses"
        type="billing"
        addresses={billingAddresses}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSetDefault={handleSetDefault}
      />

      <AddressModal
        isOpen={modalOpen}
        title={
          editingAddress?.id
            ? `Edit ${modalFixedType === "billing" ? "Billing" : "Shipping"} Address`
            : `Add ${modalFixedType === "billing" ? "Billing" : "Shipping"} Address`
        }
        defaultValues={editingAddress}
        fixedType={modalFixedType}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default Address;
