import { NextRequest, NextResponse } from "next/server";
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
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const admin = createAdminClient();
        const { data, error } = await admin
            .from("coupons")
            .insert(body)
            .select()
            .single();

        if (error)
            return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, ...payload } = body;
    const admin = createAdminClient();
    const { data, error } = await admin.from("coupons").update(payload).eq("id", id).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const admin = createAdminClient();
    const { error } = await admin.from("coupons").delete().eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
