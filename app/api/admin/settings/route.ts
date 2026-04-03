import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { cookies } from "next/headers";

interface SettingRow {
    id: string;
    value: unknown;
}

async function isAdmin() {
    const supabase = createClient(cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    return profile?.role === "admin";
}

export async function GET() {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("store_settings")
        .select("*");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Convert array of settings to a more usable object if needed
    const settings = (data || []).reduce<Record<string, unknown>>((acc, curr: SettingRow) => {
        acc[curr.id] = curr.value;
        return acc;
    }, {});

    return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id, value } = await req.json();
        if (!id || value === undefined) {
            return NextResponse.json({ error: "Missing id or value" }, { status: 400 });
        }

        const admin = createAdminClient();
        const { error } = await admin
            .from("store_settings")
            .upsert({ id, value, updated_at: new Date().toISOString() });

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
}
