ALTER TABLE "public"."product_reviews" ALTER COLUMN "user_id" SET DEFAULT auth.uid();
ALTER TABLE "public"."review_likes" ALTER COLUMN "user_id" SET DEFAULT auth.uid();
ALTER TABLE "public"."review_replies" ALTER COLUMN "user_id" SET DEFAULT auth.uid();

-- Ensure RLS is enabled
ALTER TABLE "public"."product_reviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."review_likes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."review_replies" ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON "public"."product_reviews" TO "anon", "authenticated", "service_role";
GRANT ALL ON "public"."review_likes" TO "anon", "authenticated", "service_role";
GRANT ALL ON "public"."review_replies" TO "anon", "authenticated", "service_role";

-- RLS Policies for product_reviews
DROP POLICY IF EXISTS "Anyone can read product_reviews" ON "public"."product_reviews";
CREATE POLICY "Anyone can read product_reviews" ON "public"."product_reviews"
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert product_reviews" ON "public"."product_reviews";
CREATE POLICY "Authenticated users can insert product_reviews" ON "public"."product_reviews"
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own product_reviews" ON "public"."product_reviews";
CREATE POLICY "Users can update own product_reviews" ON "public"."product_reviews"
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own product_reviews" ON "public"."product_reviews";
CREATE POLICY "Users can delete own product_reviews" ON "public"."product_reviews"
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for review_likes
DROP POLICY IF EXISTS "Anyone can read review_likes" ON "public"."review_likes";
CREATE POLICY "Anyone can read review_likes" ON "public"."review_likes"
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert review_likes" ON "public"."review_likes";
CREATE POLICY "Authenticated users can insert review_likes" ON "public"."review_likes"
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete own review_likes" ON "public"."review_likes";
CREATE POLICY "Users can delete own review_likes" ON "public"."review_likes"
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for review_replies
DROP POLICY IF EXISTS "Anyone can read review_replies" ON "public"."review_replies";
CREATE POLICY "Anyone can read review_replies" ON "public"."review_replies"
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert review_replies" ON "public"."review_replies";
CREATE POLICY "Authenticated users can insert review_replies" ON "public"."review_replies"
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own review_replies" ON "public"."review_replies";
CREATE POLICY "Users can update own review_replies" ON "public"."review_replies"
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own review_replies" ON "public"."review_replies";
CREATE POLICY "Users can delete own review_replies" ON "public"."review_replies"
    FOR DELETE USING (auth.uid() = user_id);
