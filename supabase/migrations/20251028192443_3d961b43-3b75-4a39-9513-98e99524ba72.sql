-- Add step_type column to template_steps (separate from flow_type)
ALTER TABLE public.template_steps 
ADD COLUMN step_type TEXT DEFAULT 'prime' CHECK (step_type IN ('prime', 'scaled', 'quality_control'));

-- Remove estimated_time_minutes as we're using variableTime instead
ALTER TABLE public.template_steps 
DROP COLUMN IF EXISTS estimated_time_minutes;

-- Add comment explaining the difference between flow_type and step_type
COMMENT ON COLUMN public.template_steps.flow_type IS 'Decision tree branching: prime (required), alternate (option), if_necessary (conditional)';
COMMENT ON COLUMN public.template_steps.step_type IS 'Step execution type: prime (one-time), scaled (per unit), quality_control (inspection)';

-- For incorporated phases, add source_project_id and source_scaling_unit tracking
-- This will be stored in the phases jsonb in projects table, not as separate columns