import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient(cookies());
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { orderId } = await req.json();
        if (!orderId) return NextResponse.json({ error: "Order ID is required" }, { status: 400 });

        const { data: order, error: orderFetchError } = await supabase
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .eq("user_id", user.id)
            .single();

        if (orderFetchError || !order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        if (order.status !== "pending" && order.status !== "failed") {
            return NextResponse.json({ message: "Order is already processed or cancelled", status: order.status });
        }

        const { data: items } = await supabase
            .from("order_items")
            .select("product_id, quantity")
            .eq("order_id", orderId);

        if (items && items.length > 0) {
            await supabase.rpc("restore_product_stock", {
                items: items.map(i => ({
                    product_id: i.product_id,
                    quantity: i.quantity
                }))
            });
        }
        const { error: updateError } = await supabase
            .from("orders")
            .update({
                status: "cancelled",
                updated_at: new Date().toISOString()
            })
            .eq("id", orderId)
            .eq("user_id", user.id);

        if (updateError) {
            console.error("Order update error:", updateError);
            throw updateError;
        }
        const { error: paymentUpdateError } = await supabase
            .from("payments")
            .update({
                status: "cancelled",
                updated_at: new Date().toISOString()
            })
            .eq("order_id", orderId);

        if (paymentUpdateError) {
            console.error("Payment update error:", paymentUpdateError);
        }

        return NextResponse.json({ success: true, message: "Order cancelled and stock restored" });
    } catch (error: unknown) {
        console.error("Cancel pending order error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
