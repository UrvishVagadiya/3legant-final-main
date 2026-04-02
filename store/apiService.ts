import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiService = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery(),
  keepUnusedDataFor: 300, 
  tagTypes: ['Product', 'Cart', 'Wishlist', 'Order', 'Review', 'Blog', 'Address', 'Profile', 'Setting'],
  endpoints: () => ({}),
});
