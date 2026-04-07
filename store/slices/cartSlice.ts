import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import { createClient } from '@/utils/supabase/client';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  color: string;
  quantity: number;
  stock: number;
}

interface CartState {
  isCartOpen: boolean;
  items: CartItem[];
  shippingMethod: string;
  syncing: boolean;
  lastFetched: number | null;
}

const getInitialCartState = (): CartState => {
  if (typeof window === 'undefined') {
    return { isCartOpen: false, items: [], shippingMethod: 'free', syncing: false, lastFetched: null };
  }
  const saved = localStorage.getItem('cart-storage');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        isCartOpen: false,
        items: parsed.items || [],
        shippingMethod: parsed.shippingMethod || 'free',
        syncing: false,
        lastFetched: null,
      };
    } catch (e) {
      console.error('Failed to parse cart storage', e);
    }
  }
  return { isCartOpen: false, items: [], shippingMethod: 'free', syncing: false, lastFetched: null };
};

const initialState: CartState = getInitialCartState();

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },
    setShippingMethod: (state, action: PayloadAction<string>) => {
      state.shippingMethod = action.payload;
      localStorage.setItem('cart-storage', JSON.stringify({ items: state.items, shippingMethod: state.shippingMethod }));
    },
    addToCart: (state, action: PayloadAction<{ item: Omit<CartItem, 'quantity'> }>) => {
      const { item } = action.payload;
      const safeItem = { ...item, price: Number(item.price) };
      const existingItem = state.items.find(i => i.id === safeItem.id && i.color === safeItem.color);

      if (safeItem.stock <= 0) {
        toast.error('This item is out of stock', {
          id: 'out-of-stock-error',
        });
        return;
      }

      if (existingItem) {
        if (existingItem.quantity >= safeItem.stock) {
          toast.error(`Only ${safeItem.stock} items available in stock`, {
            id: 'stock-limit-error',
          });
          return;
        }
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...safeItem, quantity: 1 });
      }

      toast.success(`${item.name} added to cart!`, {
        style: { borderRadius: '8px', background: '#141718', color: '#fff' },
        id: 'add-to-cart-success',
      });
      localStorage.setItem('cart-storage', JSON.stringify({ items: state.items, shippingMethod: state.shippingMethod }));
    },
    removeFromCart: (state, action: PayloadAction<{ id: string; color: string }>) => {
      state.items = state.items.filter(i => !(i.id === action.payload.id && i.color === action.payload.color));
      localStorage.setItem('cart-storage', JSON.stringify({ items: state.items, shippingMethod: state.shippingMethod }));
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; color: string; quantity: number }>) => {
      const { id, color, quantity } = action.payload;
      const itemIndex = state.items.findIndex(i => i.id === id && i.color === color);
      const item = itemIndex >= 0 ? state.items[itemIndex] : undefined;
      if (item) {
        if (quantity <= 0) {
          state.items.splice(itemIndex, 1);
          localStorage.setItem('cart-storage', JSON.stringify({ items: state.items, shippingMethod: state.shippingMethod }));
          return;
        }

        if (item.stock <= 0) {
          item.quantity = 1;
        } else {
          item.quantity = Math.min(item.stock, Math.max(1, quantity));
        }
      }
      localStorage.setItem('cart-storage', JSON.stringify({ items: state.items, shippingMethod: state.shippingMethod }));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('cart-storage');
    },
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      localStorage.setItem('cart-storage', JSON.stringify({ items: state.items, shippingMethod: state.shippingMethod }));
    }
  },
});

export const { toggleCart, setShippingMethod, addToCart, removeFromCart, updateQuantity, clearCart, setCartItems } = cartSlice.actions;
export default cartSlice.reducer;
