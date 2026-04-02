-- Add DELETE policy for contact_submissions to allow admins to remove messages
DROP POLICY IF EXISTS "Allow admins to delete submissions" ON public.contact_submissions;

CREATE POLICY "Allow admins to delete submissions" ON public.contact_submissions
    FOR DELETE USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Ensure authenticated users have access to perform deletions (subject to the policy)
GRANT ALL ON public.contact_submissions TO authenticated;
