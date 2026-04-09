import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";

export type FormFields = {
  label: string;
  type: "shipping" | "billing";
  name: string;
  phone: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
};

const inputClass = (errors: FieldErrors<FormFields>, field: keyof FormFields) =>
  `w-full border rounded-[6px] px-4 py-3 outline-none transition-colors ${errors[field] ? "border-red-500" : "border-gray-300 focus:border-black bg-white"}`;

const FieldBlock = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="block text-[12px] font-bold text-[#6C7275] mb-2 uppercase">
      {label}
    </label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

interface Props {
  register: UseFormRegister<FormFields>;
  errors: FieldErrors<FormFields>;
  showTypeSelector: boolean;
  fixedType?: "shipping" | "billing";
}

const AddressFormBody = ({
  register,
  errors,
  showTypeSelector,
  fixedType,
}: Props) => (
  <>
    <div className="grid grid-cols-2 gap-4">
      <FieldBlock label="LABEL">
        <input
          type="text"
          placeholder='e.g. "Home", "Office"'
          {...register("label")}
          className={inputClass(errors, "label")}
        />
      </FieldBlock>
      {showTypeSelector && !fixedType && (
        <FieldBlock label="TYPE *" error={errors.type?.message}>
          <select
            {...register("type", { required: "Type is required" })}
            className={`${inputClass(errors, "type")} cursor-pointer appearance-none`}
          >
            <option value="shipping">Shipping</option>
            <option value="billing">Billing</option>
          </select>
        </FieldBlock>
      )}
    </div>

    <FieldBlock label="FULL NAME *" error={errors.name?.message}>
      <input
        type="text"
        placeholder="Full name"
        {...register("name", {
          required: "Full name is required",
          validate: (v) =>
            !v || v.trim().length > 0 || "Full name cannot be empty",
        })}
        className={inputClass(errors, "name")}
      />
    </FieldBlock>

    <FieldBlock label="PHONE NUMBER *" error={errors.phone?.message}>
      <input
        type="text"
        placeholder="Phone number"
        {...register("phone", {
          required: "Phone number is required",
          validate: (v) =>
            !v || v.trim().length > 0 || "Phone number cannot be empty",
        })}
        className={inputClass(errors, "phone")}
      />
    </FieldBlock>

    <FieldBlock label="STREET ADDRESS *" error={errors.street_address?.message}>
      <input
        type="text"
        placeholder="Street address"
        {...register("street_address", {
          required: "Street address is required",
          validate: (v) =>
            !v || v.trim().length > 0 || "Street address cannot be empty",
        })}
        className={inputClass(errors, "street_address")}
      />
    </FieldBlock>

    <div className="grid grid-cols-2 gap-4">
      <FieldBlock label="CITY *" error={errors.city?.message}>
        <input
          type="text"
          placeholder="City"
          {...register("city", {
            required: "City is required",
            validate: (v) =>
              !v || v.trim().length > 0 || "City cannot be empty",
          })}
          className={inputClass(errors, "city")}
        />
      </FieldBlock>
      <FieldBlock label="STATE *" error={errors.state?.message}>
        <input
          type="text"
          placeholder="State"
          {...register("state", {
            required: "State is required",
            validate: (v) =>
              !v || v.trim().length > 0 || "State cannot be empty",
          })}
          className={inputClass(errors, "state")}
        />
      </FieldBlock>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <FieldBlock label="ZIP CODE *" error={errors.zip_code?.message}>
        <input
          type="text"
          placeholder="Zip code"
          {...register("zip_code", {
            required: "Zip code is required",
            validate: (v) =>
              !v || v.trim().length > 0 || "Zip code cannot be empty",
          })}
          className={inputClass(errors, "zip_code")}
        />
      </FieldBlock>
      <FieldBlock label="COUNTRY *" error={errors.country?.message}>
        <select
          {...register("country", { required: "Country is required" })}
          className={`${inputClass(errors, "country")} cursor-pointer appearance-none`}
        >
          <option value="">Select</option>
          <option value="US">United States</option>
          <option value="UK">United Kingdom</option>
          <option value="CA">Canada</option>
          <option value="IN">India</option>
        </select>
      </FieldBlock>
    </div>
  </>
);

export default AddressFormBody;
