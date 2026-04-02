
ALTER TABLE "public"."orders"
    ADD COLUMN IF NOT EXISTS "has_different_billing" boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS "billing_first_name" text,
    ADD COLUMN IF NOT EXISTS "billing_last_name" text,
    ADD COLUMN IF NOT EXISTS "billing_phone" text,
    ADD COLUMN IF NOT EXISTS "billing_street_address" text,
    ADD COLUMN IF NOT EXISTS "billing_city" text,
    ADD COLUMN IF NOT EXISTS "billing_state" text,
    ADD COLUMN IF NOT EXISTS "billing_zip_code" text,
    ADD COLUMN IF NOT EXISTS "billing_country" text;
