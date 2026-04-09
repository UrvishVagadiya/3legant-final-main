import React, { useEffect, useMemo } from "react";
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
  const defaultFormValues = useMemo(
    () => ({
      label: defaultValues?.label || "",
      type: fixedType || defaultValues?.type || "shipping",
      name: defaultValues?.name || "",
      phone: defaultValues?.phone || "",
      street_address: defaultValues?.street_address || "",
      city: defaultValues?.city || "",
      state: defaultValues?.state || "",
      zip_code: defaultValues?.zip_code || "",
      country: defaultValues?.country || "",
    }),
    [
      defaultValues?.label,
      defaultValues?.type,
      defaultValues?.name,
      defaultValues?.phone,
      defaultValues?.street_address,
      defaultValues?.city,
      defaultValues?.state,
      defaultValues?.zip_code,
      defaultValues?.country,
      fixedType,
    ],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormFields>({
    mode: "onChange",
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
    if (isOpen) {
      reset(defaultFormValues);
    }
  }, [isOpen, defaultFormValues, reset]);

  if (!isOpen) return null;

  const onSubmit = async (
    _data: FormFields,
    event?: React.BaseSyntheticEvent,
  ) => {
    const form = event?.currentTarget as HTMLFormElement | undefined;
    const formValues = form
      ? Object.fromEntries(new FormData(form).entries())
      : {};

    const name = String(formValues.name ?? "").trim();
    const phone = String(formValues.phone ?? "").trim();
    const street_address = String(formValues.street_address ?? "").trim();
    const city = String(formValues.city ?? "").trim();
    const state = String(formValues.state ?? "").trim();
    const zip_code = String(formValues.zip_code ?? "").trim();
    const country = String(formValues.country ?? "").trim();
    const type = String(
      formValues.type ?? (fixedType || defaultValues?.type || "shipping"),
    ) as "shipping" | "billing";

    await onSave({
      id: defaultValues?.id,
      label: String(formValues.label ?? "").trim(),
      type,
      name,
      phone,
      address: `${street_address}, ${city}, ${state} ${zip_code}, ${country}`,
      street_address,
      city,
      state,
      zip_code,
      country,
    });
  };

  const onInvalidSubmit = (formErrors: unknown) => {
    console.error("Form submission blocked by validation errors:", formErrors);
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
            onSubmit={handleSubmit(onSubmit, onInvalidSubmit)}
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
