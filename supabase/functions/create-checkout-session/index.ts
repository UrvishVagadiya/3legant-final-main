// @ts-nocheck
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-04-10",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── Auth ────────────────────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ── Parse body ──────────────────────────────────────────────────────────
    const {
      cart_items,        // [{ product_id, title, img, quantity, unit_price, color }]
      shipping_data,     // { first_name, last_name, email, phone, street_address, city, state, zip_code, country }
      billing_data,      // same shape or null
      has_different_billing,
      shipping_method,   // "standard" | "express"
      shipping_cost,
      coupon_code,
      coupon_id,
      discount,
      subtotal,
      total,
      notes,
    } = await req.json();

    if (!cart_items?.length) throw new Error("Cart is empty");

    // ── Generate order_code ─────────────────────────────────────────────────
    const order_code = `${Date.now().toString().slice(-10)}${Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, "0")}`;

    // ── Build Stripe line items ─────────────────────────────────────────────
    const line_items = cart_items.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.title,
          images: item.img ? [item.img] : [],
          metadata: {
            product_id: item.product_id,
            color: item.color ?? "",
          },
        },
        unit_amount: Math.round(Number(item.unit_price) * 100),
      },
      quantity: item.quantity,
    }));

    // ── Shipping line item ──────────────────────────────────────────────────
    if (shipping_cost > 0) {
      line_items.push({
        price_data: {
          currency: "usd",
          product_data: { name: `Shipping (${shipping_method ?? "standard"})` },
          unit_amount: Math.round(shipping_cost * 100),
        },
        quantity: 1,
      });
    }

    // ── Stripe discounts ────────────────────────────────────────────────────
    const discounts: Stripe.Checkout.SessionCreateParams["discounts"] = [];
    if (discount > 0 && coupon_code) {
      // Create a one-time Stripe coupon matching the DB discount.
      // Use coupon directly to avoid promotion code collisions on reused coupon codes.
      const stripeCoupon = await stripe.coupons.create({
        amount_off: Math.round(discount * 100),
        currency: "usd",
        name: coupon_code,
        max_redemptions: 1,
      });
      discounts.push({ coupon: stripeCoupon.id });
    }

    // ── Create pending order in DB ──────────────────────────────────────────
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: user.id,
        order_code,
        status: "pending",
        subtotal,
        discount: discount ?? 0,
        shipping_cost: shipping_cost ?? 0,
        total,
        coupon_code: coupon_code ?? null,
        shipping_method: shipping_method ?? "standard",
        notes: notes ?? null,
        has_different_billing: has_different_billing ?? false,
        // Shipping address
        shipping_first_name: shipping_data.first_name,
        shipping_last_name: shipping_data.last_name,
        shipping_email: shipping_data.email,
        shipping_phone: shipping_data.phone,
        shipping_street_address: shipping_data.street_address,
        shipping_city: shipping_data.city,
        shipping_state: shipping_data.state,
        shipping_zip_code: shipping_data.zip_code,
        shipping_country: shipping_data.country,
        // Billing address
        billing_first_name: has_different_billing
          ? billing_data?.first_name
          : null,
        billing_last_name: has_different_billing
          ? billing_data?.last_name
          : null,
        billing_phone: has_different_billing ? billing_data?.phone : null,
        billing_street_address: has_different_billing
          ? billing_data?.street_address
          : null,
        billing_city: has_different_billing ? billing_data?.city : null,
        billing_state: has_different_billing ? billing_data?.state : null,
        billing_zip_code: has_different_billing ? billing_data?.zip_code : null,
        billing_country: has_different_billing ? billing_data?.country : null,
        // Expires in 30 minutes (matches Stripe session)
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      })
      .select("id")
      .single();

    if (orderError) throw new Error(`Failed to create order: ${orderError.message}`);

    // ── Insert order_items ──────────────────────────────────────────────────
    const orderItems = cart_items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.title,
      product_image: item.img ?? null,
      color: item.color ?? null,
      quantity: item.quantity,
      unit_price: Number(item.unit_price),
      total_price: Number(item.unit_price) * item.quantity,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems);

    if (itemsError)
      throw new Error(`Failed to insert order items: ${itemsError.message}`);

    // ── Create pending payment row ─────────────────────────────────────────
    const safeTotal = Number(total) || 0;
    const { data: existingPayment, error: existingPaymentError } = await supabaseAdmin
      .from("payments")
      .select("id")
      .eq("order_id", order.id)
      .maybeSingle();

    if (existingPaymentError) {
      throw new Error(`Failed to look up payment: ${existingPaymentError.message}`);
    }

    const pendingPaymentPayload = {
      order_id: order.id,
      user_id: user.id,
      payment_method: "card",
      status: "pending",
      amount: safeTotal,
      currency: "USD",
      refund_amount: 0,
      updated_at: new Date().toISOString(),
    };

    if (existingPayment?.id) {
      const { error: updatePaymentError } = await supabaseAdmin
        .from("payments")
        .update(pendingPaymentPayload)
        .eq("id", existingPayment.id);

      if (updatePaymentError) {
        throw new Error(`Failed to update pending payment: ${updatePaymentError.message}`);
      }
    } else {
      const { error: paymentError } = await supabaseAdmin
        .from("payments")
        .insert({
          ...pendingPaymentPayload,
          payment_date: null,
          transaction_id: null,
          card_brand: null,
          card_last_four: null,
        });

      if (paymentError) {
        throw new Error(`Failed to create pending payment: ${paymentError.message}`);
      }
    }

    // ── Create Stripe Checkout Session ──────────────────────────────────────
    const siteUrl = Deno.env.get("SITE_URL") || req.headers.get("origin") || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      discounts,
      customer_email: shipping_data.email,
      client_reference_id: order.id,   // ← used in webhook
      payment_intent_data: {
        metadata: {
          order_id: order.id,
          order_code,
          user_id: user.id,
        },
      },
      metadata: {
        order_id: order.id,
        order_code,
        user_id: user.id,
        coupon_id: coupon_id ?? "",
        coupon_code: coupon_code ?? "",
        discount: String(discount ?? 0),
      },
      success_url: `${siteUrl}/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/cancel?order_id=${order.id}`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    // ── Save stripe session id ──────────────────────────────────────────────
    await supabaseAdmin
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return new Response(JSON.stringify({ url: session.url, order_id: order.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    console.error("[create-checkout-session]", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});