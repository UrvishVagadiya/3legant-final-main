import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const admin = createAdminClient();
        
        let { data: profile, error } = await admin
            .from("user_profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

        if (error) {
            console.error("Profile fetch error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!profile) {
            const { data: newProfile, error: createError } = await admin
                .from("user_profiles")
                .insert({
                    id: user.id,
                    email: user.email,
                    role: "user",
                    full_name: user.user_metadata?.full_name || "User",
                    display_name: user.user_metadata?.display_name || user.email?.split("@")[0] || "User",
                })
                .select()
                .single();

            if (createError) {
                console.error("Profile creation error:", createError);
                return NextResponse.json({ error: createError.message }, { status: 500 });
            }
            profile = newProfile;
        }

        return NextResponse.json(profile);
    } catch (err: any) {
        console.error("Profile route error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
