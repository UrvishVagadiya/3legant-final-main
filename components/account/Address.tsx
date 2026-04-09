"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import AddressModal from "./AddressModal";
import AddressCard from "./AddressCard";
import DeleteReviewModal from "@/components/product/DeleteReviewModal";
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
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    addressId: string | null;
    addressType: "shipping" | "billing" | null;
  }>({
    isOpen: false,
    addressId: null,
    addressType: null,
  });
  const [isDeletingAddress, setIsDeletingAddress] = useState(false);
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
      setDeleteConfirmModal({
        isOpen: true,
        addressId: id,
        addressType: null,
      });
    }
  };

  const handleSetDefault = async (address: DbAddress) => {
    if (user?.id) {
      await setDefault({ id: address.id, userId: user.id, type: address.type });
    }
  };

  const normalize = (value: string) =>
    value.trim().replace(/\s+/g, " ").toLowerCase();

  const isDuplicateAddress = (data: AddressData) => {
    const type = data.type || modalFixedType || "shipping";
    const targetName = normalize(data.name);
    const targetPhone = normalize(data.phone);
    const targetStreet = normalize(data.street_address || "");
    const targetCity = normalize(data.city || "");
    const targetState = normalize(data.state || "");
    const targetZip = normalize(data.zip_code || "");
    const targetCountry = normalize(data.country || "");

    return addresses.some((address) => {
      if (address.type !== type) return false;
      if (data.id && address.id === data.id) return false;

      const currentName = normalize(
        `${address.first_name} ${address.last_name}`,
      );
      return (
        currentName === targetName &&
        normalize(address.phone || "") === targetPhone &&
        normalize(address.street_address || "") === targetStreet &&
        normalize(address.city || "") === targetCity &&
        normalize(address.state || "") === targetState &&
        normalize(address.zip_code || "") === targetZip &&
        normalize(address.country || "") === targetCountry
      );
    });
  };

  const handleSave = async (data: AddressData) => {
    if (user?.id) {
      if (!data.id && isDuplicateAddress(data)) {
        toast.error("This address already exists.");
        return;
      }

      console.log("handleSave received data:", data);
      console.log("Data types:", {
        name: typeof data.name,
        phone: typeof data.phone,
        street_address: typeof data.street_address,
        city: typeof data.city,
        state: typeof data.state,
        zip_code: typeof data.zip_code,
        country: typeof data.country,
      });

      try {
        await saveAddr({ data, userId: user.id, modalFixedType }).unwrap();
        setModalOpen(false);
        toast.success("Address saved successfully!");
      } catch (err: unknown) {
        console.error("Save error:", err);

        let message = "Unable to save address. Please try again.";

        // Extract error message from RTK Query error
        if (typeof err === "object" && err !== null) {
          const error = err as any;

          // Check various error message locations
          if (error.data && typeof error.data === "string") {
            message = error.data;
          } else if (error.message && typeof error.message === "string") {
            message = error.message;
          } else if (error.error && typeof error.error === "string") {
            message = error.error;
          }
        }

        toast.error(message);
        // Don't re-throw - let user fix and try again
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

      <DeleteReviewModal
        isOpen={deleteConfirmModal.isOpen}
        isLoading={isDeletingAddress}
        title="Delete Address"
        message="Are you sure you want to delete this address? This action cannot be undone."
        confirmText="Yes, Delete"
        loadingText="Deleting..."
        onCancel={() =>
          setDeleteConfirmModal({
            isOpen: false,
            addressId: null,
            addressType: null,
          })
        }
        onConfirm={async () => {
          if (!user?.id || !deleteConfirmModal.addressId) return;

          setIsDeletingAddress(true);
          try {
            await deleteAddr({
              id: deleteConfirmModal.addressId,
              userId: user.id,
            }).unwrap();
            toast.success("Address deleted successfully!");
            setDeleteConfirmModal({
              isOpen: false,
              addressId: null,
              addressType: null,
            });
          } catch (err) {
            toast.error("Failed to delete address");
          } finally {
            setIsDeletingAddress(false);
          }
        }}
      />
    </div>
  );
};

export default Address;
