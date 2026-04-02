-- ============================================================
-- AUTOMATIC STOCK REDUCTION (ROBUST VERSION)
-- ============================================================

-- Function to reduce product stock based on order items
-- items: JSONB array of objects [{ "product_id": "...", "quantity": 1 }]
CREATE OR REPLACE FUNCTION public.reduce_product_stock(items jsonb)
RETURNS void AS $$
DECLARE
    item jsonb;
    p_id uuid;
    p_qty integer;
    exists_check boolean;
BEGIN
    FOR item IN SELECT * FROM jsonb_array_elements(items)
    LOOP
        p_id := (item->>'product_id')::uuid;
        p_qty := (item->>'quantity')::integer;
        
        -- Basic validation
        IF p_id IS NOT NULL AND p_qty > 0 THEN
            UPDATE public.products
            SET stock = GREATEST(0, COALESCE(stock, 0) - p_qty)
            WHERE id = p_id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution to service_role (used by webhook)
GRANT EXECUTE ON FUNCTION public.reduce_product_stock(jsonb) TO "service_role", "authenticated", "anon";
