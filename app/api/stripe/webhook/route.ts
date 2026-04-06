export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/utils/stripe/server";
import { createAdminClient } from "@/utils/supabase/admin";
import Stripe from "stripe";
import { cancelExpiredStripeOrders } from "@/utils/stripe/cancelExpiredOrders";

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
        return NextResponse.json(
            { error: "Missing stripe-signature header" },
            { status: 400 }
        );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error("Missing STRIPE_WEBHOOK_SECRET");
        return NextResponse.json(
            { error: "Webhook secret not configured" },
            { status: 500 }
        );
    }

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("Webhook signature verification failed:", message);
        return NextResponse.json(
            { error: `Webhook Error: ${message}` },
            { status: 400 }
        );
    }

    const admin = createAdminClient();

    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;

            if (session.payment_status !== "paid") break;

            const meta = session.metadata || {};
            const orderIdFromMeta = meta.order_id;

            if (!orderIdFromMeta) {
                console.error("No order_id in session metadata");
                break;
            }

            // The main action: Update the payment status to 'completed'
            // This will fire the 'on_payment_completed' database trigger in Supabase
            const { error: paymentError } = await admin
                .from("payments")
                .update({
                    status: "completed",
                    transaction_id: session.payment_intent as string,
                    payment_date: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq("order_id", orderIdFromMeta);

            if (paymentError) {
                console.error("Failed to update payment status in webhook:", paymentError);
                // If update failed, maybe it doesn't exist yet? Fallback to insert if needed
                // But normally checkout/route.ts creates it.
            }

            console.log(`Payment confirmed via webhook for Order: ${orderIdFromMeta}. Database triggers will handle status ripple.`);
            break;
        }


        case "charge.refunded": {
            const charge = event.data.object as Stripe.Charge;
            const paymentIntentId =
                typeof charge.payment_intent === "string"
                    ? charge.payment_intent
                    : charge.payment_intent?.id;

            if (!paymentIntentId) break;

            // Find payment by transaction_id
            const { data: payment } = await admin
                .from("payments")
                .select("id, order_id, amount")
                .eq("transaction_id", paymentIntentId)
                .single();

            if (!payment) {
                console.error("Payment not found for refund:", paymentIntentId);
                break;
            }

            const refundedAmount = charge.amount_refunded / 100;
            const isFullRefund = refundedAmount >= Number(payment.amount);

            // Update payment record
            await admin
                .from("payments")
                .update({
                    status: isFullRefund ? "refunded" : "completed",
                    refund_amount: refundedAmount,
                    refund_date: new Date().toISOString(),
                    refund_reason:
                        charge.refunds?.data?.[0]?.reason || "Refund processed via Stripe",
                    updated_at: new Date().toISOString(),
                })
                .eq("id", payment.id);

            // Update order status if fully refunded
            if (isFullRefund) {
                await admin
                    .from("orders")
                    .update({
                        status: "refunded",
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", payment.order_id);
            }

            console.log(
                `Refund of $${refundedAmount} processed for payment ${payment.id}`
            );
            break;
        }

        case "payment_intent.payment_failed": {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            console.error(
                "Payment failed:",
                paymentIntent.id,
                paymentIntent.last_payment_error?.message
            );
            break;
        }
        case "checkout.session.expired": {
            const session = event.data.object as Stripe.Checkout.Session;
            const orderId = session.metadata?.order_id || session.client_reference_id || session.id;
            const result = await cancelExpiredStripeOrders({
                orderId,
                stripeSessionId: session.id,
                force: true,
            });

            if (result.errors.length > 0) {
                console.error("Failed to synchronize expired order/payment state:", result);
            } else {
                console.log("Successfully synchronized expired order/payment state:", result.cancelledOrderIds);
            }
            break;
        }

        case "customer.subscription.deleted": {
            const subscription = event.data.object as Stripe.Subscription;

            const subscriptionId = subscription.id;

            const { data: subRecord, error: subError } = await admin
                .from("subscriptions")
                .select("id, user_id, status")
                .eq("stripe_subscription_id", subscriptionId)
                .single();

            if (subError || !subRecord) {
                console.error("Subscription not found:", subscriptionId);
                break;
            }

            const { error: updateError } = await admin
                .from("subscriptions")
                .update({
                    status: "cancelled",
                    cancelled_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq("id", subRecord.id);

            if (updateError) {
                console.error("Failed to update subscription:", updateError);
                break;
            }

            console.log(`Subscription cancelled: ${subscriptionId}`);

            break;
        }
        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
