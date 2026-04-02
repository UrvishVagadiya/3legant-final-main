-- Create newsletter_subscriptions table
CREATE TABLE IF NOT EXISTS "public"."newsletter_subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL UNIQUE,
    "created_at" timestamp with time zone DEFAULT "now"(),
    PRIMARY KEY ("id")
);

-- Enable RLS
ALTER TABLE "public"."newsletter_subscriptions" ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public newsletter signup)
CREATE POLICY "Anyone can insert newsletter subscriptions" ON "public"."newsletter_subscriptions" 
    FOR INSERT 
    WITH CHECK (true);

-- Allow authenticated users (e.g. admins) to view subscriptions
CREATE POLICY "Admins can view newsletter subscriptions" ON "public"."newsletter_subscriptions" 
    FOR SELECT 
    USING (true);

-- Grant access
GRANT ALL ON "public"."newsletter_subscriptions" TO "anon", "authenticated", "service_role";
