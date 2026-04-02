ALTER TABLE "public"."orders" 
ADD COLUMN IF NOT EXISTS "refund_status" "text" DEFAULT 'none' CHECK ("refund_status" IN ('none', 'requested', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS "refund_request_reason" "text",
ADD COLUMN IF NOT EXISTS "refund_requested_at" timestamp with time zone;
