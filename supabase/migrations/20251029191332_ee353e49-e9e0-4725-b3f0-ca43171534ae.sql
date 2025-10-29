-- Function to cascade Standard Project template changes to all project templates
CREATE OR REPLACE FUNCTION cascade_standard_template_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected_operation_id uuid;
  standard_project_id uuid := '00000000-0000-0000-0000-000000000001';
  project_template record;
  rebuilt_phases jsonb;
BEGIN
  -- Only run if this is the Standard Project
  IF TG_TABLE_NAME = 'template_steps' THEN
    -- Get the operation_id
    IF TG_OP = 'DELETE' THEN
      affected_operation_id := OLD.operation_id;
    ELSE
      affected_operation_id := NEW.operation_id;
    END IF;
    
    -- Check if this operation belongs to Standard Project
    IF NOT EXISTS (
      SELECT 1 FROM template_operations 
      WHERE id = affected_operation_id 
        AND project_id = standard_project_id
    ) THEN
      -- Not a standard project operation, skip
      IF TG_OP = 'DELETE' THEN
        RETURN OLD;
      ELSE
        RETURN NEW;
      END IF;
    END IF;
  ELSIF TG_TABLE_NAME = 'template_operations' THEN
    -- Check if this is a standard project operation
    IF TG_OP = 'DELETE' THEN
      IF OLD.project_id != standard_project_id THEN
        RETURN OLD;
      END IF;
    ELSE
      IF NEW.project_id != standard_project_id THEN
        RETURN NEW;
      END IF;
    END IF;
  END IF;
  
  -- Update all project templates (not runs, not the standard project itself)
  FOR project_template IN
    SELECT id FROM projects 
    WHERE is_standard_template = false 
      AND parent_project_id IS NULL
      AND id != standard_project_id
  LOOP
    -- Rebuild phases JSON for this template
    rebuilt_phases := rebuild_phases_json_from_templates(project_template.id);
    
    -- Update the template
    UPDATE projects
    SET phases = rebuilt_phases,
        updated_at = now()
    WHERE id = project_template.id;
  END LOOP;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS cascade_standard_updates_on_steps ON template_steps;
DROP TRIGGER IF EXISTS cascade_standard_updates_on_operations ON template_operations;

-- Create trigger for template_steps changes
CREATE TRIGGER cascade_standard_updates_on_steps
AFTER INSERT OR UPDATE OR DELETE ON template_steps
FOR EACH ROW
EXECUTE FUNCTION cascade_standard_template_updates();

-- Create trigger for template_operations changes  
CREATE TRIGGER cascade_standard_updates_on_operations
AFTER INSERT OR UPDATE OR DELETE ON template_operations
FOR EACH ROW
EXECUTE FUNCTION cascade_standard_template_updates();

-- Log this improvement
SELECT log_comprehensive_security_event(
  'standard_phase_cascade_improved',
  'medium',
  'Added automatic cascading of Standard Project changes to all project templates',
  auth.uid(),
  NULL, NULL, NULL,
  jsonb_build_object(
    'action', 'create_cascade_triggers',
    'scope', 'all_project_templates'
  )
);