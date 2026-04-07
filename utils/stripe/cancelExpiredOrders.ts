import { createAdminClient } from "@/utils/supabase/admin";

type ExpirableOrderRow = {
    id: string;
    status: string;
    stock_reduced: boolean | null;
    expires_at: string | null;
    stripe_session_id: string | null;
};

type PaymentRow = {
    status: string | null;
};

type CleanupOptions = {
    orderId?: string | null;
    stripeSessionId?: string | null;
    force?: boolean;
};

type CleanupResult = {
    cancelledOrderIds: string[];
    skippedOrderIds: string[];
    errors: string[];
};

export async function cancelExpiredStripeOrders(
    options: CleanupOptions = {},
): Promise<CleanupResult> {
    const admin = createAdminClient();
    const nowIso = new Date().toISOString();

    let query = admin
        .from("orders")
        .select("id, status, stock_reduced, expires_at, stripe_session_id")
        .in("status", ["pending", "processing", "failed"]);

    if (options.orderId) {
        query = query.eq("id", options.orderId);
    }

    if (options.stripeSessionId) {
        query = query.eq("stripe_session_id", options.stripeSessionId);
    }

    if (!options.force) {
        query = query.lte("expires_at", nowIso);
    }

    const { data: orders, error } = await query;
    if (error) {
        return {
            cancelledOrderIds: [],
            skippedOrderIds: [],
            errors: [error.message],
        };
    }

    const cancelledOrderIds: string[] = [];
    const skippedOrderIds: string[] = [];
    const errors: string[] = [];

    for (const order of (orders || []) as ExpirableOrderRow[]) {
        if (!options.force && order.expires_at && new Date(order.expires_at) > new Date(nowIso)) {
            skippedOrderIds.push(order.id);
            continue;
        }

        const { data: payments, error: paymentError } = await admin
            .from("payments")
            .select("status")
            .eq("order_id", order.id);

        if (paymentError) {
            errors.push(`payments:${order.id}:${paymentError.message}`);
            continue;
        }

        const paymentRows = (payments || []) as PaymentRow[];
        const hasSuccessfulPayment = paymentRows.some(
            (payment) => payment.status === "success" || payment.status === "completed" || payment.status === "succeeded",
        );

        if (hasSuccessfulPayment || order.status === "cancelled" || order.status === "refunded") {
            skippedOrderIds.push(order.id);
            continue;
        }

        let stockRestored = false;

        if (order.stock_reduced) {
            const { data: items, error: itemsError } = await admin
                .from("order_items")
                .select("product_id, quantity")
                .eq("order_id", order.id);

            if (itemsError) {
                errors.push(`order_items:${order.id}:${itemsError.message}`);
            } else if (items?.length) {
                const { error: rpcError } = await admin.rpc("restore_product_stock", {
                    items: items.map((item) => ({
                        product_id: item.product_id,
                        quantity: item.quantity,
                    })),
                });

                if (rpcError) {
                    errors.push(`restore_stock:${order.id}:${rpcError.message}`);
                } else {
                    stockRestored = true;
                }
            }
        }

        const { error: orderUpdateError } = await admin
            .from("orders")
            .update({
                status: "cancelled",
                ...(stockRestored ? { stock_reduced: false } : {}),
                updated_at: new Date().toISOString(),
            })
            .eq("id", order.id);

        if (orderUpdateError) {
            errors.push(`orders:${order.id}:${orderUpdateError.message}`);
            continue;
        }

        const { error: paymentUpdateError } = await admin
            .from("payments")
            .update({
                status: "cancelled",
                updated_at: new Date().toISOString(),
            })
            .eq("order_id", order.id)
            .in("status", ["pending", "processing", "failed"]);

        if (paymentUpdateError) {
            errors.push(`payment_update:${order.id}:${paymentUpdateError.message}`);
        }

        cancelledOrderIds.push(order.id);
    }

    return {
        cancelledOrderIds,
        skippedOrderIds,
        errors,
    };
}