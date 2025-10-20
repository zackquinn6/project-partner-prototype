-- Create step_instructions table for 3-level instruction system
CREATE TABLE IF NOT EXISTS public.step_instructions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_step_id UUID NOT NULL REFERENCES public.template_steps(id) ON DELETE CASCADE,
  instruction_level TEXT NOT NULL CHECK (instruction_level IN ('quick', 'detailed', 'contractor')),
  content JSONB NOT NULL DEFAULT '{
    "text": "",
    "sections": [],
    "photos": [],
    "videos": [],
    "links": []
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(template_step_id, instruction_level)
);

-- Create index for faster lookups
CREATE INDEX idx_step_instructions_template_step ON public.step_instructions(template_step_id);
CREATE INDEX idx_step_instructions_level ON public.step_instructions(instruction_level);

-- Enable RLS
ALTER TABLE public.step_instructions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Everyone can view step instructions"
  ON public.step_instructions FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage step instructions"
  ON public.step_instructions FOR ALL
  USING (is_admin(auth.uid()));

-- Add instruction_level_preference to project_runs (defaults to detailed for max detail)
ALTER TABLE public.project_runs 
ADD COLUMN IF NOT EXISTS instruction_level_preference TEXT DEFAULT 'detailed' 
CHECK (instruction_level_preference IN ('quick', 'detailed', 'contractor'));

-- Add trigger for updated_at
CREATE TRIGGER update_step_instructions_updated_at
  BEFORE UPDATE ON public.step_instructions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.step_instructions IS 'Stores 3-level instructions (quick, detailed, contractor) for each template step with rich content support';
COMMENT ON COLUMN public.step_instructions.instruction_level IS 'Level of detail: quick (overview), detailed (standard), contractor (expert)';
COMMENT ON COLUMN public.step_instructions.content IS 'Rich content structure supporting text, sections, photos, videos, and links';
COMMENT ON COLUMN public.project_runs.instruction_level_preference IS 'User-selected instruction detail level for this project run';