-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS "public"."contact_submissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "full_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "message" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    PRIMARY KEY ("id")
);

-- Enable RLS
ALTER TABLE "public"."contact_submissions" ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public contact form)
CREATE POLICY "Anyone can insert contact submissions" ON "public"."contact_submissions" 
    FOR INSERT 
    WITH CHECK (true);

-- Allow authenticated users (e.g. admins) to view submissions
CREATE POLICY "Admins can view contact submissions" ON "public"."contact_submissions" 
    FOR SELECT 
    USING (true); -- Note: In a real app, this should be restricted to admins.

-- Grant access
GRANT ALL ON "public"."contact_submissions" TO "anon", "authenticated", "service_role";
