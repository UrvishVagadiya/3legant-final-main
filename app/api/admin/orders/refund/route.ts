import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/utils/stripe/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient(cookies());
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data: profile } = await supabase
            .from("user_profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profile?.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { orderId, action } = await req.json(); 

        if (!orderId || !action) {
            return NextResponse.json({ error: "Order ID and action are required" }, { status: 400 });
        }

        const admin = createAdminClient();

        const { data: order, error: orderError } = await admin
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .single();

        if (orderError || !order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        if (order.refund_status !== "requested") {
            return NextResponse.json({ error: "Order has no pending refund request" }, { status: 400 });
        }

        if (action === "reject") {
            const { error: rejectError } = await admin
                .from("orders")
                .update({ refund_status: "rejected", updated_at: new Date().toISOString() })
                .eq("id", orderId);

            if (rejectError) throw rejectError;
            return NextResponse.json({ success: true, message: "Refund request rejected" });
        }

        const { data: payment, error: paymentError } = await admin
            .from("payments")
            .select("id, transaction_id, status, amount")
            .eq("order_id", orderId)
            .not("transaction_id", "is", null)
            .order("updated_at", { ascending: false })
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (paymentError) {
            console.error("Failed to fetch payment for refund:", paymentError);
            return NextResponse.json({ error: "Failed to load payment for this order" }, { status: 500 });
        }

        if (!payment || !payment.transaction_id) {
            return NextResponse.json({ error: "Payment transaction not found for this order" }, { status: 400 });
        }

        if (payment.status === "refunded") {
            return NextResponse.json({ error: "Payment already refunded" }, { status: 400 });
        }

        try {
            const refund = await stripe.refunds.create({
                payment_intent: payment.transaction_id,
                reason: 'requested_by_customer',
                metadata: {
                    order_id: orderId,
                    order_code: order.order_code
                }
            });

            console.log(`Stripe refund successful: ${refund.id}`);
        } catch (stripeError: any) {
            console.error("Stripe refund failed:", stripeError);
            return NextResponse.json({ error: `Stripe refund failed: ${stripeError.message}` }, { status: 500 });
        }
        const now = new Date().toISOString();

        const { error: finalUpdateError } = await admin.rpc('process_order_refund', {
            p_order_id: orderId,
            p_payment_id: payment.id,
            p_refund_reason: order.refund_request_reason || "Admin Approved Refund"
        });

        if (finalUpdateError) {
            console.warn("RPC 'process_order_refund' failed or missing, falling back to manual updates");

            await admin.from("orders").update({
                status: "cancelled",
                refund_status: "approved",
                updated_at: now
            }).eq("id", orderId);

            await admin.from("payments").update({
                status: "refunded",
                refund_amount: payment.amount,
                refund_date: now,
                refund_reason: order.refund_request_reason || "Admin Approved Refund",
                updated_at: now
            }).eq("id", payment.id);
        }

        return NextResponse.json({ success: true, message: "Refund processed successfully" });

    } catch (error: any) {
        console.error("Admin refund error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
