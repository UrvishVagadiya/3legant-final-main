import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WishlistItem {
  id: number | string;
  name: string;
  price: number | string;
  image: string;
  color?: string;
  MRP?: number;
  stock: number;
}

interface WishlistState {
  items: WishlistItem[];
}

const getInitialWishlistState = (): WishlistState => {
  if (typeof window === 'undefined') {
    return { items: [] };
  }
  const saved = localStorage.getItem('wishlist-storage');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return { items: parsed.items || [] };
    } catch (e) {
      console.error('Failed to parse wishlist storage', e);
    }
  }
  return { items: [] };
};

const initialState: WishlistState = getInitialWishlistState();

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action: PayloadAction<{ item: WishlistItem }>) => {
      const { item } = action.payload;
      if (!state.items.find((i) => i.id == item.id)) {
        state.items.push(item);
        localStorage.setItem('wishlist-storage', JSON.stringify({ items: state.items }));
      }
    },
    removeFromWishlist: (state, action: PayloadAction<{ id: number | string }>) => {
      const { id } = action.payload;
      state.items = state.items.filter((item) => item.id != id);
      localStorage.setItem('wishlist-storage', JSON.stringify({ items: state.items }));
    },
    clearWishlist: (state) => {
      state.items = [];
      localStorage.removeItem('wishlist-storage');
    },
    setWishlistItems: (state, action: PayloadAction<WishlistItem[]>) => {
      state.items = action.payload;
      localStorage.setItem('wishlist-storage', JSON.stringify({ items: state.items }));
    }
  },
});

export const { addToWishlist, removeFromWishlist, clearWishlist, setWishlistItems } = wishlistSlice.actions;
export default wishlistSlice.reducer;
