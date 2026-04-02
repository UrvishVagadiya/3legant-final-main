"use client";

import { Provider } from "react-redux";
import { store, useAppDispatch } from "@/store";
import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { setAuth } from "@/store/slices/authSlice";
import { clearCart, setCartItems } from "@/store/slices/cartSlice";
import { clearWishlist, setWishlistItems } from "@/store/slices/wishlistSlice";
import { useGetCartItemsQuery } from "@/store/api/cartApi";
import { useGetWishlistItemsQuery } from "@/store/api/wishlistApi";
import { useGetProfileQuery } from "@/store/api/authApi";
import { useAppSelector } from "@/store";
import { setRole } from "@/store/slices/authSlice";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  
  const { data: remoteCart } = useGetCartItemsQuery(user?.id ?? '', { skip: !user?.id });
  const { data: remoteWishlist } = useGetWishlistItemsQuery(user?.id ?? '', { skip: !user?.id });
  const { data: profile } = useGetProfileQuery(undefined, { skip: !user });

  useEffect(() => {
    if (profile && profile.role) {
      dispatch(setRole(profile.role));
    }
  }, [profile, dispatch]);

  useEffect(() => {
    if (remoteCart && remoteCart.length > 0) {
      dispatch(setCartItems(remoteCart));
    }
  }, [remoteCart, dispatch]);

  useEffect(() => {
    if (remoteWishlist && remoteWishlist.length > 0) {
      dispatch(setWishlistItems(remoteWishlist));
    }
  }, [remoteWishlist, dispatch]);

  useEffect(() => {
    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      const user = session?.user ?? null;
      dispatch(setAuth({ user, session }));

      if (!user && (event === 'SIGNED_OUT' || !user)) {
        dispatch(clearCart());
        dispatch(clearWishlist());
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return <>{children}</>;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
