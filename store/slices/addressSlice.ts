import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
  address: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  is_default?: boolean;
}

interface AddressState {
  addresses: DbAddress[];
}

const initialState: AddressState = {
  addresses: [],
};

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    setAddresses: (state, action: PayloadAction<DbAddress[]>) => {
      state.addresses = action.payload;
    }
  },
});

export const { setAddresses } = addressSlice.actions;
export default addressSlice.reducer;
