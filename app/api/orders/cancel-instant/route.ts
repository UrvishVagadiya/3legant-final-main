import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { stripe } from "@/utils/stripe/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient(cookies());
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { orderId, reason } = await req.json();

        if (!orderId) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
        }

        const admin = createAdminClient();

        // 1. Fetch order and payment info
        const { data: order, error: orderError } = await admin
            .from("orders")
            .select("*, payments(*)")
            .eq("id", orderId)
            .eq("user_id", user.id)
            .single();

        if (orderError || !order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // 2. Validate status for instant cancel
        const instantStatuses = ["pending", "confirmed", "processing"];
        if (!instantStatuses.includes(order.status)) {
            return NextResponse.json({
                error: `This order is in '${order.status}' status and cannot be instantly cancelled. Please request a refund instead.`
            }, { status: 400 });
        }

        if (order.refund_status !== "none") {
            return NextResponse.json({ error: "Order already has a refund/cancellation request" }, { status: 400 });
        }

        const payment = order.payments?.[0];
        let refundProcessed = false;

        // 3. Process Stripe refund if paid
        if (payment && payment.status === "completed" && payment.transaction_id) {
            try {
                await stripe.refunds.create({
                    payment_intent: payment.transaction_id,
                    reason: 'requested_by_customer',
                    metadata: {
                        order_id: orderId,
                        reason: reason || "User cancelled order"
                    }
                });
                refundProcessed = true;
            } catch (stripeError: unknown) {
                console.error("Stripe refund error:", stripeError);
                return NextResponse.json({
                    error: "Failed to process automatic refund via Stripe. Please contact support or try again later."
                }, { status: 500 });
            }
        }

        // 4. Update Supabase records
        const now = new Date().toISOString();

        // Update Order
        const { error: updateOrderError } = await admin
            .from("orders")
            .update({
                status: "cancelled",
                refund_status: "approved",
                refund_request_reason: reason || "Instant Cancellation",
                refund_requested_at: now,
                updated_at: now
            })
            .eq("id", orderId);

        if (updateOrderError) throw updateOrderError;

        // Update Payment
        if (payment) {
            await admin
                .from("payments")
                .update({
                    status: refundProcessed ? "refunded" : "failed",
                    refund_amount: refundProcessed ? payment.amount : 0,
                    refund_date: refundProcessed ? now : null,
                    refund_reason: reason || "Instant Cancellation"
                })
                .eq("id", payment.id);
        }

        return NextResponse.json({
            success: true,
            message: refundProcessed ? "Order cancelled and refund processed successfully." : "Order cancelled successfully."
        });

    } catch (error: unknown) {
        console.error("Instant cancel error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
