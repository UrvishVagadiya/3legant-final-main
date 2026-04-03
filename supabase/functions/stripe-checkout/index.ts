import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"
import Stripe from "npm:stripe@^14.16.0"

interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  color?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    let user = null

    if (authHeader) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      )
      const { data: { user: authUser } } = await supabaseClient.auth.getUser()
      user = authUser
    }

    // Parse request body
    const body = await req.json()
    const {
      items,
      shippingInfo,
      useDifferentBilling,
      billingInfo,
      shippingMethod,
      shippingCost,
      subtotal,
      discount,
      total,
      couponCode,
      couponId,
    } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Cart items are required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Initialize Stripe
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeKey) {
      console.error('Missing STRIPE_SECRET_KEY')
      return new Response(JSON.stringify({ error: 'Stripe configuration missing on server' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Create Order in Supabase via service_role client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const orderCode = `#${Date.now().toString().slice(-6)}${Math.random().toString(36).substring(2, 5).toUpperCase()}`

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_code: orderCode,
        user_id: user?.id || null,
        status: 'pending',
        subtotal: Number(subtotal),
        shipping_cost: Number(shippingCost),
        discount: Number(discount),
        total: Number(total),
        shipping_method: shippingMethod,
        coupon_code: couponCode || null,
        shipping_first_name: shippingInfo.firstName,
        shipping_last_name: shippingInfo.lastName,
        shipping_phone: shippingInfo.phone,
        shipping_email: shippingInfo.email || user?.email || '',
        shipping_street_address: shippingInfo.streetAddress,
        shipping_city: shippingInfo.city,
        shipping_state: shippingInfo.state,
        shipping_zip_code: shippingInfo.zipCode,
        shipping_country: shippingInfo.country,
        has_different_billing: !!useDifferentBilling,
        ...(useDifferentBilling && billingInfo ? {
          billing_first_name: billingInfo.firstName,
          billing_last_name: billingInfo.lastName,
          billing_phone: billingInfo.phone,
          billing_street_address: billingInfo.streetAddress,
          billing_city: billingInfo.city,
          billing_state: billingInfo.state,
          billing_zip_code: billingInfo.zipCode,
          billing_country: billingInfo.country,
        } : {})
      })
      .select()
      .single()

    if (orderError) {
      console.error('Order creation failed:', orderError)
      throw orderError
    }

    // Create Order Items
    const orderItems = items.map((item: CheckoutItem) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      product_image: item.image,
      color: item.color,
      quantity: item.quantity,
      unit_price: Number(item.price),
      total_price: Number(item.price) * item.quantity,
    }))

    const { error: itemsError } = await supabaseAdmin.from('order_items').insert(orderItems)
    if (itemsError) console.error('Failed to create order items:', itemsError)

    // Reduce Stock (Reservation)
    const { error: stockError } = await supabaseAdmin.rpc('reduce_product_stock', {
      items: items.map((i: CheckoutItem) => ({ product_id: i.id, quantity: i.quantity }))
    })
    if (!stockError) {
      await supabaseAdmin.from('orders').update({ stock_reduced: true }).eq('id', order.id)
    }

    // Create Pending Payment
    await supabaseAdmin.from('payments').insert({
      order_id: order.id,
      user_id: user?.id || null,
      payment_method: 'card',
      status: 'pending',
      amount: total,
      currency: 'USD',
    })

    // Prepare Stripe Line Items
    const lineItems = items.map((item: CheckoutItem) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(Number(item.price) * 100),
      },
      quantity: item.quantity,
    }))

    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: `Shipping (${shippingMethod})`, images: [] },
          unit_amount: Math.round(Number(shippingCost) * 100),
        },
        quantity: 1,
      })
    }

    const discounts: { coupon: string }[] = []
    if (discount > 0) {
      const stripeCoupon = await stripe.coupons.create({
        amount_off: Math.round(Number(discount) * 100),
        currency: 'usd',
        duration: 'once',
        name: couponCode || 'Discount',
      })
      discounts.push({ coupon: stripeCoupon.id })
    }

    // Create Stripe Checkout Session
    const origin = req.headers.get('origin') || 'http://localhost:3000'
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      client_reference_id: order.id,
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // Set expiry to 30 minutes from now
      discounts: discounts.length > 0 ? discounts : undefined,
      customer_email: shippingInfo.email || user?.email,
      metadata: {
        order_id: order.id,
        user_id: user?.id || '',
        total: total.toString(),
        subtotal: subtotal.toString(),
        shipping_cost: shippingCost.toString(),
        discount: discount.toString(),
        items_json: JSON.stringify(
          items.map((i: CheckoutItem) => ({
            id: i.id,
            qty: i.quantity,
            prc: i.price,
            clr: i.color || 'Default',
          }))
        ),
      },
      success_url: `${origin}/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?cancelled=true&order_id=${order.id}`,
    })

    // Update order with Stripe session details
    await supabaseAdmin
      .from('orders')
      .update({
        stripe_session_id: session.id,
        expires_at: new Date(session.expires_at! * 1000).toISOString(),
      })
      .eq('id', order.id)

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: unknown) {
    console.error('Checkout error:', error)
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
