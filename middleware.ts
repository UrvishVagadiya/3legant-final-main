import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    if (pathname.startsWith("/api/stripe/webhook") || pathname.startsWith("/api/cron")) {
        return NextResponse.next();
    }

    let supabaseResponse = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        },
    );

    try {
        const isAdminPath = pathname.startsWith("/admin");

        if (isAdminPath) {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return NextResponse.redirect(new URL("/signin", request.url));
            }

            const { data: profile, error } = await supabase
                .from("user_profiles")
                .select("role")
                .eq("id", user.id)
                .maybeSingle();

            if (error || profile?.role !== "admin") {
                console.error("Middleware admin check failed:", error || "Not an admin");
                return NextResponse.redirect(new URL("/", request.url));
            }
        } else {
            await supabase.auth.getUser();
        }
    } catch (error) {
        console.error("Middleware Supabase fetch failed:", error);
        if (pathname.startsWith("/admin")) {
            return NextResponse.redirect(new URL("/signin", request.url));
        }
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
