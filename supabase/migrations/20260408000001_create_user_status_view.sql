CREATE OR REPLACE VIEW public.user_status AS
SELECT
  email,
  (email_confirmed_at IS NOT NULL) AS is_verified
FROM auth.users;

GRANT SELECT ON public.user_status TO anon;
