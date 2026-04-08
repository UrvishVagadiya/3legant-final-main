/**
 * stripe-webhook
 * ──────────────
 * Handles all Stripe events and keeps your Supabase DB in sync.
 *
 * Events handled:
 *  • checkout.session.completed        → payment succeeded
 *  • checkout.session.expired          → session timed-out
 *  • payment_intent.payment_failed     → payment failed
 *  • charge.refunded                   → full / partial refund issued from Stripe dashboard
 *  • charge.refund.updated             → refund status change (e.g. pending → succeeded)
 */

import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Clients ────────────────────────────────────────────────────────────────
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-04-10",
});

// Use service-role key so RLS is bypassed (webhook has no user JWT)
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// ── Entry point ─────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return respond(400, { error: "Missing stripe-signature header" });
  }

  // ── Verify webhook signature ─────────────────────────────────────────────
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );
  } catch (err: any) {
    console.error("[webhook] Signature verification failed:", err.message);
    return respond(400, { error: `Webhook signature error: ${err.message}` });
  }

  console.log(`[webhook] Received event: ${event.type} (${event.id})`);

  // ── Route events ─────────────────────────────────────────────────────────
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        const paymentIntentId =
          typeof session.payment_intent === "string" ? session.payment_intent : null;
        if (paymentIntentId) {
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
          await handlePaymentSucceeded(paymentIntent);
        }
        break;
      }

      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const paymentIntentId =
          typeof session.payment_intent === "string" ? session.payment_intent : null;
        if (paymentIntentId) {
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
          await handlePaymentFailed(paymentIntent);
        }
        break;
      }

      case "checkout.session.expired":
        await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session);
        break;

      case "payment_intent.processing":
        await handlePaymentProcessing(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.canceled":
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      case "charge.refund.updated":
        await handleRefundUpdated(event.data.object as Stripe.Refund);
        break;

      default:
        console.log(`[webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err: any) {
    console.error(`[webhook] Handler error for ${event.type}:`, err.message);
    // Return 500 so Stripe retries transient failures automatically.
    return respond(500, { received: false, error: err.message });
  }

  return respond(200, { received: true });
});

// ═══════════════════════════════════════════════════════════════════════════
// EVENT HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * checkout.session.completed
 * Payment succeeded — call the DB function that atomically:
 *   1. Sets order status → "confirmed"
 *   2. Creates/updates the payments row
 *   3. Decrements product stock
 *   4. Marks coupon as used (if any)
 *   5. Clears the user's cart
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const meta = session.metadata ?? {};
  let order_id = meta.order_id ?? session.client_reference_id;

  if (!order_id && session.id) {
    const { data: orderBySession } = await supabase
      .from("orders")
      .select("id")
      .eq("stripe_session_id", session.id)
      .maybeSingle();
    order_id = orderBySession?.id ?? null;
  }

  if (!order_id) {
    throw new Error("checkout.session.completed: missing order_id in metadata");
  }

  // Retrieve payment intent to get card details
  let paymentIntent: Stripe.PaymentIntent | null = null;
  let charge: Stripe.Charge | null = null;

  if (session.payment_intent) {
    paymentIntent = await stripe.paymentIntents.retrieve(
      session.payment_intent as string,
      { expand: ["latest_charge"] }
    );
    charge = paymentIntent.latest_charge as Stripe.Charge | null;
  }

  const cardBrand = charge?.payment_method_details?.card?.brand ?? null;
  const cardLast4 = charge?.payment_method_details?.card?.last4 ?? null;
  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : null;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, user_id, status, stock_reduced, coupon_code")
    .eq("id", order_id)
    .maybeSingle();

  if (orderError || !order) {
    throw new Error(`Order lookup failed for ${order_id}`);
  }

  const amount = (session.amount_total ?? 0) / 100;
  await upsertCompletedPayment({
    orderId: order_id,
    userId: order.user_id,
    amount,
    paymentIntentId: paymentIntentId ?? session.id,
    cardBrand,
    cardLast4,
  });

  const items = await getOrderItems(order_id);
  const wasPending = order.status === "pending";

  const { error: updateOrderError } = await supabase
    .from("orders")
    .update({ status: "confirmed", updated_at: new Date().toISOString() })
    .eq("id", order_id);

  if (updateOrderError) {
    throw new Error(`Failed to mark order confirmed: ${updateOrderError.message}`);
  }

  if (!order.stock_reduced && items.length) {
    await reduceStockForItems(items);
    await supabase
      .from("orders")
      .update({ stock_reduced: true, updated_at: new Date().toISOString() })
      .eq("id", order_id);
  }

  if (wasPending) {
    await incrementCouponUsage(meta.coupon_id || null, meta.coupon_code || order.coupon_code || null);
  }

  // Clear cart by authoritative order user id to avoid metadata mismatch.
  await supabase.from("cart").delete().eq("user_id", order.user_id);

  console.log(`[webhook] ✅ Order ${order_id} confirmed.`);
}

/**
 * checkout.session.expired
 * User let the 30-min window lapse without paying.
 * Marks order "cancelled" and restores stock if it was already reduced.
 */
async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const meta = session.metadata ?? {};
  const order_id = meta.order_id ?? session.client_reference_id;
  if (!order_id) return;

  // Fetch current order state
  const { data: order } = await supabase
    .from("orders")
    .select("id, status, stock_reduced, total, user_id")
    .eq("id", order_id)
    .single();

  if (!order || order.status === "cancelled") return;

  await supabase
    .from("orders")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", order_id);

  // Restore stock only if it was pre-decremented
  if (order.stock_reduced) {
    const items = await getOrderItems(order_id);
    if (items.length) {
      await restoreStockForItems(items);
      await supabase
        .from("orders")
        .update({ stock_reduced: false, updated_at: new Date().toISOString() })
        .eq("id", order_id);
    }
  }

  // Mark payment as cancelled, creating it if it doesn't exist yet.
  await upsertPaymentStatus({
    orderId: order_id,
    paymentIntentId:
      typeof session.payment_intent === "string" ? session.payment_intent : null,
    status: "cancelled",
    amount: Number(order.total ?? 0),
    userId: order.user_id ?? null,
  });

  console.log(`[webhook] ❌ Order ${order_id} expired and cancelled.`);
}

/**
 * payment_intent.payment_failed
 * Stripe retries payments automatically; on final failure this fires.
 * We mark payment/order failed with direct table updates.
 */
async function handlePaymentFailed(intent: Stripe.PaymentIntent) {
  const orderId = await resolveOrderIdFromIntent(intent);

  if (!orderId) {
    console.log(`[webhook] payment_intent.payment_failed: unable to resolve order for ${intent.id}`);
    return;
  }

  const now = new Date().toISOString();

  const { data: order } = await supabase
    .from("orders")
    .select("id, stock_reduced, total, user_id")
    .eq("id", orderId)
    .maybeSingle();

  await upsertPaymentStatus({
    orderId,
    paymentIntentId: intent.id,
    status: "failed",
    amount: Number(order?.total ?? 0),
    userId: order?.user_id ?? null,
  });

  await supabase
    .from("orders")
    .update({ status: "cancelled", updated_at: now })
    .eq("id", orderId)
    .in("status", ["pending", "processing"]);

  if (order?.stock_reduced) {
    const { data: items } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .eq("order_id", orderId);
    await restoreStockForItems(items || []);
    await supabase
      .from("orders")
      .update({ stock_reduced: false, updated_at: now })
      .eq("id", orderId);
  }

  console.log(`[webhook] ⚠️  Payment failed for intent ${intent.id}`);
}

async function handlePaymentProcessing(intent: Stripe.PaymentIntent) {
  const orderId = await resolveOrderIdFromIntent(intent);
  if (!orderId) return;

  const { data: order } = await supabase
    .from("orders")
    .select("id, total, user_id")
    .eq("id", orderId)
    .maybeSingle();

  await upsertPaymentStatus({
    orderId,
    paymentIntentId: intent.id,
    status: "processing",
    amount: Number(order?.total ?? 0),
    userId: order?.user_id ?? null,
  });

  await supabase
    .from("orders")
    .update({ status: "processing", updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .in("status", ["pending", "failed"]);
}

async function handlePaymentSucceeded(intent: Stripe.PaymentIntent) {
  const orderId = await resolveOrderIdFromIntent(intent);
  if (!orderId) return;

  const { data: order } = await supabase
    .from("orders")
    .select("id, total, user_id")
    .eq("id", orderId)
    .maybeSingle();

  let cardBrand: string | null = null;
  let cardLast4: string | null = null;

  if (intent.latest_charge) {
    const latestChargeId =
      typeof intent.latest_charge === "string"
        ? intent.latest_charge
        : intent.latest_charge.id;
    const charge = await stripe.charges.retrieve(latestChargeId);
    cardBrand = charge.payment_method_details?.card?.brand ?? null;
    cardLast4 = charge.payment_method_details?.card?.last4 ?? null;
  }

  await upsertPaymentStatus({
    orderId,
    paymentIntentId: intent.id,
    status: "completed",
    amount: Number(order?.total ?? 0),
    userId: order?.user_id ?? null,
    cardBrand,
    cardLast4,
  });

  await supabase
    .from("orders")
    .update({ status: "confirmed", updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .in("status", ["pending", "failed", "processing"]);
}

async function handlePaymentCanceled(intent: Stripe.PaymentIntent) {
  const orderId = await resolveOrderIdFromIntent(intent);
  if (!orderId) return;

  const { data: order } = await supabase
    .from("orders")
    .select("id, stock_reduced, total, user_id")
    .eq("id", orderId)
    .maybeSingle();

  await upsertPaymentStatus({
    orderId,
    paymentIntentId: intent.id,
    status: "cancelled",
    amount: Number(order?.total ?? 0),
    userId: order?.user_id ?? null,
  });

  await supabase
    .from("orders")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .in("status", ["pending", "processing", "failed"]);

  if (order?.stock_reduced) {
    const { data: items } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .eq("order_id", orderId);
    await restoreStockForItems(items || []);
    await supabase
      .from("orders")
      .update({ stock_reduced: false, updated_at: new Date().toISOString() })
      .eq("id", orderId);
  }
}

/**
 * charge.refunded
 * Stripe issued a refund (from dashboard or via API).
 * Updates payments/orders directly.
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId =
    typeof charge.payment_intent === "string" ? charge.payment_intent : null;

  if (!paymentIntentId) return;

  const refundedAmount = (charge.amount_refunded ?? 0) / 100;
  const isFullRefund = charge.refunded === true;

  // Find most recent refund for reason
  const latestRefund = charge.refunds?.data?.[0];
  const refundReason = latestRefund?.reason ?? null;

  const { data: payment } = await supabase
    .from("payments")
    .select("id, order_id")
    .eq("transaction_id", paymentIntentId)
    .maybeSingle();

  const { data: order } = payment?.order_id
    ? await supabase
      .from("orders")
      .select("id, total, user_id")
      .eq("id", payment.order_id)
      .maybeSingle()
    : { data: null };

  if (payment?.id) {
    await supabase
      .from("payments")
      .update({
        status: "refunded",
        refund_amount: refundedAmount,
        refund_reason: refundReason,
        refund_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);
  } else if (payment?.order_id) {
    await upsertPaymentStatus({
      orderId: payment.order_id,
      paymentIntentId,
      status: "refunded",
      amount: Number(order?.total ?? refundedAmount),
      userId: order?.user_id ?? null,
    });
  }

  if (payment?.order_id) {
    await supabase
      .from("orders")
      .update({
        status: isFullRefund ? "refunded" : "confirmed",
        refund_status: isFullRefund ? "full" : "partial",
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.order_id);

    // Restore stock on full refund
    if (isFullRefund) {
      const { data: items } = await supabase
        .from("order_items")
        .select("product_id, quantity")
        .eq("order_id", payment.order_id);

      if (items?.length) {
        await restoreStockForItems(items);
        await supabase
          .from("orders")
          .update({ stock_reduced: false, updated_at: new Date().toISOString() })
          .eq("id", payment.order_id);
      }
    }
  }

  console.log(
    `[webhook] 💸 Refund processed for PI ${paymentIntentId} — $${refundedAmount} (${isFullRefund ? "full" : "partial"})`
  );
}

/**
 * charge.refund.updated
 * Refund status transition — e.g. pending → succeeded or failed.
 */
async function handleRefundUpdated(refund: Stripe.Refund) {
  const paymentIntentId =
    typeof refund.payment_intent === "string" ? refund.payment_intent : null;
  if (!paymentIntentId) return;

  const { data: payment } = await supabase
    .from("payments")
    .select("id, order_id, refund_amount")
    .eq("transaction_id", paymentIntentId)
    .maybeSingle();

  if (!payment) return;

  const { data: order } = await supabase
    .from("orders")
    .select("id, total, user_id")
    .eq("id", payment.order_id)
    .maybeSingle();

  // Map Stripe refund status → our payments.status
  const statusMap: Record<string, string> = {
    succeeded: "refunded",
    failed: "failed",
    pending: "processing",
    canceled: "cancelled",
  };

  const newStatus = statusMap[refund.status ?? ""] ?? "refund_pending";

  await supabase
    .from("payments")
    .update({
      status: newStatus,
      refund_date:
        refund.status === "succeeded" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payment.id);

  if (!payment.id) {
    await upsertPaymentStatus({
      orderId: payment.order_id,
      paymentIntentId,
      status: newStatus === "refund_pending" ? "completed" : "refunded",
      amount: Number(order?.total ?? 0),
      userId: order?.user_id ?? null,
    });
  }

  // If refund failed, revert order to "confirmed"
  if (refund.status === "failed") {
    await supabase
      .from("orders")
      .update({ status: "confirmed", refund_status: "failed", updated_at: new Date().toISOString() })
      .eq("id", payment.order_id);
  }

  console.log(
    `[webhook] 🔄 Refund ${refund.id} updated → ${refund.status}`
  );
}

type BasicItem = { product_id?: string | null; quantity?: number | string | null };

async function getOrderItems(orderId: string): Promise<BasicItem[]> {
  const { data, error } = await supabase
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", orderId);

  if (error) {
    console.error(`[webhook] Failed to load order_items for ${orderId}:`, error.message);
    return [];
  }

  return data || [];
}

async function upsertCompletedPayment(params: {
  orderId: string;
  userId: string | null;
  amount: number;
  paymentIntentId: string | null;
  cardBrand: string | null;
  cardLast4: string | null;
}) {
  const { orderId, userId, amount, paymentIntentId, cardBrand, cardLast4 } = params;
  const now = new Date().toISOString();

  const payload = {
    status: "completed",
    amount,
    payment_method: "card",
    transaction_id: paymentIntentId,
    payment_date: now,
    card_brand: cardBrand,
    card_last_four: cardLast4,
    updated_at: now,
  };

  const { data: existing, error: existingError } = await supabase
    .from("payments")
    .select("id")
    .eq("order_id", orderId)
    .limit(1);

  if (existingError) {
    throw new Error(`Failed to lookup payment: ${existingError.message}`);
  }

  if (existing && existing.length > 0) {
    const { error } = await supabase
      .from("payments")
      .update(payload)
      .eq("order_id", orderId);
    if (error) throw new Error(`Failed to update payment: ${error.message}`);
    return;
  }

  const { error } = await supabase.from("payments").insert({
    order_id: orderId,
    user_id: userId,
    payment_method: "card",
    status: "completed",
    amount,
    currency: "USD",
    transaction_id: paymentIntentId,
    payment_date: now,
    card_brand: cardBrand,
    card_last_four: cardLast4,
  });

  if (error) throw new Error(`Failed to insert payment: ${error.message}`);
}

async function upsertPaymentStatus(params: {
  orderId?: string | null;
  paymentIntentId?: string | null;
  status: "pending" | "processing" | "completed" | "cancelled" | "failed" | "refunded";
  amount?: number;
  userId?: string | null;
  cardBrand?: string | null;
  cardLast4?: string | null;
}) {
  const now = new Date().toISOString();
  const filters: Array<{ key: "transaction_id" | "order_id"; value: string }> = [];

  if (params.paymentIntentId) {
    filters.push({ key: "transaction_id", value: params.paymentIntentId });
  }

  if (params.orderId) {
    filters.push({ key: "order_id", value: params.orderId });
  }

  for (const filter of filters) {
    const { data: existing } = await supabase
      .from("payments")
      .select("id")
      .eq(filter.key, filter.value)
      .maybeSingle();

    if (existing?.id) {
      const { error } = await supabase
        .from("payments")
        .update({
          status: params.status,
          ...(params.paymentIntentId ? { transaction_id: params.paymentIntentId } : {}),
          ...(params.amount !== undefined ? { amount: params.amount } : {}),
          ...(params.cardBrand !== undefined ? { card_brand: params.cardBrand } : {}),
          ...(params.cardLast4 !== undefined ? { card_last_four: params.cardLast4 } : {}),
          ...(params.status === "completed" ? { payment_date: now } : {}),
          updated_at: now,
        })
        .eq("id", existing.id);

      if (error) {
        throw new Error(`Failed to update payment by ${filter.key}: ${error.message}`);
      }

      return;
    }
  }

  if (!params.orderId) return;

  const { error } = await supabase.from("payments").insert({
    order_id: params.orderId,
    user_id: params.userId ?? null,
    payment_method: "card",
    status: params.status,
    amount: params.amount ?? 0,
    currency: "USD",
    transaction_id: params.paymentIntentId ?? null,
    payment_date: params.status === "completed" ? now : null,
    card_brand: params.cardBrand ?? null,
    card_last_four: params.cardLast4 ?? null,
  });

  if (error) {
    throw new Error(`Failed to create payment row: ${error.message}`);
  }
}

async function resolveOrderIdFromIntent(intent: Stripe.PaymentIntent): Promise<string | null> {
  const metaOrderId = intent.metadata?.order_id;
  if (metaOrderId) return metaOrderId;

  const { data: paymentByIntent } = await supabase
    .from("payments")
    .select("order_id")
    .eq("transaction_id", intent.id)
    .maybeSingle();

  if (paymentByIntent?.order_id) {
    return paymentByIntent.order_id;
  }

  return null;
}

async function reduceStockForItems(items: BasicItem[]) {
  for (const item of items) {
    if (!item?.product_id) continue;
    const quantity = Number(item.quantity ?? 0);
    if (!Number.isFinite(quantity) || quantity <= 0) continue;

    const { data: product } = await supabase
      .from("products")
      .select("stock")
      .eq("id", item.product_id)
      .maybeSingle();

    const currentStock = Number(product?.stock ?? 0);
    const nextStock = Math.max(0, currentStock - quantity);

    await supabase
      .from("products")
      .update({ stock: nextStock })
      .eq("id", item.product_id);
  }
}

async function restoreStockForItems(items: BasicItem[]) {
  for (const item of items) {
    if (!item?.product_id) continue;
    const quantity = Number(item.quantity ?? 0);
    if (!Number.isFinite(quantity) || quantity <= 0) continue;

    const { data: product } = await supabase
      .from("products")
      .select("stock")
      .eq("id", item.product_id)
      .maybeSingle();

    const currentStock = Number(product?.stock ?? 0);
    const nextStock = currentStock + quantity;

    await supabase
      .from("products")
      .update({ stock: nextStock })
      .eq("id", item.product_id);
  }
}

async function incrementCouponUsage(couponId?: string | null, couponCode?: string | null) {
  if (couponId) {
    const { data: coupon } = await supabase
      .from("coupons")
      .select("used_count")
      .eq("id", couponId)
      .maybeSingle();

    if (coupon) {
      await supabase
        .from("coupons")
        .update({ used_count: Number(coupon.used_count ?? 0) + 1 })
        .eq("id", couponId);
      return;
    }
  }

  if (couponCode) {
    const { data: coupon } = await supabase
      .from("coupons")
      .select("used_count")
      .eq("code", couponCode)
      .maybeSingle();

    if (coupon) {
      await supabase
        .from("coupons")
        .update({ used_count: Number(coupon.used_count ?? 0) + 1 })
        .eq("code", couponCode);
    }
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function respond(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}