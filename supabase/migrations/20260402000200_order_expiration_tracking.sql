-- Add stripe metadata to orders
ALTER TABLE "public"."orders" 
    ADD COLUMN IF NOT EXISTS "stripe_session_id" text,
    ADD COLUMN IF NOT EXISTS "expires_at" timestamp with time zone,
    ADD COLUMN IF NOT EXISTS "stock_reduced" boolean DEFAULT false;

-- Add index for status and expiry to help background cleanup
CREATE INDEX IF NOT EXISTS "idx_orders_status_expiry" ON "public"."orders" ("status", "expires_at");
