-- 1. Create a function to handle payment success logic
CREATE OR REPLACE FUNCTION public.handle_successful_payment()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id uuid;
    v_order_id uuid;
    v_coupon_code text;
BEGIN
    -- Only proceed if the status changed to 'completed'
    IF (NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status <> 'completed')) THEN
        
        v_user_id := NEW.user_id;
        v_order_id := NEW.order_id;

        -- 1. Update the order status to 'confirmed'
        UPDATE public.orders
        SET 
            status = 'confirmed',
            updated_at = now()
        WHERE id = v_order_id
          AND status = 'pending';

        -- 2. Get coupon code from the order if needed
        SELECT coupon_code INTO v_coupon_code
        FROM public.orders
        WHERE id = v_order_id;

        -- 3. Increment coupon usage if a coupon was used
        IF v_coupon_code IS NOT NULL THEN
            UPDATE public.coupons
            SET used_count = used_count + 1
            WHERE code = v_coupon_code;
        END IF;

        -- 4. Delete the user's cart items
        DELETE FROM public.cart
        WHERE user_id = v_user_id;

        RAISE NOTICE 'Processed successful payment for order %', v_order_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger on the payments table
DROP TRIGGER IF EXISTS on_payment_completed ON public.payments;
CREATE TRIGGER on_payment_completed
    AFTER UPDATE ON public.payments
    FOR EACH ROW
    WHEN (NEW.status = 'completed' AND OLD.status <> 'completed')
    EXECUTE FUNCTION public.handle_successful_payment();

-- 3. Also handle INSERT if the payment starts as 'completed' (unlikely but possible with some providers)
DROP TRIGGER IF EXISTS on_payment_inserted_completed ON public.payments;
CREATE TRIGGER on_payment_inserted_completed
    AFTER INSERT ON public.payments
    FOR EACH ROW
    WHEN (NEW.status = 'completed')
    EXECUTE FUNCTION public.handle_successful_payment();
