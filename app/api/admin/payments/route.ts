import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { cookies } from "next/headers";

async function getAuthUser() {
    const supabase = createClient(cookies());
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export async function GET() {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("payments")
        .select("*, orders(order_code, shipping_first_name, shipping_last_name, refund_status)")
        .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}
