import { apiService } from '../apiService';
import { createClient } from '@/utils/supabase/client';

export interface DbAddress {
  id: string;
  type: string;
  label: string | null;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default: boolean;
}

export interface AddressData {
  id?: string;
  label?: string;
  type?: "shipping" | "billing";
  name: string;
  phone: string;
  email?: string;
  address: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  is_default?: boolean;
}

interface AddressRow extends DbAddress {
  created_at?: string;
}

export const addressApi = apiService.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAddresses: builder.query<DbAddress[], string>({
      queryFn: async (userId) => {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("user_addresses")
          .select("*")
          .eq("user_id", userId)
          .order("is_default", { ascending: false })
          .order("created_at", { ascending: false });

        if (error) return { error };
        return { data: (data || []).map((a: AddressRow) => ({ ...a, label: a.label ?? null })) };
      },
      providesTags: (result, error, userId) => [{ type: 'Address', id: userId }],
    }),
    deleteAddress: builder.mutation<null, { id: string; userId: string }>({
      queryFn: async ({ id, userId }) => {
        const supabase = createClient();

        const { data: deletingAddress, error: getAddressError } = await supabase
          .from("user_addresses")
          .select("id, type, is_default")
          .eq("id", id)
          .eq("user_id", userId)
          .maybeSingle();

        if (getAddressError) return { error: getAddressError };

        const { error } = await supabase
          .from("user_addresses")
          .delete()
          .eq("id", id)
          .eq("user_id", userId);
        if (error) return { error };

        if (deletingAddress?.is_default && deletingAddress.type) {
          const { data: remainingAddresses, error: remainingError } = await supabase
            .from("user_addresses")
            .select("id, is_default")
            .eq("user_id", userId)
            .eq("type", deletingAddress.type)
            .order("created_at", { ascending: false });

          if (remainingError) return { error: remainingError };

          if (remainingAddresses?.length) {
            const hasDefault = remainingAddresses.some(
              (address: { id: string; is_default: boolean }) => address.is_default,
            );
            if (!hasDefault) {
              const { error: setDefaultError } = await supabase
                .from("user_addresses")
                .update({ is_default: true })
                .eq("id", remainingAddresses[0].id)
                .eq("user_id", userId);

              if (setDefaultError) return { error: setDefaultError };
            }
          }
        }

        return { data: null };
      },
      invalidatesTags: (result, error, { userId }) => [{ type: 'Address', id: userId }],
    }),
    setDefaultAddress: builder.mutation<null, { id: string; userId: string; type: string }>({
      queryFn: async ({ id, userId, type }) => {
        const supabase = createClient();
        await supabase.from("user_addresses").update({ is_default: false }).eq("user_id", userId).eq("type", type);
        const { error } = await supabase.from("user_addresses").update({ is_default: true }).eq("id", id);
        if (error) return { error };
        return { data: null };
      },
      invalidatesTags: (result, error, { userId }) => [{ type: 'Address', id: userId }],
    }),
    saveAddress: builder.mutation<null, { data: AddressData; userId: string; modalFixedType?: "shipping" | "billing" }>({
      queryFn: async ({ data, userId, modalFixedType }) => {
        const supabase = createClient();

        // Ensure all fields exist and trim them
        const trimmedName = (data.name ?? "").toString().trim();
        const trimmedPhone = (data.phone ?? "").toString().trim();
        const trimmedStreet = ((data.street_address ?? data.address ?? "")).toString().trim();
        const trimmedCity = (data.city ?? "").toString().trim();
        const trimmedState = (data.state ?? "").toString().trim();
        const trimmedZip = (data.zip_code ?? "").toString().trim();
        const trimmedCountry = (data.country ?? "").toString().trim();

        console.log("API trimmed fields:", { trimmedName, trimmedPhone, trimmedStreet, trimmedCity, trimmedState, trimmedZip, trimmedCountry });

        // Validate each field and provide specific error
        const missingFields = [];
        if (!trimmedName) missingFields.push("Full name");
        if (!trimmedPhone) missingFields.push("Phone number");
        if (!trimmedStreet) missingFields.push("Street address");
        if (!trimmedCity) missingFields.push("City");
        if (!trimmedState) missingFields.push("State");
        if (!trimmedZip) missingFields.push("Zip code");
        if (!trimmedCountry) missingFields.push("Country");

        if (missingFields.length > 0) {
          const fieldMessage = missingFields.length === 1
            ? `${missingFields[0]} is required`
            : `Required fields missing: ${missingFields.join(", ")}`;
          console.error("Validation failed, missing:", missingFields);
          return { error: { status: 400, data: fieldMessage } };
        }

        const nameParts = trimmedName.split(/\s+/);
        const type = data.type || modalFixedType || "shipping";

        const baseRow: Record<string, unknown> = {
          user_id: userId,
          type,
          first_name: nameParts[0] || "",
          last_name: nameParts.slice(1).join(" ") || "",
          phone: trimmedPhone,
          email: data.email || null,
          street_address: trimmedStreet,
          city: trimmedCity,
          state: trimmedState,
          zip_code: trimmedZip,
          country: trimmedCountry,
        };

        const tryWithLabel = data.label ? { ...baseRow, label: data.label } : baseRow;

        try {
          if (data.id) {
            let { error } = await supabase.from("user_addresses").update(tryWithLabel).eq("id", data.id);
            if (error && data.label) {
              const retry = await supabase.from("user_addresses").update(baseRow).eq("id", data.id);
              error = retry.error;
            }
            if (error) {
              console.error("Update error:", error);
              return { error: { status: 400, data: error.message || "Failed to update address" } };
            }
          } else {
            const { data: existingOfType } = await supabase.from("user_addresses").select("id").eq("user_id", userId).eq("type", type);
            const isDefault = (existingOfType || []).length === 0;
            let { error } = await supabase.from("user_addresses").insert({ ...tryWithLabel, is_default: isDefault });
            if (error) {
              const retry = await supabase.from("user_addresses").insert({ ...baseRow, is_default: isDefault });
              error = retry.error;
            }
            if (error) {
              console.error("Insert error:", error);
              return { error: { status: 400, data: error.message || "Failed to add address" } };
            }
          }
        } catch (err) {
          console.error("Unexpected error:", err);
          return { error: { status: 500, data: "An unexpected error occurred while saving the address" } };
        }

        return { data: null };
      },
      invalidatesTags: (result, error, { userId }) => [{ type: 'Address', id: userId }],
    }),
  }),
});

export const {
  useGetAddressesQuery,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
  useSaveAddressMutation,
} = addressApi;
