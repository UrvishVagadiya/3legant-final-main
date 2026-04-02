-- ============================================================
-- USER PROFILES AND SIGNUP TRIGGER
-- ============================================================

-- 1. Create User Profiles table
CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" REFERENCES "auth"."users"("id") ON DELETE CASCADE NOT NULL,
    "email" "text",
    "full_name" "text",
    "display_name" "text",
    "avatar_url" "text",
    "role" "text" DEFAULT 'user' CHECK ("role" IN ('user', 'admin')),
    "created_at" timestamp- [x] Differentiate status in Admin Panel
    - [x] Create implementation plan
    - [x] Update admin orders API
    - [x] Update Admin Orders page
    - [x] Update OrderDetailModal.tsx
- [x] Verify functionality
    "updated_at" timestamp with time zone DEFAULT "now"(),
    PRIMARY KEY ("id")
);

-- 2. Create the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (
        id, email, full_name, display_name
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'name',
            NEW.raw_user_meta_data->>'full_name',
            'User'
        ),
        COALESCE(
            NEW.raw_user_meta_data->>'displayName',
            NEW.raw_user_meta_data->>'display_name',
            NEW.raw_user_meta_data->>'username',
            'User'
        )
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger on auth.users
DROP TRIGGER IF EXISTS "on_auth_user_created" ON "auth"."users";
CREATE TRIGGER "on_auth_user_created"
AFTER INSERT ON "auth"."users"
FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_user"();

-- 4. Enable RLS
ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;

-- 5. Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON "public"."user_profiles";
CREATE POLICY "Public profiles are viewable by everyone" ON "public"."user_profiles"
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON "public"."user_profiles";
CREATE POLICY "Users can update own profile" ON "public"."user_profiles"
    FOR UPDATE USING (auth.uid() = id);

-- 6. Grant Access
GRANT ALL ON "public"."user_profiles" TO "anon", "authenticated", "service_role";

-- 7. Add updated_at trigger if helper exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE TRIGGER "update_user_profiles_updated_at"
        BEFORE UPDATE ON "public"."user_profiles"
        FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Allow insert during signup"
ON public.user_profiles
FOR INSERT
WITH CHECK (true);