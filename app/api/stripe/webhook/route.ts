export const config = { runtime: "nodejs" };
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/utils/stripe/server";
import { createAdminClient } from "@/utils/supabase/admin";
import Stripe from "stripe";

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
            let orderId = session.metadata?.order_id || null;
            let order: { id: string; status: string; stock_reduced: boolean | null } | null = null;

            // Fallback: derive order by Stripe session id when metadata is missing.
            if (!orderId && session.id) {
                const { data: orderBySession, error: orderBySessionError } = await admin
                    .from("orders")
                    .select("id, status, stock_reduced")
                    .eq("stripe_session_id", session.id)
                    .maybeSingle();

                if (orderBySessionError) {
                    console.error("Failed to resolve order by stripe_session_id:", orderBySessionError);
                }

                if (orderBySession) {
                    orderId = orderBySession.id;
                    order = orderBySession;
                }
            }

            if (!orderId) {
                console.error("No orderId found for expired session", { sessionId: session.id });
                break;
            }

            if (!order) {
                const { data: fetchedOrder, error: fetchError } = await admin
                    .from("orders")
                    .select("id, status, stock_reduced")
                    .eq("id", orderId)
                    .maybeSingle();

                if (fetchError || !fetchedOrder) {
                    console.error(`Failed to fetch order ${orderId} for cancellation:`, fetchError);
                    break;
                }

                order = fetchedOrder;
            }

            // Only cancel order if it's still unpaid workflow state.
            const canAutoCancelOrder = order.status === "pending" || order.status === "failed";
            if (canAutoCancelOrder) {
                console.log(`Session expired -> Cancelling order ${orderId} in status '${order.status}'.`);
            } else {
                console.log(`Order ${orderId} is in status '${order.status}', skipping order status change.`);
            }

            // 2. Restore stock if it was previously reduced
            if (canAutoCancelOrder && order.stock_reduced) {
                const { data: items, error: itemsError } = await admin
                    .from("order_items")
                    .select("product_id, quantity")
                    .eq("order_id", orderId);

                if (!itemsError && items?.length) {
                    const { error: rpcError } = await admin.rpc("restore_product_stock", {
                        items: items.map(i => ({
                            product_id: i.product_id,
                            quantity: i.quantity
                        }))
                    });

                    if (rpcError) {
                        console.error(`Failed to restore stock for order ${orderId}:`, rpcError);
                    } else {
                        console.log(`Successfully restored stock for expired order ${orderId}`);
                    }
                }
            }

            // 3. Mark order as cancelled when eligible
            let orderUpdateError: { message?: string } | null = null;
            if (canAutoCancelOrder) {
                const orderUpdate = await admin
                    .from("orders")
                    .update({
                        status: "cancelled",
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", orderId);
                orderUpdateError = orderUpdate.error;
            }

            // 4. Always sync pending-like payment rows on expired session.
            const { error: paymentUpdateError } = await admin
                .from("payments")
                .update({
                    status: "cancelled",
                    updated_at: new Date().toISOString(),
                })
                .eq("order_id", orderId)
                .in("status", ["pending", "processing", "failed"]);

            if (orderUpdateError || paymentUpdateError) {
                console.error(`Update failed for expired order ${orderId}:`, {
                    order: orderUpdateError?.message,
                    payment: paymentUpdateError?.message
                });
            } else {
                console.log(`Successfully synchronized expired order/payment state for order ${orderId}.`);
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
