-- Update the status check constraint to include 'cancelled'
ALTER TABLE project_runs DROP CONSTRAINT IF EXISTS project_runs_status_check;
ALTER TABLE project_runs ADD CONSTRAINT project_runs_status_check 
  CHECK (status IN ('not-started', 'in-progress', 'complete', 'cancelled'));

-- Update the order of kickoff steps in standard project template_operations
-- Step 1: Project Overview (Review Project Details)
-- Step 2: DIY Profile (Complete DIY Assessment)  
-- Step 3: Project Profile (Set Up Project)

UPDATE template_operations
SET display_order = 1
WHERE project_id = '00000000-0000-0000-0000-000000000001'
  AND name = 'Review Project Details';

UPDATE template_operations
SET display_order = 2
WHERE project_id = '00000000-0000-0000-0000-000000000001'
  AND name = 'Complete DIY Assessment';

UPDATE template_operations
SET display_order = 3
WHERE project_id = '00000000-0000-0000-0000-000000000001'
  AND name = 'Set Up Project';

-- Rebuild phases JSON for all projects to cascade the order change
DO $$
DECLARE
  project_record RECORD;
  rebuilt_phases JSONB;
BEGIN
  FOR project_record IN SELECT id FROM projects LOOP
    rebuilt_phases := rebuild_phases_json_from_templates(project_record.id);
    
    UPDATE projects
    SET phases = rebuilt_phases,
        updated_at = NOW()
    WHERE id = project_record.id;
  END LOOP;
END $$;

-- Also update project_runs with the new phase structure
DO $$
DECLARE
  run_record RECORD;
  template_phases JSONB;
BEGIN
  FOR run_record IN SELECT id, template_id FROM project_runs WHERE status != 'archived' LOOP
    -- Get the template phases
    SELECT phases INTO template_phases
    FROM projects
    WHERE id = run_record.template_id;
    
    -- Update the run with template phases structure
    IF template_phases IS NOT NULL THEN
      UPDATE project_runs
      SET phases = template_phases,
          updated_at = NOW()
      WHERE id = run_record.id;
    END IF;
  END LOOP;
END $$;