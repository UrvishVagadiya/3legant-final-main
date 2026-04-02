-- Add likes_count column to product_reviews
ALTER TABLE "public"."product_reviews" ADD COLUMN IF NOT EXISTS "likes_count" integer DEFAULT 0;

-- Initialize likes_count for existing reviews
UPDATE "public"."product_reviews" pr
SET "likes_count" = (
    SELECT count(*)
    FROM "public"."review_likes" rl
    WHERE rl.review_id = pr.id
);

-- Trigger function to update likes_count
CREATE OR REPLACE FUNCTION "public"."update_review_likes_count"()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE "public"."product_reviews"
        SET "likes_count" = "likes_count" + 1
        WHERE "id" = NEW."review_id";
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE "public"."product_reviews"
        SET "likes_count" = "likes_count" - 1
        WHERE "id" = OLD."review_id";
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger on review_likes
DROP TRIGGER IF EXISTS "tr_update_review_likes_count" ON "public"."review_likes";
CREATE TRIGGER "tr_update_review_likes_count"
AFTER INSERT OR DELETE ON "public"."review_likes"
FOR EACH ROW EXECUTE FUNCTION "public"."update_review_likes_count"();
