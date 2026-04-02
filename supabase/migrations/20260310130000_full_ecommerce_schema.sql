ALTER TABLE "public"."products"
    ADD COLUMN IF NOT EXISTS "description" "text",
    ADD COLUMN IF NOT EXISTS "sku" "text",
    ADD COLUMN IF NOT EXISTS "stock" integer DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "color" "text"[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS "measurements" "text",
    ADD COLUMN IF NOT EXISTS "weight" "text",
    ADD COLUMN IF NOT EXISTS "status" "text" DEFAULT 'active' CHECK ("status" IN ('active', 'draft', 'archived')),
    ADD COLUMN IF NOT EXISTS "valid_until" timestamp with time zone;


CREATE TABLE IF NOT EXISTS "public"."user_addresses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL DEFAULT 'shipping' CHECK ("type" IN ('billing', 'shipping')),
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "phone" "text",
    "email" "text",
    "street_address" "text" NOT NULL,
    "city" "text" NOT NULL,
    "state" "text" NOT NULL,
    "zip_code" "text" NOT NULL,
    "country" "text" NOT NULL,
    "is_default" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    PRIMARY KEY ("id")
);


CREATE TABLE IF NOT EXISTS "public"."cart" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL REFERENCES "public"."products"("id") ON DELETE CASCADE,
    "quantity" integer NOT NULL DEFAULT 1 CHECK ("quantity" >= 1),
    "color" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    PRIMARY KEY ("id"),
    UNIQUE ("user_id", "product_id", "color")
);


CREATE TABLE IF NOT EXISTS "public"."wishlist" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL REFERENCES "public"."products"("id") ON DELETE CASCADE,
    "created_at" timestamp with time zone DEFAULT "now"(),
    PRIMARY KEY ("id"),
    UNIQUE ("user_id", "product_id")
);


CREATE TABLE IF NOT EXISTS "public"."coupons" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL UNIQUE,
    "discount_type" "text" NOT NULL CHECK ("discount_type" IN ('percentage', 'fixed')),
    "discount_value" numeric(10,2) NOT NULL CHECK ("discount_value" > 0),
    "min_order_amount" numeric(10,2) DEFAULT 0,
    "max_discount_amount" numeric(10,2),
    "usage_limit" integer,
    "used_count" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "valid_from" timestamp with time zone DEFAULT "now"(),
    "valid_until" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    PRIMARY KEY ("id")
);


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_code" "text" NOT NULL UNIQUE,
    "user_id" "uuid" NOT NULL,
    "status" "text" NOT NULL DEFAULT 'pending' CHECK ("status" IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    "subtotal" numeric(10,2) NOT NULL DEFAULT 0,
    "shipping_cost" numeric(10,2) NOT NULL DEFAULT 0,
    "discount" numeric(10,2) NOT NULL DEFAULT 0,
    "tax" numeric(10,2) NOT NULL DEFAULT 0,
    "total" numeric(10,2) NOT NULL DEFAULT 0,
    "shipping_method" "text" DEFAULT 'free' CHECK ("shipping_method" IN ('free', 'express', 'pickup')),
    "coupon_code" "text",
    "shipping_first_name" "text" NOT NULL,
    "shipping_last_name" "text" NOT NULL,
    "shipping_phone" "text" NOT NULL,
    "shipping_email" "text" NOT NULL,
    "shipping_street_address" "text" NOT NULL,
    "shipping_city" "text" NOT NULL,
    "shipping_state" "text" NOT NULL,
    "shipping_zip_code" "text" NOT NULL,
    "shipping_country" "text" NOT NULL,
    "tracking_number" "text",
    "notes" "text",
    "refund_status" "text" DEFAULT 'none' CHECK ("refund_status" IN ('none', 'requested', 'approved', 'rejected')),
    "refund_request_reason" "text",
    "refund_requested_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    PRIMARY KEY ("id")
);


CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL REFERENCES "public"."orders"("id") ON DELETE CASCADE,
    "product_id" "uuid" NOT NULL REFERENCES "public"."products"("id") ON DELETE SET NULL,
    "product_name" "text" NOT NULL,
    "product_image" "text",
    "color" "text",
    "quantity" integer NOT NULL CHECK ("quantity" >= 1),
    "unit_price" numeric(10,2) NOT NULL,
    "total_price" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    PRIMARY KEY ("id")
);


CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL REFERENCES "public"."orders"("id") ON DELETE CASCADE,
    "user_id" "uuid" NOT NULL,
    "payment_method" "text" NOT NULL CHECK ("payment_method" IN ('card', 'paypal', 'cod')),
    "status" "text" NOT NULL DEFAULT 'pending' CHECK ("status" IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    "amount" numeric(10,2) NOT NULL,
    "currency" "text" NOT NULL DEFAULT 'USD',
    "transaction_id" "text",
    "card_last_four" "text",
    "card_brand" "text",
    "payment_date" timestamp with time zone,
    "refund_amount" numeric(10,2) DEFAULT 0,
    "refund_date" timestamp with time zone,
    "refund_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    PRIMARY KEY ("id")
);


CREATE INDEX IF NOT EXISTS "idx_cart_user_id" ON "public"."cart" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_wishlist_user_id" ON "public"."wishlist" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_orders_user_id" ON "public"."orders" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_orders_status" ON "public"."orders" ("status");
CREATE INDEX IF NOT EXISTS "idx_orders_order_code" ON "public"."orders" ("order_code");
CREATE INDEX IF NOT EXISTS "idx_order_items_order_id" ON "public"."order_items" ("order_id");
CREATE INDEX IF NOT EXISTS "idx_payments_order_id" ON "public"."payments" ("order_id");
CREATE INDEX IF NOT EXISTS "idx_payments_user_id" ON "public"."payments" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_addresses_user_id" ON "public"."user_addresses" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_products_status" ON "public"."products" ("status");
CREATE INDEX IF NOT EXISTS "idx_products_category" ON "public"."products" USING GIN ("category");
CREATE INDEX IF NOT EXISTS "idx_coupons_code" ON "public"."coupons" ("code");


ALTER TABLE "public"."user_addresses" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own addresses" ON "public"."user_addresses" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own addresses" ON "public"."user_addresses" FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own addresses" ON "public"."user_addresses" FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own addresses" ON "public"."user_addresses" FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE "public"."cart" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own cart" ON "public"."cart" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cart items" ON "public"."cart" FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cart items" ON "public"."cart" FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cart items" ON "public"."cart" FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE "public"."wishlist" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own wishlist" ON "public"."wishlist" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wishlist items" ON "public"."wishlist" FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own wishlist items" ON "public"."wishlist" FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE "public"."coupons" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active coupons" ON "public"."coupons" FOR SELECT USING (is_active = true);

ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON "public"."orders" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON "public"."orders" FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own orders" ON "public"."orders" FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own order items" ON "public"."order_items" FOR SELECT
    USING (EXISTS (SELECT 1 FROM "public"."orders" WHERE "orders"."id" = "order_items"."order_id" AND "orders"."user_id" = auth.uid()));
CREATE POLICY "Users can insert own order items" ON "public"."order_items" FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM "public"."orders" WHERE "orders"."id" = "order_items"."order_id" AND "orders"."user_id" = auth.uid()));

ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payments" ON "public"."payments" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON "public"."payments" FOR INSERT WITH CHECK (auth.uid() = user_id);


GRANT ALL ON "public"."user_addresses" TO "anon", "authenticated", "service_role";
GRANT ALL ON "public"."cart" TO "anon", "authenticated", "service_role";
GRANT ALL ON "public"."wishlist" TO "anon", "authenticated", "service_role";
GRANT ALL ON "public"."coupons" TO "anon", "authenticated", "service_role";
GRANT ALL ON "public"."orders" TO "anon", "authenticated", "service_role";
GRANT ALL ON "public"."order_items" TO "anon", "authenticated", "service_role";
GRANT ALL ON "public"."payments" TO "anon", "authenticated", "service_role";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updated_at" = "now"();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER "update_products_updated_at" BEFORE UPDATE ON "public"."products"
    FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE OR REPLACE TRIGGER "update_cart_updated_at" BEFORE UPDATE ON "public"."cart"
    FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE OR REPLACE TRIGGER "update_user_addresses_updated_at" BEFORE UPDATE ON "public"."user_addresses"
    FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE OR REPLACE TRIGGER "update_orders_updated_at" BEFORE UPDATE ON "public"."orders"
    FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE OR REPLACE TRIGGER "update_payments_updated_at" BEFORE UPDATE ON "public"."payments"
    FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();
