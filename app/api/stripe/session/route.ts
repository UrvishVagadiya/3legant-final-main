import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/utils/stripe/server";
import { createAdminClient } from "@/utils/supabase/admin";
import Stripe from "stripe";

interface MetaItem {
    id?: string;
    product_id?: string;
    name?: string;
    product_name?: string;
    image?: string | null;
    product_image?: string | null;
    price?: number;
    unit_price?: number;
    prc?: number;
    quantity?: number;
    qty?: number;
    color?: string | null;
    clr?: string | null;
}

interface OrderItemRow {
    product_id: string;
    product_name: string;
    product_image: string | null;
    color: string | null;
    quantity: number;
    unit_price: number;
}

interface ProductRow {
    id: string;
    title?: string | null;
    img?: string | null;
    image_url?: string | null;
    image?: string | null;
    images?: string[] | null;
    price?: number | null;
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
        return NextResponse.json(
            { error: "Missing session_id" },
            { status: 400 }
        );
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== "paid") {
            return NextResponse.json(
                { error: "Payment not completed" },
                { status: 400 }
            );
        }

        const meta = session.metadata || {};
        const items = JSON.parse(meta.items_json || "[]") as MetaItem[];
        const userId = meta.user_id;
        const paymentIntentId = session.payment_intent as string;

        const admin = createAdminClient();

        let payment = null;
        if (paymentIntentId) {
            const { data } = await admin
                .from("payments")
                .select("*, orders(id, order_code, created_at)")
                .eq("transaction_id", paymentIntentId)
                .single();
            payment = data;
        }

        let finalOrder = null;
        let dbOrderItems: OrderItemRow[] = [];
        const orderIdFromMeta = meta.order_id;

        if (orderIdFromMeta) {
            const { data: orderData } = await admin
                .from("orders")
                .select("*, order_items(*)")
                .eq("id", orderIdFromMeta)
                .maybeSingle();
            if (orderData) {
                finalOrder = orderData;
                dbOrderItems = orderData.order_items || [];
            }
        }

        let itemsToUse = items;
        if (itemsToUse.length === 0 && dbOrderItems.length > 0) {
            itemsToUse = dbOrderItems.map((item) => ({
                id: item.product_id,
                name: item.product_name,
                image: item.product_image,
                price: item.unit_price,
                quantity: item.quantity,
                color: item.color,
            }));
        }

        const productIds = itemsToUse.map((i) => i.id || i.product_id).filter(Boolean) as string[];
        const { data: products } = await admin
            .from("products")
            .select("id, title, img, image_url, image, images, price")
            .in("id", productIds);
        const productMap = new Map<string, ProductRow>(products?.map((p: ProductRow) => [p.id, p]) || []);

        const fullItems = itemsToUse.map((item) => {
            const productId = item.id || item.product_id || "";
            const dbProduct = productMap.get(productId);
            // Robust image fallback chain
            const dbImage = dbProduct?.img ||
                dbProduct?.image_url ||
                dbProduct?.image ||
                (dbProduct?.images && Array.isArray(dbProduct.images) && dbProduct.images[0]) ||
                "";

            return {
                id: productId,
                name: item.name || item.product_name || dbProduct?.title || "Unknown Product",
                image: item.image || item.product_image || dbImage,
                price: item.prc || item.price || item.unit_price || dbProduct?.price || 0,
                quantity: item.qty || item.quantity || 1,
                color: item.clr || item.color || "Default",
            };
        });

        const existingOrder = finalOrder;
        const orderCode = existingOrder?.order_code || `#${Date.now().toString().slice(-10)}`;

        let subtotal = parseFloat(meta.subtotal || String(existingOrder?.subtotal || "0"));
        let shippingCost = parseFloat(meta.shipping_cost || String(existingOrder?.shipping_cost || "0"));
        let discountAmount = parseFloat(meta.discount || String(existingOrder?.discount || "0"));
        let total = parseFloat(meta.total || String(existingOrder?.total || "0"));

        if (existingOrder) {
            const { error: updateError } = await admin
                .from("orders")
                .update({
                    status: "confirmed",
                    updated_at: new Date().toISOString()
                })
                .eq("id", existingOrder.id);

            if (updateError) console.error("Failed to update order status:", updateError);
        } else if (userId) {
            if (total === 0 && fullItems.length > 0) {
                subtotal = fullItems.reduce((acc: number, item) => acc + (Number(item.price) * item.quantity), 0);
                total = subtotal + shippingCost - discountAmount;
            }

            const { data: createdOrder, error: createError } = await admin
                .from("orders")
                .insert({
                    order_code: orderCode,
                    user_id: userId,
                    status: "confirmed",
                    subtotal,
                    shipping_cost: shippingCost,
                    discount: discountAmount,
                    total,
                    shipping_method: meta.shipping_method || "free",
                    coupon_code: meta.coupon_code || null,
                    shipping_first_name: meta.shipping_first_name || "",
                    shipping_last_name: meta.shipping_last_name || "",
                    shipping_phone: meta.shipping_phone || "",
                    shipping_email: meta.shipping_email || "",
                    shipping_street_address: meta.shipping_street_address || "",
                    shipping_city: meta.shipping_city || "",
                    shipping_state: meta.shipping_state || "",
                    shipping_zip_code: meta.shipping_zip_code || "",
                    shipping_country: meta.shipping_country || "",
                    has_different_billing: meta.has_different_billing === "true",
                })
                .select()
                .single();

            if (!createError) {
                finalOrder = createdOrder;
                const dbItems = fullItems.map((item) => ({
                    order_id: createdOrder.id,
                    product_id: item.id,
                    product_name: item.name,
                    product_image: item.image,
                    color: item.color,
                    quantity: item.quantity,
                    unit_price: Number(item.price),
                    total_price: Number(item.price) * item.quantity,
                }));
                await admin.from("order_items").insert(dbItems);
            }
        }

        if (!finalOrder) {
            return NextResponse.json({ error: "Order context lost" }, { status: 500 });
        }

        let cardLast4: string | null = null;
        let cardBrand: string | null = null;

        // 4. Update the payment record to 'completed'
        // This will fire the 'on_payment_completed' database trigger
        if (paymentIntentId && finalOrder) {
            const { data: existingPayment } = await admin
                .from("payments")
                .select("id")
                .eq("order_id", finalOrder.id)
                .maybeSingle();

            try {
                const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ["payment_method"] });
                const pm = paymentIntent.payment_method as Stripe.PaymentMethod;
                if (pm?.card) {
                    cardLast4 = pm.card.last4;
                    cardBrand = pm.card.brand;
                }
            } catch (err) {
                console.error("Failed to retrieve payment method details:", err);
            }

            const paymentData = {
                status: "success",
                transaction_id: paymentIntentId,
                card_last_four: cardLast4,
                card_brand: cardBrand,
                payment_date: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            if (existingPayment) {
                await admin.from("payments").update(paymentData).eq("id", existingPayment.id);
            } else {
                // Fallback: Create payment record if it didn't exist
                await admin.from("payments").insert({
                    ...paymentData,
                    order_id: finalOrder.id,
                    user_id: userId,
                    payment_method: "card",
                    amount: total,
                    currency: "USD",
                });
            }
        }


        return NextResponse.json({
            items: fullItems,
            subtotal,
            discount: discountAmount,
            total,
            paymentMethod: "Credit Card (Stripe)",
            orderCode: finalOrder.order_code,
            date: new Date(finalOrder.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            }),
            cardLast4,
            cardBrand,
        });
    } catch (error) {
        console.error("Session retrieval error:", error);
        return NextResponse.json(
            { error: "Failed to retrieve session" },
            { status: 500 }
        );
    }
}
