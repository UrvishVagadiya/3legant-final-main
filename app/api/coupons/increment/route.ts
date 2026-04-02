import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    const supabase = createClient(cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { couponId } = await req.json();
    if (!couponId) return NextResponse.json({ error: "Missing couponId" }, { status: 400 });

    const admin = createAdminClient();
    const { data } = await admin.from("coupons").select("used_count").eq("id", couponId).single();
    if (!data) return NextResponse.json({ error: "Coupon not found" }, { status: 404 });

    const { error } = await admin
        .from("coupons")
        .update({ used_count: (data.used_count || 0) + 1 })
        .eq("id", couponId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
