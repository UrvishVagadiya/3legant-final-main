import React from "react";

export type AddressFormValues = {
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

export type FormFields = AddressFormValues;

const inputClass = (hasError: boolean) =>
  `w-full border rounded-[6px] px-4 py-3 outline-none transition-colors ${hasError ? "border-red-500" : "border-gray-300 focus:border-black bg-white"}`;

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
  values: FormFields;
  errors: Partial<Record<keyof FormFields, string>>;
  onChange: <K extends keyof FormFields>(
    field: K,
    value: FormFields[K],
  ) => void;
  showTypeSelector: boolean;
  fixedType?: "shipping" | "billing";
}

const AddressFormBody = ({
  values,
  errors,
  onChange,
  showTypeSelector,
  fixedType,
}: Props) => (
  <>
    <div className="grid grid-cols-2 gap-4">
      <FieldBlock label="LABEL">
        <input
          type="text"
          placeholder='e.g. "Home", "Office"'
          value={values.label}
          onChange={(e) => onChange("label", e.target.value)}
          className={inputClass(Boolean(errors.label))}
        />
      </FieldBlock>
      {showTypeSelector && !fixedType && (
        <FieldBlock label="TYPE *" error={errors.type}>
          <select
            value={values.type}
            onChange={(e) =>
              onChange("type", e.target.value as FormFields["type"])
            }
            className={`${inputClass(Boolean(errors.type))} cursor-pointer appearance-none`}
          >
            <option value="shipping">Shipping</option>
            <option value="billing">Billing</option>
          </select>
        </FieldBlock>
      )}
    </div>

    <FieldBlock label="FULL NAME *" error={errors.name}>
      <input
        type="text"
        placeholder="Full name"
        value={values.name}
        onChange={(e) => onChange("name", e.target.value)}
        className={inputClass(Boolean(errors.name))}
      />
    </FieldBlock>

    <FieldBlock label="PHONE NUMBER *" error={errors.phone}>
      <input
        type="text"
        placeholder="Phone number"
        value={values.phone}
        onChange={(e) => onChange("phone", e.target.value)}
        className={inputClass(Boolean(errors.phone))}
      />
    </FieldBlock>

    <FieldBlock label="STREET ADDRESS *" error={errors.street_address}>
      <input
        type="text"
        placeholder="Street address"
        value={values.street_address}
        onChange={(e) => onChange("street_address", e.target.value)}
        className={inputClass(Boolean(errors.street_address))}
      />
    </FieldBlock>

    <div className="grid grid-cols-2 gap-4">
      <FieldBlock label="CITY *" error={errors.city}>
        <input
          type="text"
          placeholder="City"
          value={values.city}
          onChange={(e) => onChange("city", e.target.value)}
          className={inputClass(Boolean(errors.city))}
        />
      </FieldBlock>
      <FieldBlock label="STATE *" error={errors.state}>
        <input
          type="text"
          placeholder="State"
          value={values.state}
          onChange={(e) => onChange("state", e.target.value)}
          className={inputClass(Boolean(errors.state))}
        />
      </FieldBlock>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <FieldBlock label="ZIP CODE *" error={errors.zip_code}>
        <input
          type="text"
          placeholder="Zip code"
          value={values.zip_code}
          onChange={(e) => onChange("zip_code", e.target.value)}
          className={inputClass(Boolean(errors.zip_code))}
        />
      </FieldBlock>
      <FieldBlock label="COUNTRY *" error={errors.country}>
        <select
          value={values.country}
          onChange={(e) => onChange("country", e.target.value)}
          className={`${inputClass(Boolean(errors.country))} cursor-pointer appearance-none`}
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
