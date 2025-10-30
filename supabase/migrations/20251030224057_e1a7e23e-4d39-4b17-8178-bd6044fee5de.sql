-- Comprehensive Custom Phases Fix
-- This migration creates the infrastructure to properly sync custom phases to tables

-- Part 1: Create sync_custom_phases_to_tables() function
CREATE OR REPLACE FUNCTION sync_custom_phases_to_tables(p_project_id uuid)
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
  is_standard boolean;
  phase_display_order int := 0;
  operation_display_order int;
  step_display_order int;
  new_operation_id uuid;
BEGIN
  -- Get project phases
  SELECT phases INTO project_phases
  FROM projects
  WHERE id = p_project_id;
  
  IF project_phases IS NULL THEN
    RETURN;
  END IF;
  
  -- Delete existing custom phase operations for this project
  DELETE FROM template_operations
  WHERE project_id = p_project_id
    AND custom_phase_name IS NOT NULL;
  
  -- Process each phase
  FOR phase IN SELECT * FROM jsonb_array_elements(project_phases)
  LOOP
    phase_display_order := phase_display_order + 1;
    phase_name := phase->>'name';
    is_standard := COALESCE((phase->>'isStandard')::boolean, false);
    
    -- Skip standard phases - they're already in template_operations
    IF is_standard THEN
      CONTINUE;
    END IF;
    
    -- This is a custom phase - process its operations
    operation_display_order := 0;
    
    FOR operation IN SELECT * FROM jsonb_array_elements(phase->'operations')
    LOOP
      operation_display_order := operation_display_order + 1;
      
      -- Insert custom phase operation
      INSERT INTO template_operations (
        project_id,
        custom_phase_name,
        custom_phase_description,
        custom_phase_display_order,
        name,
        description,
        display_order,
        flow_type,
        user_prompt,
        alternate_group
      ) VALUES (
        p_project_id,
        phase_name,
        phase->>'description',
        phase_display_order,
        operation->>'name',
        operation->>'description',
        operation_display_order,
        operation->>'flowType',
        operation->>'userPrompt',
        operation->>'alternateGroup'
      ) RETURNING id INTO new_operation_id;
      
      -- Insert steps for this operation
      step_display_order := 0;
      
      FOR step IN SELECT * FROM jsonb_array_elements(operation->'steps')
      LOOP
        step_display_order := step_display_order + 1;
        
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
          flow_type,
          step_type
        ) VALUES (
          new_operation_id,
          COALESCE((step->>'stepNumber')::int, step_display_order),
          step->>'step',
          step->>'description',
          COALESCE(step->'content_sections', '[]'::jsonb),
          COALESCE(step->'materials', '[]'::jsonb),
          COALESCE(step->'tools', '[]'::jsonb),
          COALESCE(step->'outputs', '[]'::jsonb),
          COALESCE(step->'apps', '[]'::jsonb),
          COALESCE((step->>'estimatedTimeMinutes')::int, 0),
          step_display_order,
          COALESCE(step->>'flowType', 'prime'),
          COALESCE(step->>'stepType', 'prime')
        );
      END LOOP;
    END LOOP;
  END LOOP;
  
  -- Log the sync
  PERFORM log_comprehensive_security_event(
    'custom_phases_synced',
    'low',
    'Synced custom phases to template tables for project: ' || p_project_id,
    auth.uid(),
    NULL, NULL, NULL,
    jsonb_build_object('project_id', p_project_id)
  );
END;
$$;

-- Part 2: Update rebuild_phases_json_from_templates() to handle custom phases
CREATE OR REPLACE FUNCTION rebuild_phases_json_from_templates(p_project_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  phases_array jsonb := '[]'::jsonb;
  phase_record record;
  operation_record record;
  step_record record;
  current_phase jsonb;
  operations_array jsonb;
  steps_array jsonb;
BEGIN
  -- Build phases from standard_phases + custom phases in template_operations
  FOR phase_record IN
    -- Standard phases
    SELECT 
      sp.id,
      sp.name,
      sp.description,
      sp.display_order,
      true as is_standard,
      NULL::text as custom_phase_name
    FROM standard_phases sp
    WHERE EXISTS (
      SELECT 1 FROM template_operations
      WHERE project_id = p_project_id
        AND standard_phase_id = sp.id
    )
    
    UNION ALL
    
    -- Custom phases
    SELECT 
      gen_random_uuid() as id,
      custom_phase_name as name,
      custom_phase_description as description,
      MIN(custom_phase_display_order) as display_order,
      false as is_standard,
      custom_phase_name
    FROM template_operations
    WHERE project_id = p_project_id
      AND custom_phase_name IS NOT NULL
    GROUP BY custom_phase_name, custom_phase_description
    
    ORDER BY display_order
  LOOP
    operations_array := '[]'::jsonb;
    
    -- Get operations for this phase
    FOR operation_record IN
      SELECT *
      FROM template_operations
      WHERE project_id = p_project_id
        AND (
          (phase_record.is_standard AND standard_phase_id = phase_record.id::uuid) OR
          (NOT phase_record.is_standard AND custom_phase_name = phase_record.custom_phase_name)
        )
      ORDER BY display_order
    LOOP
      steps_array := '[]'::jsonb;
      
      -- Get steps for this operation
      FOR step_record IN
        SELECT *
        FROM template_steps
        WHERE operation_id = operation_record.id
        ORDER BY display_order
      LOOP
        steps_array := steps_array || jsonb_build_object(
          'id', step_record.id,
          'step', step_record.step_title,
          'stepNumber', step_record.step_number,
          'description', step_record.description,
          'content_sections', step_record.content_sections,
          'materials', step_record.materials,
          'tools', step_record.tools,
          'outputs', step_record.outputs,
          'apps', step_record.apps,
          'estimatedTimeMinutes', step_record.estimated_time_minutes,
          'flowType', step_record.flow_type,
          'stepType', step_record.step_type
        );
      END LOOP;
      
      operations_array := operations_array || jsonb_build_object(
        'id', operation_record.id,
        'name', operation_record.name,
        'description', operation_record.description,
        'steps', steps_array,
        'flowType', operation_record.flow_type,
        'userPrompt', operation_record.user_prompt,
        'alternateGroup', operation_record.alternate_group,
        'dependentOn', operation_record.dependent_on
      );
    END LOOP;
    
    current_phase := jsonb_build_object(
      'id', phase_record.id,
      'name', phase_record.name,
      'description', phase_record.description,
      'operations', operations_array,
      'isStandard', phase_record.is_standard
    );
    
    IF phase_record.is_standard THEN
      current_phase := current_phase || jsonb_build_object('isLocked', true);
    END IF;
    
    phases_array := phases_array || current_phase;
  END LOOP;
  
  RETURN phases_array;
END;
$$;