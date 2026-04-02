import { SavedAddress } from "@/components/checkout/SavedAddressSelector";

export const F = ["firstName", "lastName", "phone", "streetAddress", "country", "city", "state", "zipCode"] as const;
export const billingKeys = F.map((f) => `billing${f[0].toUpperCase()}${f.slice(1)}`);
export const initialForm: Record<string, string> = Object.fromEntries(
    [...F, "email", ...billingKeys].map((k) => [k, ""]),
);
const DB: Record<string, string> = {
    firstName: "first_name", lastName: "last_name", phone: "phone",
    streetAddress: "street_address", country: "country", city: "city", state: "state", zipCode: "zip_code",
};
export function applyAddress(address: SavedAddress, isBilling: boolean): Record<string, string> {
    const c = isBilling ? (s: string) => `billing${s[0].toUpperCase()}${s.slice(1)}` : (s: string) => s;
    const r: Record<string, string> = {};
    F.forEach((f) => (r[c(f)] = (address as any)[DB[f]] || ""));
    if (!isBilling && address.email) r.email = address.email;
    return r;
}

export function validateCheckoutForm(formData: Record<string, string>, useDifferentBilling: boolean): Record<string, string> {
    const errors: Record<string, string> = {};
    const fieldsToValidate = [...F, "email"] as string[];
    if (useDifferentBilling) {
        fieldsToValidate.push(...billingKeys);
    }

    fieldsToValidate.forEach((field) => {
        if (!formData[field] || !formData[field].trim()) {
            errors[field] = "This field is required";
        }
    });

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
        errors.email = "Invalid email format";
    }

    return errors;
}
