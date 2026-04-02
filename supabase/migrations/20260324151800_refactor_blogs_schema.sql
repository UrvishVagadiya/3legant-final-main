-- Refactor blogs table: remove description/timestamp and modernize date column
-- 1. Remove description and timestamp columns
ALTER TABLE blogs DROP COLUMN IF EXISTS description;
ALTER TABLE blogs DROP COLUMN IF EXISTS timestamp;

-- 2. Convert date column from text to timestamptz
-- (Existing text dates will be automatically parsed if possible)
ALTER TABLE blogs 
ALTER COLUMN date TYPE timestamptz 
USING (
    CASE 
        WHEN date IS NULL OR date = '' THEN now()
        ELSE date::timestamptz 
    END
);

-- 3. Set default to current time for new entries
ALTER TABLE blogs ALTER COLUMN date SET DEFAULT now();
