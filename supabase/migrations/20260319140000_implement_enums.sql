-- 1. Create Enum Types
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE "public"."user_role" AS ENUM ('user', 'admin');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_category') THEN
        CREATE TYPE "public"."product_category" AS ENUM (
            'Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Dinning', 'Outdoor'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_color') THEN
        CREATE TYPE "public"."product_color" AS ENUM (
            'Black', 'White', 'Brown', 'Red', 'Blue', 'Green', 'Gray', 'Beige', 
            'Navy', 'Pink', 'Yellow', 'Orange', 'Purple', 'Cream', 'Walnut', 'Natural'
        );
    END IF;
END $$;

-- 2. Update user_profiles.role
-- Drop any existing check constraints on the role column to avoid operator errors
DO $$ 
DECLARE 
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = '"public"."user_profiles"'::regclass 
          AND contype = 'c' 
          AND pg_get_constraintdef(oid) LIKE '%role%'
    LOOP
        EXECUTE 'ALTER TABLE "public"."user_profiles" DROP CONSTRAINT IF EXISTS ' || quote_ident(constraint_record.conname);
    END LOOP;
END $$;

ALTER TABLE "public"."user_profiles" 
    ALTER COLUMN "role" DROP DEFAULT;

ALTER TABLE "public"."user_profiles" 
    ALTER COLUMN "role" TYPE "public"."user_role" USING "role"::"public"."user_role";

ALTER TABLE "public"."user_profiles" 
    ALTER COLUMN "role" SET DEFAULT 'user';

-- 3. Update products.category (Convert text[] to product_category[])
-- Drop any existing check constraints that might interfere
DO $$ 
DECLARE 
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = '"public"."products"'::regclass 
          AND contype = 'c' 
          AND (pg_get_constraintdef(oid) LIKE '%category%' OR pg_get_constraintdef(oid) LIKE '%color%')
    LOOP
        EXECUTE 'ALTER TABLE "public"."products" DROP CONSTRAINT IF EXISTS ' || quote_ident(constraint_record.conname);
    END LOOP;
END $$;

-- First drop the GIN index if it exists
DROP INDEX IF EXISTS "public"."idx_products_category";

-- Clean up invalid categories inside the array before altering
CREATE OR REPLACE FUNCTION filter_product_categories(cats text[]) RETURNS text[] AS $$
DECLARE
    valid_cats text[] := ARRAY['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Dinning', 'Outdoor'];
    result text[] := '{}';
    c text;
BEGIN
    IF cats IS NULL THEN RETURN '{}'; END IF;
    FOREACH c IN ARRAY cats LOOP
        IF c = ANY(valid_cats) THEN
            result := array_append(result, c);
        END IF;
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

UPDATE "public"."products" SET "category" = filter_product_categories("category");

ALTER TABLE "public"."products" 
    ALTER COLUMN "category" DROP DEFAULT;

ALTER TABLE "public"."products" 
    ALTER COLUMN "category" TYPE "public"."product_category"[] 
    USING "category"::"public"."product_category"[];

ALTER TABLE "public"."products" 
    ALTER COLUMN "category" SET DEFAULT '{}'::"public"."product_category"[];

DROP FUNCTION filter_product_categories(text[]);

-- 4. Update products.color (Convert text[] to product_color[])
CREATE OR REPLACE FUNCTION filter_product_colors(colors text[]) RETURNS text[] AS $$
DECLARE
    valid_colors text[] := ARRAY['Black', 'White', 'Brown', 'Red', 'Blue', 'Green', 'Gray', 'Beige', 'Navy', 'Pink', 'Yellow', 'Orange', 'Purple', 'Cream', 'Walnut', 'Natural'];
    result text[] := '{}';
    c text;
BEGIN
    IF colors IS NULL THEN RETURN '{}'; END IF;
    FOREACH c IN ARRAY colors LOOP
        IF c = ANY(valid_colors) THEN
            result := array_append(result, c);
        END IF;
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

UPDATE "public"."products" SET "color" = filter_product_colors("color");

ALTER TABLE "public"."products" 
    ALTER COLUMN "color" DROP DEFAULT;

ALTER TABLE "public"."products" 
    ALTER COLUMN "color" TYPE "public"."product_color"[] 
    USING "color"::"public"."product_color"[];

ALTER TABLE "public"."products" 
    ALTER COLUMN "color" SET DEFAULT '{}'::"public"."product_color"[];

DROP FUNCTION filter_product_colors(text[]);

-- 5. Update cart.color (Convert text to product_color)
UPDATE "public"."cart" 
SET "color" = NULL 
WHERE "color" NOT IN ('Black', 'White', 'Brown', 'Red', 'Blue', 'Green', 'Gray', 'Beige', 'Navy', 'Pink', 'Yellow', 'Orange', 'Purple', 'Cream', 'Walnut', 'Natural');

ALTER TABLE "public"."cart" 
    ALTER COLUMN "color" TYPE "public"."product_color" USING "color"::"public"."product_color";

-- 6. Update order_items.color (Convert text to product_color)
UPDATE "public"."order_items"
SET "color" = NULL
WHERE "color" NOT IN ('Black', 'White', 'Brown', 'Red', 'Blue', 'Green', 'Gray', 'Beige', 'Navy', 'Pink', 'Yellow', 'Orange', 'Purple', 'Cream', 'Walnut', 'Natural');

ALTER TABLE "public"."order_items" 
    ALTER COLUMN "color" TYPE "public"."product_color" USING "color"::"public"."product_color";

-- 7. Recreate GIN index for category
CREATE INDEX IF NOT EXISTS "idx_products_category" ON "public"."products" USING GIN ("category");

-- 7. Recreate GIN index for category if needed (using array ops)
CREATE INDEX IF NOT EXISTS "idx_products_category" ON "public"."products" USING GIN ("category");
