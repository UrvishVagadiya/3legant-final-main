-- Function to automatically cancel expired pending orders and restore their stock
CREATE OR REPLACE FUNCTION public.cancel_expired_orders()
RETURNS integer AS $$
DECLARE
    v_cancelled_count integer := 0;
    v_order_record RECORD;
BEGIN
    -- 1. Identify pending orders that have expired
    FOR v_order_record IN 
        SELECT id FROM public.orders 
        WHERE status = 'pending' 
        AND expires_at < now()
    LOOP
        -- 2. Fetch order items for this order
        -- (We could optimize this with a single query, but for simplicity and safety we do it per order)
        
        -- 3. Restore stock (this uses our existing RPC logic internally but here we can just do it)
        -- We'll use the existing restore_product_stock logic if possible, 
        -- but since we're in PL/pgSQL we'll just join.
        
        UPDATE public.products p
        SET stock = p.stock + oi.quantity
        FROM public.order_items oi
        WHERE oi.order_id = v_order_record.id
        AND oi.product_id = p.id;

        -- 4. Mark order and payment as cancelled
        UPDATE public.orders SET status = 'cancelled', updated_at = now() WHERE id = v_order_record.id;
        UPDATE public.payments SET status = 'cancelled', updated_at = now() WHERE order_id = v_order_record.id;
        
        v_cancelled_count := v_cancelled_count + 1;
    END LOOP;

    RETURN v_cancelled_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution
GRANT EXECUTE ON FUNCTION public.cancel_expired_orders() TO "service_role", "authenticated", "anon";
