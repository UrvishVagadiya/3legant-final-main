import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(req: NextRequest) {
    try {
        const { orderId } = await req.json();
        const admin = createAdminClient();

        if (!orderId) {
            return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
        }

        const { data: order, error: orderError } = await admin
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .single();

        if (orderError || !order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // 2. Only cancel if pending or failed
        if (order.status === "confirmed" || order.status === "shipped" || order.status === "delivered") {
            return NextResponse.json({ message: "Order cannot be cancelled at this stage" }, { status: 400 });
        }

        if (order.status === "cancelled") {
            return NextResponse.json({ message: "Already cancelled" });
        }

        // 3. Get order items to restore stock
        const { data: items, error: itemsError } = await admin
            .from("order_items")
            .select("product_id, quantity")
            .eq("order_id", orderId);

        if (itemsError) {
            console.error("Error fetching order items:", itemsError);
        } else if (items && items.length > 0) {
            // RESTORE STOCK 🔥
            const { error: rpcError } = await admin.rpc("restore_product_stock", {
                items: items.map(i => ({
                    product_id: i.product_id,
                    quantity: i.quantity
                }))
            });
            
            if (rpcError) {
                console.error("Error restoring stock via RPC:", rpcError);
            }
        }

        // 4. Update order status
        const { error: updateOrderError } = await admin
            .from("orders")
            .update({
                status: "cancelled",
                updated_at: new Date().toISOString(),
            })
            .eq("id", orderId);

        if (updateOrderError) {
            return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
        }

        // 5. Update payment status
        await admin
            .from("payments")
            .update({
                status: "cancelled",
                updated_at: new Date().toISOString(),
            })
            .eq("order_id", orderId);

        return NextResponse.json({ success: true, message: "Order cancelled and stock restored" });
    } catch (error: any) {
        console.error("Cancellation error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
