import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"
import Stripe from "npm:stripe@^14.16.0"

interface StockItem {
  product_id: string;
  quantity: number;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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
        const orderId = session.metadata?.order_id

        if (!orderId) {
          console.error('No order_id in metadata for session:', session.id)
          break
        }

        if (session.payment_status === 'paid') {
          // Update payment status to 'completed'
          // This fires the 'on_payment_completed' database trigger
          const { error } = await supabaseAdmin
            .from('payments')
            .update({
              status: 'completed',
              transaction_id: session.payment_intent as string,
              payment_date: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('order_id', orderId)

          if (error) {
            console.error('Failed to update payment status:', error)
            return new Response(JSON.stringify({ error: error.message }), { status: 500 })
          }

          console.log(`Successfully confirmed payment for order: ${orderId}`)
        }
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.order_id

        if (!orderId) {
          console.error('No orderId in metadata for expired session:', session.id)
          break
        }

        // 1. Fetch order to check status and stock_reduced flag
        const { data: order, error: orderError } = await supabaseAdmin
          .from('orders')
          .select('status, stock_reduced')
          .eq('id', orderId)
          .maybeSingle()

        if (orderError || !order) {
          console.error(`Failed to fetch order ${orderId}:`, orderError)
          break
        }

        // Only cancel if still pending/failed
        if (order.status !== 'pending' && order.status !== 'failed') {
          console.log(`Order ${orderId} already in status '${order.status}', skipping automatic cancel.`)
          break
        }

        console.log(`Order session expired: ${orderId}. Processing cancellation...`)

        // 2. Restore stock if needed
        if (order.stock_reduced) {
          const { data: items } = await supabaseAdmin
            .from('order_items')
            .select('product_id, quantity')
            .eq('order_id', orderId)

          if (items && items.length > 0) {
            const { error: rpcError } = await supabaseAdmin.rpc('restore_product_stock', {
              items: items.map((i: StockItem) => ({
                product_id: i.product_id,
                quantity: i.quantity
              }))
            })
            if (rpcError) console.error('Stock restoration failed:', rpcError)
          }
        }

        // 3. Cancel order & payment
        const { error: finalError } = await supabaseAdmin.from('orders').update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        }).eq('id', orderId)

        await supabaseAdmin.from('payments').update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        }).eq('order_id', orderId)

        if (finalError) console.error('Cancellation update failed:', finalError)
        else console.log(`Successfully cancelled expired order: ${orderId}`)

        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        // Stripe usually sends the order/session info in metadata if you set it
        const orderId = charge.metadata?.order_id

        if (!orderId) break

        console.log(`Charge refunded for order: ${orderId}. Updating status...`)

        // Mark as refunded
        await supabaseAdmin.from('orders').update({ status: 'refunded' }).eq('id', orderId)
        await supabaseAdmin.from('payments').update({ status: 'refunded' }).eq('order_id', orderId)

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
