-- Enable RLS on products table if not already enabled
ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can read products" ON "public"."products";
DROP POLICY IF EXISTS "Admins can manage products" ON "public"."products";

-- Policy: Anyone can read active products
CREATE POLICY "Anyone can read products" ON "public"."products"
    FOR SELECT USING (true);

-- Policy: Admins can manage products (all actions)
CREATE POLICY "Admins can manage products" ON "public"."products"
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'::public.user_role
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'::public.user_role
        )
    );

-- Grant permissions
GRANT ALL ON "public"."products" TO "anon", "authenticated", "service_role";
