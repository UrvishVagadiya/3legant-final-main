import { apiService } from '../apiService';
import { createClient } from '@/utils/supabase/client';
import { Product } from '../slices/productSlice';
import { isProductNew } from '@/utils/isProductNew';
import { getEffectiveCartPrice } from '@/utils/getEffectiveCartPrice';

type ShopSortOption =
  | 'default'
  | 'az'
  | 'za'
  | 'price-low-high'
  | 'price-high-low';

type PriceFilter = {
  min: number;
  max: number | null;
};

type GetShopProductsArgs = {
  page: number;
  pageSize: number;
  category?: string;
  hasPriceSelection?: boolean;
  sort?: ShopSortOption;
  priceFilters?: PriceFilter[];
};

type GetShopProductsResponse = {
  products: Product[];
  total: number;
};

const normalizeProduct = (product: Product): Product => ({
  ...product,
  isNew: isProductNew(product.created_at || product.createdAt),
});

const toComparableTitle = (product: Product): string => {
  const rawTitle = product.title || product.name || '';
  return String(rawTitle).toLowerCase();
};

export const productApi = apiService.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getShopProducts: builder.query<GetShopProductsResponse, GetShopProductsArgs>({
      queryFn: async ({
        page,
        pageSize,
        category,
        hasPriceSelection = true,
        sort = 'default',
        priceFilters = [],
      }) => {
        if (!hasPriceSelection) {
          return {
            data: {
              products: [],
              total: 0,
            },
          };
        }

        const supabase = createClient();
        const safePage = Math.max(1, page);
        const safePageSize = Math.max(1, pageSize);
        const from = (safePage - 1) * safePageSize;
        const to = from + safePageSize - 1;

        let query = supabase
          .from('products')
          .select('*', { count: 'exact' })
          .eq('status', 'active');

        if (category && category !== 'All Rooms') {
          query = query.contains('category', [category]);
        }

        // Apply price filter in the query if possible
        if (priceFilters.length === 1) {
          const range = priceFilters[0];
          if (range.max === null || !Number.isFinite(range.max)) {
            query = query.gte('price', range.min);
          } else {
            query = query.gte('price', range.min).lte('price', range.max);
          }
        }

        // Apply ordering before range
        query = query.order('created_at', { ascending: false });

        // Apply range for pagination
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) return { error };

        let normalizedProducts: Product[] = (data || []).map((product: Product) =>
          normalizeProduct(product),
        );

        // If multiple price filters (shouldn't happen in your UI), fallback to JS filtering
        if (priceFilters.length > 1) {
          normalizedProducts = normalizedProducts.filter((product: Product) => {
            const effectivePrice = getEffectiveCartPrice(product);
            return priceFilters.some((range) => {
              if (range.max === null || !Number.isFinite(range.max)) {
                return effectivePrice >= range.min;
              }
              return effectivePrice >= range.min && effectivePrice <= range.max;
            });
          });
        }

        // Sort after filtering (if needed)
        if (sort === 'az') {
          normalizedProducts.sort((a, b) => toComparableTitle(a).localeCompare(toComparableTitle(b)));
        } else if (sort === 'za') {
          normalizedProducts.sort((a, b) => toComparableTitle(b).localeCompare(toComparableTitle(a)));
        } else if (sort === 'price-low-high') {
          normalizedProducts.sort((a, b) => getEffectiveCartPrice(a) - getEffectiveCartPrice(b));
        } else if (sort === 'price-high-low') {
          normalizedProducts.sort((a, b) => getEffectiveCartPrice(b) - getEffectiveCartPrice(a));
        }

        return {
          data: {
            products: normalizedProducts,
            total: count ?? normalizedProducts.length,
          },
        };
      },
    }),
    getProductsPage: builder.query<Product[], { offset: number; limit: number }>({
      queryFn: async ({ offset, limit }) => {
        const supabase = createClient();
        const to = offset + limit - 1;
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .range(offset, to);

        if (error) return { error };
        return { data: (data || []).map((product: Product) => normalizeProduct(product)) };
      },
    }),
    getProducts: builder.query<Product[], void>({
      queryFn: async () => {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'active');
        if (error) return { error };
        return { data: (data || []).map((product: Product) => normalizeProduct(product)) };
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: 'Product' as const, id })),
            { type: 'Product', id: 'LIST' },
          ]
          : [{ type: 'Product', id: 'LIST' }],
    }),
    getNewArrivalProducts: builder.query<Product[], void>({
      queryFn: async () => {
        const supabase = createClient();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 7);

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'active')
          .gte('created_at', cutoffDate.toISOString())
          .order('created_at', { ascending: false });

        if (error) return { error };
        return { data: (data || []).map((product: Product) => normalizeProduct(product)) };
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: 'Product' as const, id })),
            { type: 'Product', id: 'NEW_ARRIVALS' },
          ]
          : [{ type: 'Product', id: 'NEW_ARRIVALS' }],
    }),
    getProductById: builder.query<Product, string | number>({
      queryFn: async (id) => {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (error) return { error };
        if (!data) return { error: { message: 'Product not found' } };
        return { data: normalizeProduct(data) };
      },
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    getAdminProducts: builder.query<Product[], void>({
      queryFn: async () => {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) return { error };
        return { data: (data || []).map((product: Product) => normalizeProduct(product)) };
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: 'Product' as const, id })),
            { type: 'Product', id: 'ADMIN_LIST' },
          ]
          : [{ type: 'Product', id: 'ADMIN_LIST' }],
    }),
    addProduct: builder.mutation<Product, Partial<Product>>({
      queryFn: async (productData) => {
        const supabase = createClient();
        const productPayload = {
          ...productData,
          created_at: productData.created_at || new Date().toISOString(),
        };
        const { data, error } = await supabase
          .from('products')
          .insert([productPayload])
          .select()
          .single();
        if (error) return { error };
        return { data: normalizeProduct(data) };
      },
      invalidatesTags: [{ type: 'Product', id: 'LIST' }, { type: 'Product', id: 'ADMIN_LIST' }],
    }),
    updateProduct: builder.mutation<Product, { id: string | number; productData: Partial<Product> }>({
      queryFn: async ({ id, productData }) => {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', id)
          .select()
          .single();
        if (error) return { error };
        return { data: normalizeProduct(data) };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
        { type: 'Product', id: 'ADMIN_LIST' },
      ],
    }),
    deleteProduct: builder.mutation<string | number, string | number>({
      queryFn: async (id) => {
        const supabase = createClient();
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);
        if (error) return { error };
        return { data: id };
      },
      invalidatesTags: (result, error, id) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
        { type: 'Product', id: 'ADMIN_LIST' },
      ],
    }),
    searchProducts: builder.query<Product[], string>({
      queryFn: async (query) => {
        if (!query.trim()) return { data: [] };
        const supabase = createClient();
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .ilike('title', `%${query.trim()}%`)
          .limit(8);
        if (error) return { error };
        return { data: (data || []).map((product: Product) => normalizeProduct(product)) };
      },
    }),
  }),
});

export const {
  useGetShopProductsQuery,
  useLazyGetProductsPageQuery,
  useGetProductsQuery,
  useGetNewArrivalProductsQuery,
  useGetProductByIdQuery,
  useGetAdminProductsQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useLazySearchProductsQuery,
  useSearchProductsQuery,
} = productApi;
