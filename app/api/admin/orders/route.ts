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

    try {
        await admin.rpc("cancel_expired_orders");
    } catch (e) {
        console.error("Failed to auto-cleanup expired orders:", e);
    }

    const { data, error } = await admin
        .from("orders")
        .select("*, payments(status)")
        .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const ordersWithPaymentStatus = (data || []).map((order: any) => {
        const payments = Array.isArray(order.payments) ? order.payments : (order.payments ? [order.payments] : []);
        const successfulPayment = payments.find((p: any) => p.status === 'completed' || p.status === 'succeeded');

        return {
            ...order,
            payment_status: successfulPayment?.status || payments[0]?.status || (order.status === 'cancelled' ? 'cancelled' : "pending"),
            refund_status: order.refund_status || 'none'
        };
    });

    return NextResponse.json(ordersWithPaymentStatus);
}

export async function PUT(req: NextRequest) {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, ...payload } = body;
    const admin = createAdminClient();

    // Check current state before update to see if stock reduction is needed
    const { data: currentOrder } = await admin
        .from("orders")
        .select("status, stock_reduced")
        .eq("id", id)
        .single();

    const confirmedStatuses = ["confirmed", "processing", "shipped", "delivered"];
    const isNewStatusConfirmed = payload.status && confirmedStatuses.includes(payload.status.toLowerCase());
    const shouldReduceStock = isNewStatusConfirmed && currentOrder && !currentOrder.stock_reduced;

    // Add delivered_at if status changed to delivered
    if (payload.status === "delivered") {
        payload.delivered_at = new Date().toISOString();
    }

    const { data, error } = await admin
        .from("orders")
        .update(payload)
        .eq("id", id)
        .select("*, payments(status)")
        .single();

    if (!error && data && shouldReduceStock) {
        // Fetch order items to reduce stock
        const { data: items } = await admin
            .from("order_items")
            .select("product_id, quantity")
            .eq("order_id", id);

        if (items && items.length > 0) {
            const { error: stockError } = await admin.rpc("reduce_product_stock", {
                items: items.map(i => ({
                    product_id: i.product_id,
                    quantity: i.quantity
                }))
            });

            if (!stockError) {
                await admin.from("orders").update({ stock_reduced: true }).eq("id", id);
                // Refresh data with updated stock_reduced flag
                const { data: updatedData } = await admin
                    .from("orders")
                    .select("*, payments(status)")
                    .eq("id", id)
                    .single();
                if (updatedData) {
                    const payments = Array.isArray(updatedData.payments) ? updatedData.payments : (updatedData.payments ? [updatedData.payments] : []);
                    const successfulPayment = payments.find((p: any) => p.status === 'completed' || p.status === 'succeeded');

                    return NextResponse.json({
                        ...updatedData,
                        payment_status: successfulPayment?.status || payments[0]?.status || (updatedData.status === 'cancelled' ? 'cancelled' : "pending"),
                        refund_status: updatedData.refund_status || 'none'
                    });
                }
            } else {
                console.error("Manual stock reduction error:", stockError);
            }
        }
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const payments = Array.isArray(data.payments) ? data.payments : (data.payments ? [data.payments] : []);
    const successfulPayment = payments.find((p: any) => p.status === 'completed' || p.status === 'succeeded');

    const orderWithPaymentStatus = {
        ...data,
        payment_status: successfulPayment?.status || payments[0]?.status || (data.status === 'cancelled' ? 'cancelled' : "pending"),
        refund_status: data.refund_status || 'none'
    };

    return NextResponse.json(orderWithPaymentStatus);
}

export async function DELETE(req: NextRequest) {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const admin = createAdminClient();
    const { error } = await admin.from("orders").delete().eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
