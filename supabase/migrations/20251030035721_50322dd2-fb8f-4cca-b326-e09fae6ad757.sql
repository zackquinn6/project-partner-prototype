-- Create function to sync phases JSONB to normalized template tables
CREATE OR REPLACE FUNCTION sync_phases_to_templates(p_project_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  project_phases jsonb;
  phase jsonb;
  operation jsonb;
  step jsonb;
  phase_name text;
  operation_id uuid;
  existing_operation_id uuid;
  max_display_order int;
  standard_phase_record record;
BEGIN
  -- Only admins can sync phases
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Get project phases
  SELECT phases INTO project_phases
  FROM projects
  WHERE id = p_project_id;
  
  IF project_phases IS NULL OR jsonb_typeof(project_phases) != 'array' THEN
    RETURN;
  END IF;
  
  -- Get max display order for operations
  SELECT COALESCE(MAX(display_order), 0) INTO max_display_order
  FROM template_operations
  WHERE project_id = p_project_id;
  
  -- Process each phase
  FOR phase IN SELECT * FROM jsonb_array_elements(project_phases)
  LOOP
    phase_name := phase->>'name';
    
    -- Skip if phase has no operations
    IF phase->'operations' IS NULL OR jsonb_typeof(phase->'operations') != 'array' THEN
      CONTINUE;
    END IF;
    
    -- Process each operation in the phase
    FOR operation IN SELECT * FROM jsonb_array_elements(phase->'operations')
    LOOP
      -- Check if operation already exists (by name)
      SELECT id INTO existing_operation_id
      FROM template_operations
      WHERE project_id = p_project_id
        AND name = operation->>'name'
      LIMIT 1;
      
      IF existing_operation_id IS NULL THEN
        -- Create new operation for custom phase
        max_display_order := max_display_order + 1;
        
        -- Get standard phase ID if this is a standard phase
        SELECT * INTO standard_phase_record
        FROM standard_phases 
        WHERE name = phase_name 
        LIMIT 1;
        
        INSERT INTO template_operations (
          project_id,
          standard_phase_id,
          name,
          description,
          display_order,
          flow_type,
          user_prompt,
          alternate_group,
          dependent_on
        ) VALUES (
          p_project_id,
          standard_phase_record.id,
          operation->>'name',
          operation->>'description',
          max_display_order,
          operation->>'flowType',
          operation->>'userPrompt',
          operation->>'alternateGroup',
          (operation->>'dependentOn')::uuid
        ) RETURNING id INTO operation_id;
        
        -- Create steps for this operation
        IF operation->'steps' IS NOT NULL AND jsonb_typeof(operation->'steps') = 'array' THEN
          FOR step IN SELECT * FROM jsonb_array_elements(operation->'steps')
          LOOP
            INSERT INTO template_steps (
              operation_id,
              step_number,
              step_title,
              description,
              content_sections,
              materials,
              tools,
              outputs,
              apps,
              estimated_time_minutes,
              display_order,
              flow_type
            ) VALUES (
              operation_id,
              COALESCE((step->>'stepNumber')::int, 1),
              step->>'step',
              step->>'description',
              COALESCE(step->'content_sections', '[]'::jsonb),
              COALESCE(step->'materials', '[]'::jsonb),
              COALESCE(step->'tools', '[]'::jsonb),
              COALESCE(step->'outputs', '[]'::jsonb),
              COALESCE(step->'apps', '[]'::jsonb),
              COALESCE((step->>'estimatedTimeMinutes')::int, 0),
              COALESCE((step->>'stepNumber')::int, 1),
              COALESCE(step->>'flowType', 'prime'::text)
            );
          END LOOP;
        END IF;
      END IF;
    END LOOP;
  END LOOP;
  
  -- Log the sync
  PERFORM log_comprehensive_security_event(
    'phases_synced_to_templates',
    'low',
    'Synced phases JSONB to template tables for project: ' || p_project_id,
    auth.uid(),
    NULL, NULL, NULL,
    jsonb_build_object(
      'project_id', p_project_id,
      'phase_count', jsonb_array_length(project_phases)
    )
  );
END;
$$;