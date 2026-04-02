import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Product {
  id: number | string;
  title: string;
  price: number;
  mrp?: number;
  img: string;
  category: string | string[];
  status: string;
  created_at?: string;
  [key: string]: any;
}

interface ProductState {
  searchQuery: string;
  selectedCategory: string;
  selectedPrices: string[];
  sortOption: string;
}

const initialState: ProductState = {
  searchQuery: "",
  selectedCategory: "All Rooms",
  selectedPrices: ["All Price"],
  sortOption: "default",
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilters: (state, action: PayloadAction<{ category?: string; prices?: string[]; sort?: string }>) => {
      if (action.payload.category !== undefined) state.selectedCategory = action.payload.category;
      if (action.payload.prices !== undefined) state.selectedPrices = action.payload.prices;
      if (action.payload.sort !== undefined) state.sortOption = action.payload.sort;
    },
    clearSearch: (state) => {
      state.searchQuery = "";
    }
  }
});

export const { setSearchQuery, setFilters, clearSearch } = productSlice.actions;
export default productSlice.reducer;
