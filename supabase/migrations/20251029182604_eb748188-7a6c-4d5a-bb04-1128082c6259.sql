-- Fix search_path warnings for cascade functions

CREATE OR REPLACE FUNCTION public.cascade_standard_phase_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- If an operation is inserted/updated in the Standard Project
  IF NEW.project_id = '00000000-0000-0000-0000-000000000001' THEN
    -- Update matching operations in project TEMPLATES only (not project_runs)
    UPDATE template_operations
    SET description = NEW.description,
        user_prompt = NEW.user_prompt,
        flow_type = NEW.flow_type,
        updated_at = now()
    WHERE name = NEW.name
      AND standard_phase_id = NEW.standard_phase_id
      AND project_id != '00000000-0000-0000-0000-000000000001'
      AND project_id IN (SELECT id FROM projects WHERE is_standard_template = false);
    
    -- Rebuild phases JSON ONLY for project templates (not project_runs)
    UPDATE projects
    SET phases = rebuild_phases_json_from_templates(id),
        updated_at = now()
    WHERE publish_status != 'archived'
      AND is_standard_template = false
      AND id != '00000000-0000-0000-0000-000000000001';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.cascade_standard_phase_deletions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- If an operation is deleted from the Standard Project
  IF OLD.project_id = '00000000-0000-0000-0000-000000000001' THEN
    -- Delete matching operations from project TEMPLATES only (not project_runs)
    DELETE FROM template_operations
    WHERE name = OLD.name
      AND standard_phase_id = OLD.standard_phase_id
      AND project_id != '00000000-0000-0000-0000-000000000001'
      AND project_id IN (SELECT id FROM projects WHERE is_standard_template = false);
    
    -- Rebuild phases JSON ONLY for project templates (not project_runs)
    UPDATE projects
    SET phases = rebuild_phases_json_from_templates(id),
        updated_at = now()
    WHERE publish_status != 'archived'
      AND is_standard_template = false
      AND id != '00000000-0000-0000-0000-000000000001';
  END IF;
  
  RETURN OLD;
END;
$$;