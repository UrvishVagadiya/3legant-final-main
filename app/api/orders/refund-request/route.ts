import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient(cookies());
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { orderId, reason } = await req.json();

        if (!orderId || !reason) {
            return NextResponse.json({ error: "Order ID and reason are required" }, { status: 400 });
        }

        // Verify order belongs to user and is eligible for refund
        const { data: order, error: fetchError } = await supabase
            .from("orders")
            .select("id, status, refund_status, delivered_at")
            .eq("id", orderId)
            .eq("user_id", user.id)
            .single();

        if (fetchError || !order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Check refund period for delivered orders
        if (order.status === "delivered" && order.delivered_at) {
            const { data: settings } = await supabase
                .from("store_settings")
                .select("value")
                .eq("id", "refund_period")
                .single();

            const refundDays = settings?.value?.days || 7;
            const deliveredDate = new Date(order.delivered_at);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - deliveredDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > refundDays) {
                return NextResponse.json({
                    error: `Refund period has expired. Refunds are only allowed within ${refundDays} days of delivery.`
                }, { status: 400 });
            }
        }

        if (order.refund_status !== "none") {
            return NextResponse.json({ error: "Refund already requested for this order" }, { status: 400 });
        }

        // Only allow refund requests for shipped/delivered/cancelled orders
        const eligibleStatuses = ["shipped", "delivered", "cancelled"];
        if (!eligibleStatuses.includes(order.status)) {
            return NextResponse.json({
                error: `Refund request not allowed for current order status: ${order.status}. Use instant cancel instead.`
            }, { status: 400 });
        }

        const { error: updateError } = await supabase
            .from("orders")
            .update({
                refund_status: "requested",
                refund_request_reason: reason,
                refund_requested_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq("id", orderId);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Refund request error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
