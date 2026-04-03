import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { cookies } from "next/headers";

interface OrderPaymentRow {
    status?: string;
}

interface OrderStatRow {
    id: string;
    total: string | number | null;
    status: string;
    subtotal: string | number | null;
    shipping_cost: string | number | null;
    discount: string | number | null;
}

interface RecentOrderRow {
    status: string;
    payments?: OrderPaymentRow[] | OrderPaymentRow | null;
    [key: string]: unknown;
}

export async function GET() {
    const supabase = createClient(cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();

    const [products, orders, payments, coupons] = await Promise.all([
        admin.from("products").select("id", { count: "exact", head: true }),
        admin.from("orders").select("id, total, status, subtotal, shipping_cost, discount", { count: "exact" }),
        admin.from("payments").select("id", { count: "exact", head: true }),
        admin.from("coupons").select("id", { count: "exact", head: true }).eq("is_active", true),
    ]);

    if (products.error || orders.error || payments.error || coupons.error) {
        console.error("Stats fetch error:", {
            products: products.error,
            orders: orders.error,
            payments: payments.error,
            coupons: coupons.error
        });
        return NextResponse.json({ error: "Failed to fetch dashboard statistics" }, { status: 500 });
    }

    const ordersData = (orders.data || []) as OrderStatRow[];
    const totalRevenue = ordersData.reduce((sum, o) => {
        if (o.status === "cancelled" || o.status === "refunded") return sum;
        const total = parseFloat(String(o.total || 0));
        const subtotal = parseFloat(String(o.subtotal || 0));
        const shipping = parseFloat(String(o.shipping_cost || 0));
        const discount = parseFloat(String(o.discount || 0));

        const orderTotal = total > 0 ? total : (subtotal + shipping - discount);
        return sum + (isNaN(orderTotal) ? 0 : orderTotal);
    }, 0);
    const pendingOrders = ordersData.filter((o) => o.status === "pending").length;

    const { data: recent, error: recentError } = await admin
        .from("orders")
        .select("id, order_code, status, total, created_at, shipping_first_name, shipping_last_name, subtotal, shipping_cost, discount, payments(status)")
        .order("created_at", { ascending: false })
        .limit(5);

    if (recentError) {
        console.error("Recent orders fetch error:", recentError);
    }

    const recentOrders = (recent || []).map((order: RecentOrderRow) => {
        const payments = Array.isArray(order.payments) ? order.payments : (order.payments ? [order.payments] : []);
        const successfulPayment = payments.find((p: OrderPaymentRow) => p.status === 'completed' || p.status === 'succeeded');

        return {
            ...order,
            payment_status: successfulPayment?.status || payments[0]?.status || (order.status === 'cancelled' ? 'cancelled' : "pending")
        };
    });

    return NextResponse.json({
        stats: {
            totalProducts: products.count || 0,
            totalOrders: orders.count || 0,
            totalRevenue: Number(totalRevenue.toFixed(2)),
            totalPayments: payments.count || 0,
            activeCoupons: coupons.count || 0,
            pendingOrders,
        },
        recentOrders,
    });
}
