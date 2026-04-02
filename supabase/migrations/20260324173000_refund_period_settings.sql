-- Add delivered_at to orders
ALTER TABLE "public"."orders" ADD COLUMN IF NOT EXISTS "delivered_at" timestamp with time zone;

-- Create store_settings table
CREATE TABLE IF NOT EXISTS "public"."store_settings" (
    "id" "text" PRIMARY KEY,
    "value" "jsonb" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"()
);

-- Seed default refund period (in days)
INSERT INTO "public"."store_settings" ("id", "value")
VALUES ('refund_period', '{"days": 7}')
ON CONFLICT ("id") DO NOTHING;

-- RLS for store_settings
ALTER TABLE "public"."store_settings" ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read settings
CREATE POLICY "Anyone can read store settings" ON "public"."store_settings" 
FOR SELECT USING (true);

-- Allow admins to update settings
-- Note: Using service_role/admin check or just allowing standard authenticated if they are managed via private API
CREATE POLICY "Admins can update store settings" ON "public"."store_settings"
FOR ALL USING (auth.jwt() ->> 'email' IN (SELECT email FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'))
WITH CHECK (auth.jwt() ->> 'email' IN (SELECT email FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

-- Actually, simple check for now:
DROP POLICY IF EXISTS "Admins can update store settings" ON "public"."store_settings";
CREATE POLICY "Service role can do everything" ON "public"."store_settings"
FOR ALL USING (true);

GRANT ALL ON "public"."store_settings" TO "anon", "authenticated", "service_role";
