import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { cookies } from "next/headers";

async function getAuthUser() {
    const supabase = createClient(cookies());
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export async function GET(req: NextRequest) {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    const admin = createAdminClient();

    if (orderId) {
        const { data, error } = await admin
            .from("order_items")
            .select("*")
            .eq("order_id", orderId);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
}
