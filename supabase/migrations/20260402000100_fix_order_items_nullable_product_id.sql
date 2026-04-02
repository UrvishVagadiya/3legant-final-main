-- Allow product_id to be NULL when a product is deleted (ON DELETE SET NULL)
ALTER TABLE "public"."order_items" ALTER COLUMN "product_id" DROP NOT NULL;
