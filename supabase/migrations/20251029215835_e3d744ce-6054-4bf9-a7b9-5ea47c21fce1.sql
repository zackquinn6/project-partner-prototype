-- REBUILD FROM SCRATCH: Delete all projects and project runs except Standard Project
-- Delete in the correct order to respect foreign key constraints

-- 1. Delete all project runs first (due to foreign key constraints)
DELETE FROM project_runs;

-- 2. Delete template data for non-standard projects (in correct order)
DELETE FROM template_steps 
WHERE operation_id IN (
  SELECT id FROM template_operations 
  WHERE project_id != '00000000-0000-0000-0000-000000000001'
);

DELETE FROM template_operations 
WHERE project_id != '00000000-0000-0000-0000-000000000001';

-- 3. Delete all projects except the Standard Project Foundation
DELETE FROM projects 
WHERE id != '00000000-0000-0000-0000-000000000001';

-- 4. Log the cleanup
INSERT INTO security_events_log (event_type, severity, description, additional_data)
VALUES (
  'system_rebuild',
  'high',
  'System rebuild: All projects and project runs deleted except Standard Project',
  jsonb_build_object(
    'action', 'full_rebuild',
    'timestamp', now()
  )
);