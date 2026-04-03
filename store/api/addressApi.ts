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
      queryFn: async ({ id }) => {
        const supabase = createClient();
        const { error } = await supabase.from("user_addresses").delete().eq("id", id);
        if (error) return { error };
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
        const nameParts = data.name.split(" ");
        const type = data.type || modalFixedType || "shipping";

        const baseRow: Record<string, unknown> = {
          user_id: userId,
          type,
          first_name: nameParts[0] || "",
          last_name: nameParts.slice(1).join(" ") || "",
          phone: data.phone,
          email: data.email || null,
          street_address: data.street_address || data.address,
          city: data.city || "",
          state: data.state || "",
          zip_code: data.zip_code || "",
          country: data.country || "",
        };

        const tryWithLabel = data.label ? { ...baseRow, label: data.label } : baseRow;

        if (data.id) {
          let { error } = await supabase.from("user_addresses").update(tryWithLabel).eq("id", data.id);
          if (error && data.label) {
            const retry = await supabase.from("user_addresses").update(baseRow).eq("id", data.id);
            error = retry.error;
          }
          if (error) return { error };
        } else {
          const { data: existingOfType } = await supabase.from("user_addresses").select("id").eq("user_id", userId).eq("type", type);
          const isDefault = (existingOfType || []).length === 0;
          let { error } = await supabase.from("user_addresses").insert({ ...tryWithLabel, is_default: isDefault });
          if (error) {
            const retry = await supabase.from("user_addresses").insert({ ...baseRow, is_default: isDefault });
            error = retry.error;
          }
          if (error) return { error };
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
