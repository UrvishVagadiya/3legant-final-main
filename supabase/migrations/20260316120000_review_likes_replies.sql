CREATE TABLE IF NOT EXISTS "public"."review_likes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "review_id" "uuid" NOT NULL REFERENCES "public"."product_reviews"("id") ON DELETE CASCADE,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    PRIMARY KEY ("id"),
    UNIQUE ("review_id", "user_id")
);

CREATE TABLE IF NOT EXISTS "public"."review_replies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "review_id" "uuid" NOT NULL REFERENCES "public"."product_reviews"("id") ON DELETE CASCADE,
    "user_id" "uuid" NOT NULL,
    "user_name" "text" NOT NULL DEFAULT 'Anonymous',
    "reply" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    PRIMARY KEY ("id")
);

ALTER TABLE "public"."review_likes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."review_replies" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON "public"."review_likes" TO "anon", "authenticated", "service_role";
GRANT ALL ON "public"."review_replies" TO "anon", "authenticated", "service_role";
