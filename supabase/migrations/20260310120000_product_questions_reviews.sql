-- Product Questions table
CREATE TABLE IF NOT EXISTS "public"."product_questions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL REFERENCES "public"."products"("id") ON DELETE CASCADE,
    "user_id" "uuid" NOT NULL,
    "user_name" "text" NOT NULL DEFAULT 'Anonymous',
    "question" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    PRIMARY KEY ("id")
);

-- Product Reviews table
CREATE TABLE IF NOT EXISTS "public"."product_reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL REFERENCES "public"."products"("id") ON DELETE CASCADE,
    "user_id" "uuid" NOT NULL,
    "user_name" "text" NOT NULL DEFAULT 'Anonymous',
    "rating" integer NOT NULL CHECK ("rating" >= 1 AND "rating" <= 5),
    "review" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    PRIMARY KEY ("id")
);

-- Enable RLS
ALTER TABLE "public"."product_questions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."product_reviews" ENABLE ROW LEVEL SECURITY;

-- Anyone can read questions and reviews


-- Authenticated users can insert their own

-- Grant access
GRANT ALL ON "public"."product_questions" TO "anon", "authenticated", "service_role";
GRANT ALL ON "public"."product_reviews" TO "anon", "authenticated", "service_role";
