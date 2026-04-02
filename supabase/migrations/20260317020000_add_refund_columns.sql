-- Add refund columns to orders table
DO $$ 
BEGIN
    -- Add refund_status if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'refund_status') THEN
        ALTER TABLE orders ADD COLUMN refund_status TEXT DEFAULT 'none';
    END IF;

    -- Add refund_request_reason if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'refund_request_reason') THEN
        ALTER TABLE orders ADD COLUMN refund_request_reason TEXT;
    END IF;

    -- Add refund_requested_at if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'refund_requested_at') THEN
        ALTER TABLE orders ADD COLUMN refund_requested_at TIMESTAMPTZ;
    END IF;
END $$;
