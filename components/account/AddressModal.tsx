import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import AddressFormBody, { FormFields } from "./AddressFormBody";

export type AddressData = {
  id?: string;
  label?: string;
  type?: "shipping" | "billing";
  name: string;
  phone: string;
  address: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  is_default?: boolean;
};

interface AddressModalProps {
  isOpen: boolean;
  title: string;
  defaultValues: AddressData | null;
  onClose: () => void;
  onSave: (data: AddressData) => void;
  showTypeSelector?: boolean;
  fixedType?: "shipping" | "billing";
}

const AddressModal = ({
  isOpen,
  title,
  defaultValues,
  onClose,
  onSave,
  showTypeSelector = false,
  fixedType,
}: AddressModalProps) => {
  const getDefaults = (): FormFields => ({
    label: defaultValues?.label || "",
    type: fixedType || defaultValues?.type || "shipping",
    name: defaultValues?.name || "",
    phone: defaultValues?.phone || "",
    street_address: defaultValues?.street_address || "",
    city: defaultValues?.city || "",
    state: defaultValues?.state || "",
    zip_code: defaultValues?.zip_code || "",
    country: defaultValues?.country || "",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormFields>({ defaultValues: getDefaults() });

  useEffect(() => {
    if (isOpen) reset(getDefaults());
  }, [isOpen, defaultValues, fixedType, reset]);

  if (!isOpen) return null;

  const onSubmit = (data: FormFields) => {
    onSave({
      id: defaultValues?.id,
      label: data.label,
      type: fixedType || data.type,
      name: data.name,
      phone: data.phone,
      address: `${data.street_address}, ${data.city}, ${data.state} ${data.zip_code}, ${data.country}`,
      street_address: data.street_address,
      city: data.city,
      state: data.state,
      zip_code: data.zip_code,
      country: data.country,
    });
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 cursor-pointer hover:text-gray-900 transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <form
            id="address-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <AddressFormBody
              register={register}
              errors={errors}
              showTypeSelector={showTypeSelector}
              fixedType={fixedType}
            />
          </form>
        </div>
        <div className="p-6 border-t border-gray-100 flex gap-4 justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 cursor-pointer rounded-lg border border-gray-300 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="address-form"
            className="px-6 py-2.5 cursor-pointer rounded-lg bg-[#141718] font-medium text-white hover:bg-gray-800 transition-colors"
          >
            {defaultValues?.id ? "Save changes" : "Add Address"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;
