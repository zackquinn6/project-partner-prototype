-- Create PFMEA module tables

-- Main PFMEA table linking to projects
CREATE TABLE public.pfmea_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'complete'))
);

-- PFMEA Requirements (sync with project outputs)
CREATE TABLE public.pfmea_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pfmea_project_id UUID NOT NULL REFERENCES public.pfmea_projects(id) ON DELETE CASCADE,
  process_step_id TEXT NOT NULL, -- References step ID from project phases/operations/steps
  requirement_text TEXT NOT NULL,
  output_reference JSONB, -- Store reference to project output
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- PFMEA Failure Modes
CREATE TABLE public.pfmea_failure_modes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_id UUID NOT NULL REFERENCES public.pfmea_requirements(id) ON DELETE CASCADE,
  failure_mode TEXT NOT NULL,
  severity_score INTEGER CHECK (severity_score >= 1 AND severity_score <= 10),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- PFMEA Potential Effects
CREATE TABLE public.pfmea_potential_effects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  failure_mode_id UUID NOT NULL REFERENCES public.pfmea_failure_modes(id) ON DELETE CASCADE,
  effect_description TEXT NOT NULL,
  severity_score INTEGER NOT NULL CHECK (severity_score >= 1 AND severity_score <= 10),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- PFMEA Potential Causes
CREATE TABLE public.pfmea_potential_causes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  failure_mode_id UUID NOT NULL REFERENCES public.pfmea_failure_modes(id) ON DELETE CASCADE,
  cause_description TEXT NOT NULL,
  occurrence_score INTEGER NOT NULL CHECK (occurrence_score >= 1 AND occurrence_score <= 10),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- PFMEA Controls (both prevention and detection)
CREATE TABLE public.pfmea_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  failure_mode_id UUID REFERENCES public.pfmea_failure_modes(id) ON DELETE CASCADE, -- failure-mode-level controls
  cause_id UUID REFERENCES public.pfmea_potential_causes(id) ON DELETE CASCADE, -- cause-level controls
  control_type TEXT NOT NULL CHECK (control_type IN ('prevention', 'detection')),
  control_description TEXT NOT NULL,
  detection_score INTEGER CHECK (detection_score >= 1 AND detection_score <= 10), -- Only for detection controls
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT pfmea_controls_reference_check CHECK (
    (failure_mode_id IS NOT NULL AND cause_id IS NULL) OR 
    (failure_mode_id IS NULL AND cause_id IS NOT NULL)
  )
);

-- PFMEA Action Items
CREATE TABLE public.pfmea_action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  failure_mode_id UUID NOT NULL REFERENCES public.pfmea_failure_modes(id) ON DELETE CASCADE,
  recommended_action TEXT NOT NULL,
  responsible_person TEXT,
  target_completion_date DATE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'complete')),
  completion_notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.pfmea_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pfmea_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pfmea_failure_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pfmea_potential_effects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pfmea_potential_causes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pfmea_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pfmea_action_items ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies
CREATE POLICY "Admins can manage PFMEA projects" ON public.pfmea_projects FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage PFMEA requirements" ON public.pfmea_requirements FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage PFMEA failure modes" ON public.pfmea_failure_modes FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage PFMEA potential effects" ON public.pfmea_potential_effects FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage PFMEA potential causes" ON public.pfmea_potential_causes FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage PFMEA controls" ON public.pfmea_controls FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage PFMEA action items" ON public.pfmea_action_items FOR ALL USING (is_admin(auth.uid()));

-- Triggers for updating timestamps
CREATE TRIGGER update_pfmea_projects_updated_at BEFORE UPDATE ON public.pfmea_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pfmea_requirements_updated_at BEFORE UPDATE ON public.pfmea_requirements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pfmea_failure_modes_updated_at BEFORE UPDATE ON public.pfmea_failure_modes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pfmea_potential_effects_updated_at BEFORE UPDATE ON public.pfmea_potential_effects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pfmea_potential_causes_updated_at BEFORE UPDATE ON public.pfmea_potential_causes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pfmea_controls_updated_at BEFORE UPDATE ON public.pfmea_controls FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pfmea_action_items_updated_at BEFORE UPDATE ON public.pfmea_action_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helper function to calculate RPN
CREATE OR REPLACE FUNCTION public.calculate_pfmea_rpn(failure_mode_uuid uuid)
RETURNS INTEGER
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH failure_mode_data AS (
    -- Get max severity from effects
    SELECT 
      fm.id,
      COALESCE(MAX(pe.severity_score), fm.severity_score) as max_severity
    FROM pfmea_failure_modes fm
    LEFT JOIN pfmea_potential_effects pe ON pe.failure_mode_id = fm.id
    WHERE fm.id = failure_mode_uuid
    GROUP BY fm.id, fm.severity_score
  ),
  cause_occurrence AS (
    -- Get occurrence scores from causes
    SELECT 
      pc.failure_mode_id,
      pc.occurrence_score
    FROM pfmea_potential_causes pc
    WHERE pc.failure_mode_id = failure_mode_uuid
  ),
  detection_scores AS (
    -- Get minimum detection score across all controls
    SELECT 
      fm.id as failure_mode_id,
      MIN(c.detection_score) as min_detection
    FROM pfmea_failure_modes fm
    LEFT JOIN pfmea_controls c ON (c.failure_mode_id = fm.id OR c.cause_id IN (
      SELECT pc.id FROM pfmea_potential_causes pc WHERE pc.failure_mode_id = fm.id
    ))
    WHERE fm.id = failure_mode_uuid AND c.control_type = 'detection' AND c.detection_score IS NOT NULL
    GROUP BY fm.id
  )
  SELECT 
    (fmd.max_severity * co.occurrence_score * COALESCE(ds.min_detection, 10))::INTEGER as rpn
  FROM failure_mode_data fmd
  CROSS JOIN cause_occurrence co
  LEFT JOIN detection_scores ds ON ds.failure_mode_id = fmd.id
  LIMIT 1;
$$;