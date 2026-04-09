import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import AddressFormBody, { AddressFormValues } from "./AddressFormBody";

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
  onSave: (data: AddressData) => Promise<void> | void;
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
  const buildInitialValues = (): AddressFormValues => ({
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

  const [values, setValues] = useState<AddressFormValues>(buildInitialValues());
  const [errors, setErrors] = useState<
    Partial<Record<keyof AddressFormValues, string>>
  >({});

  useEffect(() => {
    if (isOpen) {
      setValues(buildInitialValues());
      setErrors({});
    }
  }, [isOpen, defaultValues, fixedType]);

  if (!isOpen) return null;

  const handleFieldChange = <K extends keyof AddressFormValues>(
    field: K,
    value: AddressFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof AddressFormValues, string>> = {};
    (Object.keys(values) as Array<keyof AddressFormValues>).forEach((field) => {
      const value = String(values[field] ?? "").trim();
      if (field !== "label" && field !== "type" && !value) {
        const labelMap: Record<
          Exclude<keyof AddressFormValues, "label" | "type">,
          string
        > = {
          name: "Full name",
          phone: "Phone number",
          street_address: "Street address",
          city: "City",
          state: "State",
          zip_code: "Zip code",
          country: "Country",
        };
        nextErrors[field] =
          `${labelMap[field as keyof typeof labelMap]} is required`;
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) return;

    const payload = {
      id: defaultValues?.id,
      label: values.label.trim(),
      type: fixedType || values.type || "shipping",
      name: values.name.trim(),
      phone: values.phone.trim(),
      address: `${values.street_address.trim()}, ${values.city.trim()}, ${values.state.trim()} ${values.zip_code.trim()}, ${values.country.trim()}`,
      street_address: values.street_address.trim(),
      city: values.city.trim(),
      state: values.state.trim(),
      zip_code: values.zip_code.trim(),
      country: values.country.trim(),
    };

    await onSave(payload);
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
          <form id="address-form" onSubmit={onSubmit} className="space-y-4">
            <AddressFormBody
              values={values}
              errors={errors}
              onChange={handleFieldChange}
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
