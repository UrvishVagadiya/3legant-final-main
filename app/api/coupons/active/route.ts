import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET() {
    const supabase = createClient(cookies());
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("is_active", true)
        .or(`valid_until.is.null,valid_until.gt.${now}`)
        .order("discount_value", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter out coupons that have reached their usage limit
    const availableCoupons = data.filter(coupon => 
        !coupon.usage_limit || coupon.used_count < coupon.usage_limit
    );

    return NextResponse.json(availableCoupons);
}
