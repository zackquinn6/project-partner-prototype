-- Add dependent_on column to template_operations for dependent flow type
ALTER TABLE public.template_operations 
ADD COLUMN IF NOT EXISTS dependent_on UUID REFERENCES template_operations(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_template_operations_dependent_on 
ON public.template_operations(dependent_on);

-- Add comment
COMMENT ON COLUMN public.template_operations.dependent_on IS 'ID of the if-necessary operation that this dependent operation depends on';