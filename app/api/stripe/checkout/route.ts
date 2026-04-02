import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/utils/stripe/server";
import { createClient } from "@/utils/supabase/server";
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
        } = body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { error: "Cart items are required" },
                { status: 400 }
            );
        }

        const lineItems = items.map(
            (item: {
                name: string;
                price: number;
                quantity: number;
                image: string;
            }) => ({
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: item.name,
                        images: item.image ? [item.image] : [],
                    },
                    unit_amount: Math.round(Number(item.price) * 100),
                },
                quantity: item.quantity,
            })
        );

        if (shippingCost > 0) {
            lineItems.push({
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: `Shipping (${shippingMethod})`,
                        images: [],
                    },
                    unit_amount: Math.round(shippingCost * 100),
                },
                quantity: 1,
            });
        }

        const discounts: { coupon: string }[] = [];
        if (discount > 0) {
            const stripeCoupon = await stripe.coupons.create({
                amount_off: Math.round(discount * 100),
                currency: "usd",
                duration: "once",
                name: couponCode || "Discount",
            });
            discounts.push({ coupon: stripeCoupon.id });
        }

        const origin = req.headers.get("origin") || "http://localhost:3000";

        // Create order in 'pending' status
        const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
        const orderCode = `#${Date.now().toString().slice(-6)}${randomStr}`;
        
        const safeSubtotal = Number(subtotal) || 0;
        const safeShippingCost = Number(shippingCost) || 0;
        const safeDiscount = Number(discount) || 0;
        const safeTotal = Number(total) || 0;

        const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
                order_code: orderCode,
                user_id: user.id,
                status: "pending",
                subtotal: safeSubtotal,
                shipping_cost: safeShippingCost,
                discount: safeDiscount,
                total: safeTotal,
                shipping_method: shippingMethod,
                coupon_code: couponCode || null,
                shipping_first_name: shippingInfo.firstName || "N/A",
                shipping_last_name: shippingInfo.lastName || "N/A",
                shipping_phone: shippingInfo.phone || "N/A",
                shipping_email: shippingInfo.email || user.email,
                shipping_street_address: shippingInfo.streetAddress || "N/A",
                shipping_city: shippingInfo.city || "N/A",
                shipping_state: shippingInfo.state || "N/A",
                shipping_zip_code: shippingInfo.zipCode || "N/A",
                shipping_country: shippingInfo.country || "N/A",
                has_different_billing: !!useDifferentBilling,
                ...(useDifferentBilling && billingInfo
                    ? {
                        billing_first_name: billingInfo.firstName,
                        billing_last_name: billingInfo.lastName,
                        billing_phone: billingInfo.phone,
                        billing_street_address: billingInfo.streetAddress,
                        billing_city: billingInfo.city,
                        billing_state: billingInfo.state,
                        billing_zip_code: billingInfo.zipCode,
                        billing_country: billingInfo.country,
                    }
                    : {}),
            })
            .select()
            .single();

        if (orderError) {
            console.error("Failed to create pending order:", orderError);
            return NextResponse.json({ 
                error: `Failed to create order: ${orderError.message}`,
                details: orderError 
            }, { status: 500 });
        }

        // Create order items
        const orderItems = items.map((item: any) => ({
            order_id: order.id,
            product_id: item.id,
            product_name: item.name,
            product_image: item.image,
            color: item.color,
            quantity: item.quantity,
            unit_price: Number(item.price),
            total_price: Number(item.price) * item.quantity,
        }));

        const { error: itemsError } = await supabase
            .from("order_items")
            .insert(orderItems);

        if (itemsError) {
            console.error("Failed to create order items:", itemsError);
        } else {
            // REDUCE STOCK (Reserve items immediately on checkout start)
            const stockItems = items.map((item: any) => ({
                product_id: item.id,
                quantity: item.quantity
            }));

            const { error: stockError } = await supabase.rpc("reduce_product_stock", {
                items: stockItems
            });

            if (!stockError) {
                await supabase
                    .from("orders")
                    .update({ stock_reduced: true })
                    .eq("id", order.id);
                console.log("Successfully reserved stock for pending order");
            } else {
                console.error("Failed to reserve stock:", stockError);
            }
        }

        const { error: paymentError } = await supabase
            .from("payments")
            .insert({
                order_id: order.id,
                user_id: user.id,
                payment_method: "card",
                status: "pending",
                amount: total,
                currency: "USD",
                refund_amount: 0,
            });

        if (paymentError) {
            console.error("Failed to create pending payment:", paymentError);
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            ...(discounts.length > 0 ? { discounts } : {}),
            customer_email: user.email,
            expires_at: Math.floor(Date.now() / 1000) + (30 * 60),
            metadata: {
                order_id: order.id, 
                user_id: user.id,
                shipping_first_name: shippingInfo.firstName,
                shipping_last_name: shippingInfo.lastName,
                shipping_phone: shippingInfo.phone,
                shipping_email: shippingInfo.email,
                shipping_street_address: shippingInfo.streetAddress,
                shipping_city: shippingInfo.city,
                shipping_state: shippingInfo.state,
                shipping_zip_code: shippingInfo.zipCode,
                shipping_country: shippingInfo.country,
                has_different_billing: useDifferentBilling ? "true" : "false",
                ...(useDifferentBilling && billingInfo
                    ? {
                        billing_first_name: billingInfo.firstName,
                        billing_last_name: billingInfo.lastName,
                        billing_phone: billingInfo.phone,
                        billing_street_address: billingInfo.streetAddress,
                        billing_city: billingInfo.city,
                        billing_state: billingInfo.state,
                        billing_zip_code: billingInfo.zipCode,
                        billing_country: billingInfo.country,
                    }
                    : {}),
                shipping_method: shippingMethod,
                subtotal: subtotal.toString(),
                shipping_cost: shippingCost.toString(),
                discount: discount.toString(),
                total: total.toString(),
                coupon_code: couponCode || "",
                coupon_id: couponId || "",
                items_json: JSON.stringify(
                    items.map(
                        (item: {
                            id: string;
                            quantity: number;
                            price: number;
                            color: string;
                        }) => ({
                            id: item.id,
                            qty: item.quantity,
                            prc: item.price,
                            clr: item.color,
                        })
                    )
                ),
            },
            success_url: `${origin}/complete?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/checkout?cancelled=true&order_id=${order.id}`,
        });

        // Update order with Stripe session details
        await supabase
            .from("orders")
            .update({
                stripe_session_id: session.id,
                expires_at: new Date((session.expires_at as number) * 1000).toISOString(),
            })
            .eq("id", order.id);

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (error: unknown) {
        console.error("Stripe checkout error:", error);
        const message =
            error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
