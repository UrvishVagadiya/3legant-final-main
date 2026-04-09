import { createClient } from "@/utils/supabase/client";

export interface Coupon {
    id: string;
    code: string;
    discount_type: string;
    discount_value: number;
    min_order_amount: number;
    max_discount_amount: number | null;
    usage_limit: number | null;
    used_count: number;
    is_active: boolean;
    valid_from: string;
    valid_until: string | null;
}

export function calculateCouponDiscount(coupon: Coupon, subtotal: number): number {
    if (subtotal <= 0) return 0;
    if (subtotal < coupon.min_order_amount) return 0;

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
        discount = subtotal * (coupon.discount_value / 100);
        if (coupon.max_discount_amount) {
            discount = Math.min(discount, coupon.max_discount_amount);
        }
    } else {
        discount = coupon.discount_value;
    }

    return Math.min(discount, subtotal);
}

export async function validateCoupon(code: string, subtotal: number, userId?: string): Promise<{ valid: boolean; coupon?: Coupon; discount: number; error?: string }> {
    const supabase = createClient();

    // Check if user has already used this coupon in a previous order
    if (userId) {
        const { data: existingOrders, error: orderError } = await supabase
            .from('orders')
            .select('id')
            .eq('user_id', userId)
            .eq('coupon_code', code.toUpperCase().trim())
            .limit(1);

        if (!orderError && existingOrders && existingOrders.length > 0) {
            return { valid: false, discount: 0, error: 'You have already used this coupon' };
        }
    }

    const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase().trim())
        .eq('is_active', true)
        .maybeSingle();

    if (error || !data) {
        return { valid: false, discount: 0, error: 'Invalid coupon code' };
    }

    const coupon = data as Coupon;

    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
        return { valid: false, discount: 0, error: 'Coupon has expired' };
    }

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        return { valid: false, discount: 0, error: 'Coupon usage limit reached' };
    }

    if (subtotal < coupon.min_order_amount) {
        return { valid: false, discount: 0, error: `Minimum order amount is $${coupon.min_order_amount.toFixed(2)}` };
    }

    const discount = calculateCouponDiscount(coupon, subtotal);

    return { valid: true, coupon, discount };
}

export async function incrementCouponUsage(couponId: string): Promise<void> {
    const res = await fetch('/api/coupons/increment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponId }),
    });
    if (!res.ok) {
        console.error('Failed to increment coupon usage:', await res.text());
    }
}
