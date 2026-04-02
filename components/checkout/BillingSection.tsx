import FormField from "@/components/ui/FormField";
import SavedAddressSelector, { SavedAddress } from "./SavedAddressSelector";
import AddressFormFields from "./AddressFormFields";

interface BillingSectionProps {
  savedAddresses: SavedAddress[];
  selectedId: string;
  onSelect: (id: string) => void;
  formData: Record<string, string>;
  errors: Record<string, string>;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
}

export default function BillingSection({
  savedAddresses,
  selectedId,
  onSelect,
  formData,
  errors,
  onChange,
}: BillingSectionProps) {
  const showForm = selectedId === "new" || savedAddresses.length === 0;

  return (
    <div className="mt-6 space-y-4 border-t border-gray-200 pt-6">
      <h3 className="text-lg font-semibold">Billing Address</h3>

      <SavedAddressSelector
        addresses={savedAddresses}
        selectedId={selectedId}
        onSelect={onSelect}
        radioName="billingAddressSelect"
        label="CHOOSE SAVED BILLING ADDRESS"
      />

      {showForm && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="FIRST NAME"
              name="billingFirstName"
              value={formData.billingFirstName}
              onChange={onChange}
              error={errors.billingFirstName}
              placeholder="First name"
            />
            <FormField
              label="LAST NAME"
              name="billingLastName"
              value={formData.billingLastName}
              onChange={onChange}
              error={errors.billingLastName}
              placeholder="Last name"
            />
          </div>
          <FormField
            label="PHONE NUMBER"
            name="billingPhone"
            type="tel"
            value={formData.billingPhone}
            onChange={onChange}
            error={errors.billingPhone}
            placeholder="Phone number"
          />
          <AddressFormFields
            prefix="billing"
            formData={formData}
            errors={errors}
            onChange={onChange}
          />
        </>
      )}
    </div>
  );
}
