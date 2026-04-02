-- Add color column to wishlist table
ALTER TABLE "public"."wishlist" ADD COLUMN IF NOT EXISTS "color" text;
