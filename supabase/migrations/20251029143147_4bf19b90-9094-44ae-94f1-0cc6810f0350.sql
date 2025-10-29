-- Add signed agreement fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS signed_agreement JSONB,
ADD COLUMN IF NOT EXISTS agreement_signed_at TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.signed_agreement IS 'Stores signed service agreement details including signature and version';
COMMENT ON COLUMN public.profiles.agreement_signed_at IS 'Timestamp when the agreement was signed';