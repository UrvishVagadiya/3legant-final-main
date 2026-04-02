-- Create blogs table
CREATE TABLE IF NOT EXISTS "public"."blogs" (
    "id" integer PRIMARY KEY,
    "title" "text" NOT NULL,
    "img" "text" NOT NULL,
    "date" "text" NOT NULL,
    "timestamp" numeric NOT NULL,
    "description" "text" NOT NULL,
    "content" "text" NOT NULL,
    "author" "text" NOT NULL DEFAULT 'admin',
    "created_at" timestamp with time zone DEFAULT "now"()
);

-- Enable RLS
ALTER TABLE "public"."blogs" ENABLE ROW LEVEL SECURITY;

-- Add public select policy
CREATE POLICY "Anyone can read blogs" ON "public"."blogs" FOR SELECT USING (true);

-- Add admin insert/update/delete policy (using service role or similar)
-- For now, allow all for authenticated if needed, but service role bypasses RLS
CREATE POLICY "Service role can do everything" ON "public"."blogs" FOR ALL USING (true);

-- Grant access
GRANT ALL ON "public"."blogs" TO "anon", "authenticated", "service_role";
