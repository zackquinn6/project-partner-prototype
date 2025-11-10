
-- Fix: Ensure rebuild_phases_json_from_project_phases function exists and works correctly
CREATE OR REPLACE FUNCTION rebuild_phases_json_from_project_phases(p_project_id UUID)
RETURNS JSONB AS $$
DECLARE
  phases_json JSONB := '[]'::jsonb;
  phase_record RECORD;
  operations_json JSONB;
  operation_record RECORD;
  steps_json JSONB;
  step_record RECORD;
BEGIN
  -- Build phases JSON from project_phases, template_operations, and template_steps
  FOR phase_record IN
    SELECT * FROM project_phases
    WHERE project_id = p_project_id
    ORDER BY display_order
  LOOP
    -- Build operations array for this phase
    operations_json := '[]'::jsonb;
    
    FOR operation_record IN
      SELECT * FROM template_operations
      WHERE project_id = p_project_id AND phase_id = phase_record.id
      ORDER BY display_order
    LOOP
      -- Build steps array for this operation
      steps_json := '[]'::jsonb;
      
      FOR step_record IN
        SELECT * FROM template_steps
        WHERE operation_id = operation_record.id
        ORDER BY display_order
      LOOP
        steps_json := steps_json || jsonb_build_object(
          'id', step_record.id,
          'step', step_record.step_title,
          'description', step_record.description,
          'estimatedTime', COALESCE(step_record.estimated_time_minutes, 0),
          'materials', COALESCE(step_record.materials, '[]'::jsonb),
          'tools', COALESCE(step_record.tools, '[]'::jsonb),
          'outputs', COALESCE(step_record.outputs, '[]'::jsonb),
          'apps', COALESCE(step_record.apps, '[]'::jsonb),
          'content', COALESCE(step_record.content_sections, '[]'::jsonb),
          'contentType', 'multi',
          'flowType', COALESCE(step_record.flow_type, 'prime'),
          'isStandard', phase_record.is_standard
        );
      END LOOP;
      
      operations_json := operations_json || jsonb_build_object(
        'id', operation_record.id,
        'name', operation_record.name,
        'description', operation_record.description,
        'steps', steps_json,
        'flowType', COALESCE(operation_record.flow_type, 'prime'),
        'isStandard', phase_record.is_standard
      );
    END LOOP;
    
    phases_json := phases_json || jsonb_build_object(
      'id', phase_record.id,
      'name', phase_record.name,
      'description', phase_record.description,
      'operations', operations_json,
      'isStandard', phase_record.is_standard
    );
  END LOOP;
  
  RETURN phases_json;
END;
$$ LANGUAGE plpgsql;

-- Rebuild phases JSON for all projects that have empty operations
UPDATE projects p
SET phases = rebuild_phases_json_from_project_phases(p.id)
WHERE 
  p.phases IS NOT NULL 
  AND (
    -- Projects where first phase has empty operations array
    jsonb_array_length((p.phases::jsonb->0->'operations')::jsonb) = 0
    OR 
    -- Projects where phases exist but first phase has no operations key
    NOT (p.phases::jsonb->0 ? 'operations')
  )
  AND EXISTS (
    -- Only update if template_operations exist for this project
    SELECT 1 FROM template_operations WHERE project_id = p.id
  );

-- Rebuild phases JSON for all project runs from their template
UPDATE project_runs pr
SET phases = (
  SELECT phases FROM projects WHERE id = pr.template_id
)
WHERE 
  pr.phases IS NOT NULL
  AND (
    -- Project runs where first phase has empty operations array
    jsonb_array_length((pr.phases::jsonb->0->'operations')::jsonb) = 0
    OR
    -- Project runs where phases exist but first phase has no operations key
    NOT (pr.phases::jsonb->0 ? 'operations')
  );
