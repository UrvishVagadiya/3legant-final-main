-- Add foreign key constraints to link reviews and replies to user_profiles
-- This enables easier joining via Supabase/PostgREST

-- Sync any missing users from auth.users to public.user_profiles first
-- This prevents deleting reviews for valid users that are just missing a profile record
INSERT INTO "public"."user_profiles" (id, email, full_name, display_name)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name', 'User'),
    COALESCE(raw_user_meta_data->>'displayName', raw_user_meta_data->>'display_name', 'User')
FROM "auth"."users"
WHERE id NOT IN (SELECT id FROM "public"."user_profiles")
ON CONFLICT (id) DO NOTHING;

-- Clean up any remaining orphan records (where user_id really doesn't exist in auth.users either)
DELETE FROM "public"."product_reviews"
WHERE "user_id" NOT IN (SELECT "id" FROM "public"."user_profiles");

DELETE FROM "public"."review_replies"
WHERE "user_id" NOT IN (SELECT "id" FROM "public"."user_profiles");

-- Update product_reviews
ALTER TABLE "public"."product_reviews"
ADD CONSTRAINT "product_reviews_user_id_fkey"
FOREIGN KEY ("user_id")
REFERENCES "public"."user_profiles"("id")
ON DELETE CASCADE;

-- Update review_replies
ALTER TABLE "public"."review_replies"
ADD CONSTRAINT "review_replies_user_id_fkey"
FOREIGN KEY ("user_id")
REFERENCES "public"."user_profiles"("id")
ON DELETE CASCADE;
