-- Add weight field at variant level (separate from attributes)
-- This allows capturing specific weights for each variant (e.g., 10lb vs 5lb hammer)

-- First check if the column already exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'variation_instances' 
                   AND column_name = 'weight_lbs') THEN
        ALTER TABLE public.variation_instances 
        ADD COLUMN weight_lbs NUMERIC(8,2);
    END IF;
END $$;