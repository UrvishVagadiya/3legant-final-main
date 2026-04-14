import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/store/slices/authSlice';
import cartReducer from '@/store/slices/cartSlice';
import wishlistReducer from '@/store/slices/wishlistSlice';
import orderReducer from '@/store/slices/orderSlice';
import addressReducer from '@/store/slices/addressSlice';
import blogReducer from '@/store/slices/blogSlice';

import { apiService } from './apiService';
import productReducer from '@/store/slices/productSlice';

import { setupListeners } from '@reduxjs/toolkit/query';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    address: addressReducer,
    orders: orderReducer,
    blog: blogReducer,
    [apiService.reducerPath]: apiService.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiService.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export * from './hooks';
