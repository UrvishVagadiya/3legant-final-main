ALTER TABLE public.blogs
ADD COLUMN IF NOT EXISTS category text;
