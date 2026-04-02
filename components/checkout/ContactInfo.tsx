import FormField from "@/components/ui/FormField";

interface ContactInfoProps {
  formData: Record<string, string>;
  errors: Record<string, string>;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
}

export default function ContactInfo({
  formData,
  errors,
  onChange,
}: ContactInfoProps) {
  return (
    <div className="border border-gray-300 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <FormField
          label="FIRST NAME"
          name="firstName"
          value={formData.firstName}
          onChange={onChange}
          error={errors.firstName}
          placeholder="First name"
        />
        <FormField
          label="LAST NAME"
          name="lastName"
          value={formData.lastName}
          onChange={onChange}
          error={errors.lastName}
          placeholder="Last name"
        />
      </div>
      <FormField
        label="PHONE NUMBER"
        name="phone"
        type="tel"
        value={formData.phone}
        onChange={onChange}
        error={errors.phone}
        placeholder="Phone number"
        className="mb-4"
      />
      <FormField
        label="EMAIL ADDRESS"
        name="email"
        type="email"
        value={formData.email}
        onChange={onChange}
        error={errors.email}
        placeholder="Your Email"
      />
    </div>
  );
}
