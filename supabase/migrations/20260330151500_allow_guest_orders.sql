-- Allow guest orders by making user_id nullable in orders and payments tables
-- This supports checkout without requiring a logged-in user

ALTER TABLE "public"."orders" ALTER COLUMN "user_id" DROP NOT NULL;
ALTER TABLE "public"."payments" ALTER COLUMN "user_id" DROP NOT NULL;

-- Update RLS policies for orders to allow service_role inserts (for guest orders)
-- The existing policies already use service_role (which bypasses RLS), so no changes needed there

-- Optional: Add a guest_email index for tracking guest orders
CREATE INDEX IF NOT EXISTS "idx_orders_shipping_email" ON "public"."orders" ("shipping_email");
