import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type") as EmailOtpType | null;
    const next = searchParams.get("next") ?? "/reset-password";
    const supabase = createClient(cookies());

    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            return NextResponse.redirect(new URL(next, request.url));
        }
    }

    if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type,
        });

        if (!error) {
            return NextResponse.redirect(new URL(next, request.url));
        }
    }

    return NextResponse.redirect(
        new URL("/signin?error=Could+not+verify+reset+link", request.url)
    );
}
