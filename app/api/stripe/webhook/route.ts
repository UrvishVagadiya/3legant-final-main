export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/utils/stripe/server";
import { createAdminClient } from "@/utils/supabase/admin";
import Stripe from "stripe";
import { cancelExpiredStripeOrders } from "@/utils/stripe/cancelExpiredOrders";

type PaymentStatus = "pending" | "processing" | "completed" | "cancelled" | "failed";

type ResolveOrderInput = {
    orderId?: string | null;
    stripeSessionId?: string | null;
    paymentIntentId?: string | null;
};

async function resolveOrderId(
    admin: ReturnType<typeof createAdminClient>,
    input: ResolveOrderInput,
): Promise<string | null> {
    if (input.orderId) return input.orderId;

    if (input.stripeSessionId) {
        const { data: orderBySession } = await admin
            .from("orders")
            .select("id")
            .eq("stripe_session_id", input.stripeSessionId)
            .maybeSingle();

        if (orderBySession?.id) return orderBySession.id;
    }

    if (input.paymentIntentId) {
        const { data: paymentByIntent } = await admin
            .from("payments")
            .select("order_id")
            .eq("transaction_id", input.paymentIntentId)
            .maybeSingle();

        if (paymentByIntent?.order_id) return paymentByIntent.order_id;
    }

    return null;
}

async function updatePaymentStatus(
    admin: ReturnType<typeof createAdminClient>,
    params: {
        orderId?: string | null;
        paymentIntentId?: string | null;
        status: PaymentStatus;
    },
) {
    const nowIso = new Date().toISOString();

    if (params.paymentIntentId) {
        const { data: paymentByIntent, error: intentUpdateError } = await admin
            .from("payments")
            .update({
                status: params.status,
                ...(params.status === "completed" ? { payment_date: nowIso } : {}),
                updated_at: nowIso,
            })
            .eq("transaction_id", params.paymentIntentId)
            .select("id")
            .maybeSingle();

        if (intentUpdateError) {
            console.error("Failed to update payment by transaction_id:", intentUpdateError);
        }

        if (paymentByIntent?.id) {
            return;
        }
    }

    if (params.orderId) {
        const { error: orderUpdateError } = await admin
            .from("payments")
            .update({
                status: params.status,
                ...(params.paymentIntentId ? { transaction_id: params.paymentIntentId } : {}),
                ...(params.status === "completed" ? { payment_date: nowIso } : {}),
                updated_at: nowIso,
            })
            .eq("order_id", params.orderId)
            .in("status", ["pending", "processing", "failed", "completed", "cancelled"]);

        if (orderUpdateError) {
            console.error("Failed to update payment by order_id:", orderUpdateError);
        }
    }
}

async function syncOrderStatusFromPayment(
    admin: ReturnType<typeof createAdminClient>,
    orderId: string,
    paymentStatus: PaymentStatus,
) {
    const nowIso = new Date().toISOString();

    if (paymentStatus === "completed") {
        const { error } = await admin
            .from("orders")
            .update({
                status: "confirmed",
                updated_at: nowIso,
            })
            .eq("id", orderId)
            .in("status", ["pending", "failed"]);

        if (error) {
            console.error(`Failed to mark order ${orderId} as confirmed:`, error);
        }

        return;
    }

    if (paymentStatus === "cancelled") {
        const { error } = await admin
            .from("orders")
            .update({
                status: "cancelled",
                updated_at: nowIso,
            })
            .eq("id", orderId)
            .in("status", ["pending", "processing", "failed"]);

        if (error) {
            console.error(`Failed to mark order ${orderId} as cancelled:`, error);
        }
    }
}

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

            const paymentIntentId =
                typeof session.payment_intent === "string"
                    ? session.payment_intent
                    : session.payment_intent?.id || null;

            const orderId = await resolveOrderId(admin, {
                orderId: session.metadata?.order_id || session.client_reference_id || null,
                stripeSessionId: session.id,
                paymentIntentId,
            });

            const nextStatus: PaymentStatus =
                session.payment_status === "paid" ||
                    session.payment_status === "no_payment_required"
                    ? "completed"
                    : "pending";

            await updatePaymentStatus(admin, {
                orderId,
                paymentIntentId,
                status: nextStatus,
            });

            if (orderId) {
                await syncOrderStatusFromPayment(admin, orderId, nextStatus);
            } else {
                // Final fallback: try direct lookup by stripe session id.
                const { data: orderBySession } = await admin
                    .from("orders")
                    .select("id")
                    .eq("stripe_session_id", session.id)
                    .maybeSingle();

                if (orderBySession?.id) {
                    await updatePaymentStatus(admin, {
                        orderId: orderBySession.id,
                        paymentIntentId,
                        status: nextStatus,
                    });
                    await syncOrderStatusFromPayment(admin, orderBySession.id, nextStatus);
                }

                console.error("Unable to resolve order id for checkout.session.completed", {
                    sessionId: session.id,
                    paymentIntentId,
                });
            }

            console.log(`checkout.session.completed synced for session ${session.id} with payment status '${nextStatus}'`);
            break;
        }

        case "checkout.session.async_payment_succeeded": {
            const session = event.data.object as Stripe.Checkout.Session;
            const paymentIntentId =
                typeof session.payment_intent === "string"
                    ? session.payment_intent
                    : session.payment_intent?.id || null;

            const orderId = await resolveOrderId(admin, {
                orderId: session.metadata?.order_id || session.client_reference_id || null,
                stripeSessionId: session.id,
                paymentIntentId,
            });

            await updatePaymentStatus(admin, {
                orderId,
                paymentIntentId,
                status: "completed",
            });

            if (orderId) {
                await syncOrderStatusFromPayment(admin, orderId, "completed");
            }
            break;
        }

        case "checkout.session.async_payment_failed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const paymentIntentId =
                typeof session.payment_intent === "string"
                    ? session.payment_intent
                    : session.payment_intent?.id || null;

            const orderId = await resolveOrderId(admin, {
                orderId: session.metadata?.order_id || session.client_reference_id || null,
                stripeSessionId: session.id,
                paymentIntentId,
            });

            await updatePaymentStatus(admin, {
                orderId,
                paymentIntentId,
                status: "cancelled",
            });

            if (orderId) {
                await syncOrderStatusFromPayment(admin, orderId, "cancelled");
            }
            break;
        }

        case "payment_intent.processing": {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            const orderId = await resolveOrderId(admin, {
                orderId: paymentIntent.metadata?.order_id || null,
                paymentIntentId: paymentIntent.id,
            });

            await updatePaymentStatus(admin, {
                orderId,
                paymentIntentId: paymentIntent.id,
                status: "pending",
            });
            break;
        }

        case "payment_intent.succeeded": {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            const orderId = await resolveOrderId(admin, {
                orderId: paymentIntent.metadata?.order_id || null,
                paymentIntentId: paymentIntent.id,
            });

            await updatePaymentStatus(admin, {
                orderId,
                paymentIntentId: paymentIntent.id,
                status: "completed",
            });

            if (orderId) {
                await syncOrderStatusFromPayment(admin, orderId, "completed");
            }
            break;
        }

        case "payment_intent.payment_failed": {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            const orderId = await resolveOrderId(admin, {
                orderId: paymentIntent.metadata?.order_id || null,
                paymentIntentId: paymentIntent.id,
            });

            await updatePaymentStatus(admin, {
                orderId,
                paymentIntentId: paymentIntent.id,
                status: "failed",
            });

            if (orderId) {
                await syncOrderStatusFromPayment(admin, orderId, "cancelled");
            }

            console.error(
                "Payment failed:",
                paymentIntent.id,
                paymentIntent.last_payment_error?.message,
            );
            break;
        }

        case "payment_intent.canceled": {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            const orderId = await resolveOrderId(admin, {
                orderId: paymentIntent.metadata?.order_id || null,
                paymentIntentId: paymentIntent.id,
            });

            await updatePaymentStatus(admin, {
                orderId,
                paymentIntentId: paymentIntent.id,
                status: "cancelled",
            });

            if (orderId) {
                await syncOrderStatusFromPayment(admin, orderId, "cancelled");
            }
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

        case "checkout.session.expired": {
            const session = event.data.object as Stripe.Checkout.Session;
            const orderId = session.metadata?.order_id || session.client_reference_id || null;

            const paymentIntentId =
                typeof session.payment_intent === "string"
                    ? session.payment_intent
                    : session.payment_intent?.id || null;

            const resolvedOrderId = await resolveOrderId(admin, {
                orderId,
                stripeSessionId: session.id,
                paymentIntentId,
            });

            const result = await cancelExpiredStripeOrders(
                resolvedOrderId
                    ? { orderId: resolvedOrderId, stripeSessionId: session.id, force: true }
                    : { stripeSessionId: session.id, force: true },
            );

            if (result.errors.length > 0) {
                console.error("Failed to synchronize expired order/payment state:", result);
            } else {
                console.log("Successfully synchronized expired order/payment state:", result.cancelledOrderIds);
            }

            // If cleanup skipped because of lookup mismatch, still try direct status update by resolved order.
            if (resolvedOrderId && result.cancelledOrderIds.length === 0) {
                await updatePaymentStatus(admin, {
                    orderId: resolvedOrderId,
                    paymentIntentId,
                    status: "cancelled",
                });
                await syncOrderStatusFromPayment(admin, resolvedOrderId, "cancelled");
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
