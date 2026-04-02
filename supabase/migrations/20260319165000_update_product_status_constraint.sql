-- Drop the existing constraint if it exists
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_status_check;

-- Add a more flexible constraint that includes 'inactive'
ALTER TABLE public.products ADD CONSTRAINT products_status_check CHECK (status IN ('active', 'inactive', 'draft', 'archived'));
