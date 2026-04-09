import FormField from "@/components/ui/FormField";
import SelectField, { countryOptions } from "@/components/ui/SelectField";

interface AddressFormFieldsProps {
  prefix: string;
  formData: Record<string, string>;
  errors: Record<string, string>;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
}

const fieldConfig = (prefix: string) => {
  const withPrefix = (field: string) =>
    prefix ? `${prefix}${field[0].toUpperCase()}${field.slice(1)}` : field;

  return {
    street: {
      name: withPrefix("streetAddress"),
      label: "STREET ADDRESS *",
      placeholder: "Street Address",
    },
    country: { name: withPrefix("country"), label: "COUNTRY *" },
    city: {
      name: withPrefix("city"),
      label: "TOWN / CITY *",
      placeholder: "Town / City",
    },
    state: {
      name: withPrefix("state"),
      label: "STATE *",
      placeholder: "State",
    },
    zip: {
      name: withPrefix("zipCode"),
      label: "ZIP CODE *",
      placeholder: "Zip Code",
    },
  };
};

export default function AddressFormFields({
  prefix,
  formData,
  errors,
  onChange,
}: AddressFormFieldsProps) {
  const fields = fieldConfig(prefix);

  return (
    <>
      <FormField
        label={fields.street.label}
        name={fields.street.name}
        value={formData[fields.street.name] || ""}
        onChange={onChange}
        error={errors[fields.street.name]}
        placeholder={fields.street.placeholder}
        className="mb-4"
      />
      <SelectField
        label={fields.country.label}
        name={fields.country.name}
        value={formData[fields.country.name] || ""}
        onChange={onChange}
        error={errors[fields.country.name]}
        options={countryOptions}
        placeholder="Country"
        className="mb-4"
      />
      <FormField
        label={fields.city.label}
        name={fields.city.name}
        value={formData[fields.city.name] || ""}
        onChange={onChange}
        error={errors[fields.city.name]}
        placeholder={fields.city.placeholder}
        className="mb-4"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <FormField
          label={fields.state.label}
          name={fields.state.name}
          value={formData[fields.state.name] || ""}
          onChange={onChange}
          error={errors[fields.state.name]}
          placeholder={fields.state.placeholder}
        />
        <FormField
          label={fields.zip.label}
          name={fields.zip.name}
          value={formData[fields.zip.name] || ""}
          onChange={onChange}
          error={errors[fields.zip.name]}
          placeholder={fields.zip.placeholder}
        />
      </div>
    </>
  );
}
