import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";

import { useAppSelector } from "@/store";

export function useAuthGuard() {
    const router = useRouter();
    const { isAuthenticated: authStatus, loading } = useAppSelector((state) => state.auth);

    const requireAuth = useCallback(
        (action: () => void) => {
            if (loading) return; 
            
            if (authStatus) {
                action();
            } else {
                toast("Please sign in to continue", {
                    icon: "🔒",
                    style: {
                        borderRadius: "8px",
                        background: "#141718",
                        color: "#fff",
                    },
                });
                router.push("/signin");
            }
        },
        [authStatus, loading, router],
    );

    return { isAuthenticated: authStatus, requireAuth };
}
