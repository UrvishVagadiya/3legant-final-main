import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/utils/stripe/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient(cookies());
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { paymentId, amount, reason } = body;

        if (!paymentId) {
            return NextResponse.json(
                { error: "Payment ID is required" },
                { status: 400 }
            );
        }

        const admin = createAdminClient();

        // Get payment record
        const { data: payment, error: paymentFetchError } = await admin
            .from("payments")
            .select("*, orders(id, total, status)")
            .eq("id", paymentId)
            .single();

        if (paymentFetchError || !payment) {
            return NextResponse.json(
                { error: "Payment not found" },
                { status: 404 }
            );
        }

        if (!payment.transaction_id) {
            return NextResponse.json(
                { error: "No Stripe transaction found for this payment" },
                { status: 400 }
            );
        }

        if (payment.status === "refunded") {
            return NextResponse.json(
                { error: "Payment has already been fully refunded" },
                { status: 400 }
            );
        }

        const refundAmount = amount
            ? Math.min(Number(amount), Number(payment.amount) - Number(payment.refund_amount || 0))
            : Number(payment.amount) - Number(payment.refund_amount || 0);

        if (refundAmount <= 0) {
            return NextResponse.json(
                { error: "Invalid refund amount" },
                { status: 400 }
            );
        }

        // Process refund via Stripe
        const refund = await stripe.refunds.create({
            payment_intent: payment.transaction_id,
            amount: Math.round(refundAmount * 100),
            reason: reason === "duplicate" ? "duplicate" : reason === "fraudulent" ? "fraudulent" : "requested_by_customer",
        });

        const totalRefunded =
            Number(payment.refund_amount || 0) + refundAmount;
        const isFullRefund = totalRefunded >= Number(payment.amount);

        // Update payment record
        const { error: updatePaymentError } = await admin
            .from("payments")
            .update({
                status: isFullRefund ? "refunded" : "completed",
                refund_amount: totalRefunded,
                refund_date: new Date().toISOString(),
                refund_reason: reason || "Requested by customer",
                updated_at: new Date().toISOString(),
            })
            .eq("id", paymentId);

        if (updatePaymentError) {
            console.error("Failed to update payment:", updatePaymentError);
        }

        // Update order status if full refund
        if (isFullRefund && payment.orders) {
            const orderId = Array.isArray(payment.orders)
                ? payment.orders[0]?.id
                : payment.orders.id;

            if (orderId) {
                await admin
                    .from("orders")
                    .update({
                        status: "refunded",
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", orderId);
            }
        }

        return NextResponse.json({
            success: true,
            refundId: refund.id,
            refundAmount,
            totalRefunded,
            status: isFullRefund ? "refunded" : "partial_refund",
        });
    } catch (error: unknown) {
        console.error("Refund error:", error);
        const message =
            error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
