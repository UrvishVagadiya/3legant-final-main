import SavedAddressSelector, { SavedAddress } from "./SavedAddressSelector";
import AddressFormFields from "./AddressFormFields";

interface ShippingSectionProps {
  savedAddresses: SavedAddress[];
  selectedId: string;
  onSelect: (id: string) => void;
  formData: Record<string, string>;
  errors: Record<string, string>;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  useDifferentBilling: boolean;
  onBillingToggle: (checked: boolean) => void;
}

export default function ShippingSection({
  savedAddresses,
  selectedId,
  onSelect,
  formData,
  errors,
  onChange,
  useDifferentBilling,
  onBillingToggle,
}: ShippingSectionProps) {
  const showForm = selectedId === "new" || savedAddresses.length === 0;

  return (
    <div className="border border-gray-300 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Shipping Address</h2>

      <SavedAddressSelector
        addresses={savedAddresses}
        selectedId={selectedId}
        onSelect={onSelect}
        radioName="shippingAddressSelect"
      />

      {showForm && (
        <AddressFormFields
          prefix=""
          formData={formData}
          errors={errors}
          onChange={onChange}
        />
      )}

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={useDifferentBilling}
          onChange={(e) => onBillingToggle(e.target.checked)}
          className="w-4 h-4 cursor-pointer text-black rounded border-gray-300 focus:ring-black"
        />
        <span className="text-sm text-gray-600">
          Use a different billing address (optional)
        </span>
      </label>
    </div>
  );
}
