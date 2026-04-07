import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"
import Stripe from "npm:stripe@^14.16.0"

interface StockItem {
  product_id: string;
  quantity: number;
}

type ExpirableOrderRow = {
  id: string;
  status: string;
  stock_reduced: boolean | null;
};

type PaymentOrderLink = {
  order_id: string;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({ status: 'ok', message: 'Stripe webhook is live' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  }

  try {
    const signature = req.headers.get('stripe-signature')
    if (!signature) throw new Error('Missing stripe-signature header')

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

    if (!stripeKey || !webhookSecret) {
      console.error('Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET')
      return new Response(JSON.stringify({ error: 'Server configuration missing' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const body = await req.text()

    let event: Stripe.Event
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Webhook signature verification failed'
      console.error(`Webhook signature verification failed: ${message}`)
      return new Response(`Webhook Error: ${message}`, { status: 400 })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log(`[Webhook] checkout.session.completed for ${session.id}`)
        await handleCheckoutSessionCompleted(session, supabaseAdmin)
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log(`[Webhook] checkout.session.expired for ${session.id}`)
        await handleCheckoutSessionExpired(session, supabaseAdmin)
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log(`[Webhook] payment_intent.succeeded for ${paymentIntent.id}`)
        await handlePaymentIntentSucceeded(paymentIntent, supabaseAdmin)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log(`[Webhook] payment_intent.payment_failed for ${paymentIntent.id}`)
        await handlePaymentIntentFailed(paymentIntent, supabaseAdmin)
        break
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log(`[Webhook] payment_intent.canceled for ${paymentIntent.id}`)
        await handlePaymentIntentCanceled(paymentIntent, supabaseAdmin)
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        console.log(`[Webhook] charge.refunded for ${charge.id}`)
        await handleChargeRefunded(charge, supabaseAdmin)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: unknown) {
    console.error('Webhook processing error:', error)
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  supabaseAdmin: ReturnType<typeof createClient>
) {
  if (session.payment_status !== 'paid') {
    console.log(`[Webhook] Session ${session.id} not paid yet (${session.payment_status})`)
    return
  }

  let orderId = session.metadata?.order_id || session.client_reference_id

  if (!orderId && session.id) {
    const { data: bySession, error: bySessionError } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('stripe_session_id', session.id)
      .maybeSingle()

    if (bySessionError) {
      console.error(`[Webhook] Failed to resolve order for completed session ${session.id}:`, bySessionError)
    }

    if (bySession?.id) {
      orderId = bySession.id
    }
  }

  if (!orderId) {
    console.error(`[Webhook] Missing order id in completed session ${session.id}`)
    return
  }

  const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id

  const { error } = await supabaseAdmin
    .from('payments')
    .update({
      status: 'success',
      transaction_id: paymentIntentId || null,
      payment_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('order_id', orderId)

  if (error) {
    console.error(`[Webhook] Failed to mark payment completed for order ${orderId}:`, error)
  }

  const { error: orderStatusError } = await supabaseAdmin
    .from('orders')
    .update({
      status: 'processing',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .in('status', ['pending', 'failed'])

  if (orderStatusError) {
    console.error(`[Webhook] Failed to move order ${orderId} to processing:`, orderStatusError)
  }
}

async function handleCheckoutSessionExpired(
  session: Stripe.Checkout.Session,
  supabaseAdmin: ReturnType<typeof createClient>
) {
  let orderId = session.metadata?.order_id || session.client_reference_id || null
  let order: ExpirableOrderRow | null = null

  if (!orderId && session.id) {
    const { data: bySession, error: bySessionError } = await supabaseAdmin
      .from('orders')
      .select('id, status, stock_reduced')
      .eq('stripe_session_id', session.id)
      .maybeSingle()

    if (bySessionError) {
      console.error('Failed to resolve order via stripe_session_id:', bySessionError)
    }

    if (bySession) {
      orderId = bySession.id
      order = bySession as ExpirableOrderRow
    }
  }

  if (!orderId) {
    console.error('No orderId found for expired session:', session.id)
    return
  }

  if (!order) {
    const { data: fetchedOrder, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, status, stock_reduced')
      .eq('id', orderId)
      .maybeSingle()

    if (orderError || !fetchedOrder) {
      console.error(`Failed to fetch order ${orderId}:`, orderError)
      return
    }

    order = fetchedOrder as ExpirableOrderRow
  }

  if (order.status !== 'pending' && order.status !== 'failed' && order.status !== 'processing') {
    console.log(`Order ${orderId} already in status '${order.status}', skipping auto-cancel.`)
    return
  }

  let stockRestoreSucceeded = false

  if (order.stock_reduced) {
    const { data: items } = await supabaseAdmin
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', orderId)

    if (items && items.length > 0) {
      const { error: rpcError } = await supabaseAdmin.rpc('restore_product_stock', {
        items: items.map((i: StockItem) => ({
          product_id: i.product_id,
          quantity: i.quantity,
        })),
      })

      if (rpcError) {
        console.error('Stock restoration failed:', rpcError)
      } else {
        stockRestoreSucceeded = true
      }
    }
  }

  const { error: orderError } = await supabaseAdmin
    .from('orders')
    .update({
      status: 'cancelled',
      ...(stockRestoreSucceeded ? { stock_reduced: false } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (orderError) {
    console.error(`Cancellation update failed for order ${orderId}:`, orderError)
    return
  }

  const { error: paymentUpdateError } = await supabaseAdmin
    .from('payments')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('order_id', orderId)
    .in('status', ['pending', 'processing', 'failed'])

  if (paymentUpdateError) {
    console.error(`Payment cancellation failed for order ${orderId}:`, paymentUpdateError)
  }
}

async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  supabaseAdmin: ReturnType<typeof createClient>
) {
  await updatePaymentIntentStatus(
    paymentIntent.id,
    'success',
    supabaseAdmin,
    paymentIntent.metadata?.order_id,
  )
}

async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent,
  supabaseAdmin: ReturnType<typeof createClient>
) {
  await updatePaymentIntentStatus(
    paymentIntent.id,
    'failed',
    supabaseAdmin,
    paymentIntent.metadata?.order_id,
  )
}

async function handlePaymentIntentCanceled(
  paymentIntent: Stripe.PaymentIntent,
  supabaseAdmin: ReturnType<typeof createClient>
) {
  await updatePaymentIntentStatus(
    paymentIntent.id,
    'cancelled',
    supabaseAdmin,
    paymentIntent.metadata?.order_id,
  )
}

async function handleChargeRefunded(
  charge: Stripe.Charge,
  supabaseAdmin: ReturnType<typeof createClient>
) {
  const paymentIntentId = typeof charge.payment_intent === 'string'
    ? charge.payment_intent
    : charge.payment_intent?.id

  if (!paymentIntentId) return

  const { data: paymentLink } = await supabaseAdmin
    .from('payments')
    .select('order_id')
    .eq('transaction_id', paymentIntentId)
    .maybeSingle()

  const linkedOrderId = (paymentLink as PaymentOrderLink | null)?.order_id || null
  const orderId = linkedOrderId || charge.metadata?.order_id

  if (!orderId) {
    console.error(`[Webhook] Could not resolve order for refunded charge ${charge.id}`)
    return
  }

  await supabaseAdmin
    .from('payments')
    .update({
      status: 'refunded',
      refund_amount: charge.amount_refunded / 100,
      refund_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('order_id', orderId)

  await supabaseAdmin
    .from('orders')
    .update({
      status: 'refunded',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
}

async function updatePaymentIntentStatus(
  paymentIntentId: string,
  status: 'success' | 'failed' | 'cancelled',
  supabaseAdmin: ReturnType<typeof createClient>,
  metadataOrderId?: string,
) {
  const now = new Date().toISOString()

  let payment: PaymentOrderLink | null = null

  const byTransaction = await supabaseAdmin
    .from('payments')
    .update({
      status,
      transaction_id: paymentIntentId,
      ...(status === 'success' ? { payment_date: now } : {}),
      updated_at: now,
    })
    .eq('transaction_id', paymentIntentId)
    .select('order_id')
    .maybeSingle()

  if (byTransaction.data) {
    payment = byTransaction.data as PaymentOrderLink
  }

  if (!payment && metadataOrderId) {
    const byOrder = await supabaseAdmin
      .from('payments')
      .update({
        status,
        transaction_id: paymentIntentId,
        ...(status === 'success' ? { payment_date: now } : {}),
        updated_at: now,
      })
      .eq('order_id', metadataOrderId)
      .in('status', ['pending', 'processing', 'failed'])
      .select('order_id')
      .maybeSingle()

    if (byOrder.data) {
      payment = byOrder.data as PaymentOrderLink
    }
  }

  const orderId = payment?.order_id
  if (!orderId) {
    console.log(`[Webhook] No payment row found for payment_intent ${paymentIntentId}`)
    return
  }

  if (status === 'success') {
    await supabaseAdmin
      .from('orders')
      .update({
        status: 'processing',
        updated_at: now,
      })
      .eq('id', orderId)
      .in('status', ['pending', 'failed'])
    return
  }

  await supabaseAdmin
    .from('orders')
    .update({
      status: 'cancelled',
      updated_at: now,
    })
    .eq('id', orderId)
    .in('status', ['pending', 'processing', 'failed'])

  await restockOrder(orderId, supabaseAdmin)
}

async function restockOrder(
  orderId: string,
  supabaseAdmin: ReturnType<typeof createClient>
) {
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('stock_reduced')
    .eq('id', orderId)
    .maybeSingle()

  if (!order?.stock_reduced) {
    return
  }

  const { data: items } = await supabaseAdmin
    .from('order_items')
    .select('product_id, quantity')
    .eq('order_id', orderId)

  if (!items?.length) {
    return
  }

  const { error: restoreError } = await supabaseAdmin.rpc('restore_product_stock', {
    items: items.map((i: StockItem) => ({
      product_id: i.product_id,
      quantity: i.quantity,
    })),
  })

  if (restoreError) {
    console.error(`[Webhook] Failed to restore stock for order ${orderId}:`, restoreError)
    return
  }

  await supabaseAdmin
    .from('orders')
    .update({
      stock_reduced: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
}
