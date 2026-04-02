-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to allow re-runs
DROP POLICY IF EXISTS "Allow anonymous insertions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Allow admins to view submissions" ON public.contact_submissions;

-- Allow anyone to insert contact submissions
CREATE POLICY "Allow anonymous insertions" ON public.contact_submissions
    FOR INSERT WITH CHECK (true);

-- Allow admins to view contact submissions
CREATE POLICY "Allow admins to view submissions" ON public.contact_submissions
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Grant access
GRANT ALL ON public.contact_submissions TO anon;
GRANT ALL ON public.contact_submissions TO authenticated;
GRANT ALL ON public.contact_submissions TO service_role;
