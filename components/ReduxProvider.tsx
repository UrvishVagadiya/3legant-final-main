"use client";

import { Provider } from "react-redux";
import { store, useAppDispatch } from "@/store";
import { useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { setAuth } from "@/store/slices/authSlice";
import { clearCart, setCartItems } from "@/store/slices/cartSlice";
import { clearWishlist, setWishlistItems } from "@/store/slices/wishlistSlice";
import { useGetCartItemsQuery } from "@/store/api/cartApi";
import { useGetWishlistItemsQuery } from "@/store/api/wishlistApi";
import { useGetProfileQuery } from "@/store/api/authApi";
import { useAppSelector } from "@/store";
import { setRole } from "@/store/slices/authSlice";
import type { Session } from "@supabase/supabase-js";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const cartItems = useAppSelector((state) => state.cart.items);
  const hasHydratedCartRef = useRef(false);
  const initialCartSnapshotRef = useRef<string | null>(null);
  const hasLocalCartChangedRef = useRef(false);

  const { data: remoteCart } = useGetCartItemsQuery(user?.id ?? "", {
    skip: !user?.id,
  });
  const { data: remoteWishlist } = useGetWishlistItemsQuery(user?.id ?? "", {
    skip: !user?.id,
  });
  const { data: profile } = useGetProfileQuery(undefined, { skip: !user });

  useEffect(() => {
    if (initialCartSnapshotRef.current === null) {
      initialCartSnapshotRef.current = JSON.stringify(cartItems);
      return;
    }

    if (JSON.stringify(cartItems) !== initialCartSnapshotRef.current) {
      hasLocalCartChangedRef.current = true;
    }
  }, [cartItems]);

  useEffect(() => {
    if (profile && profile.role) {
      dispatch(setRole(profile.role));
    }
  }, [profile, dispatch]);

  useEffect(() => {
    if (!user) {
      hasHydratedCartRef.current = false;
      initialCartSnapshotRef.current = null;
      hasLocalCartChangedRef.current = false;
      return;
    }

    if (!remoteCart || hasHydratedCartRef.current) {
      return;
    }

    // If cart was changed locally before remote response arrived,
    // keep local state to avoid stale re-insert from server.
    if (
      remoteCart.length > 0 &&
      cartItems.length === 0 &&
      !hasLocalCartChangedRef.current
    ) {
      dispatch(setCartItems(remoteCart));
    }

    hasHydratedCartRef.current = true;
  }, [remoteCart, dispatch, user, cartItems.length]);

  useEffect(() => {
    if (user && !hasHydratedCartRef.current) {
      initialCartSnapshotRef.current = JSON.stringify(cartItems);
    }
  }, [user, cartItems]);

  useEffect(() => {
    if (remoteWishlist && remoteWishlist.length > 0) {
      dispatch(setWishlistItems(remoteWishlist));
    }
  }, [remoteWishlist, dispatch]);

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        const user = session?.user ?? null;
        dispatch(setAuth({ user, session }));

        if (!user && (event === "SIGNED_OUT" || !user)) {
          dispatch(clearCart());
          dispatch(clearWishlist());
        }
      },
    );

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
