-- Add reference_specification column to outputs table
ALTER TABLE public.outputs 
ADD COLUMN reference_specification TEXT;

-- Add comment to document the purpose of the new field
COMMENT ON COLUMN public.outputs.reference_specification IS 'Formal location for specifications, e.g., International Building Code Section 2302';