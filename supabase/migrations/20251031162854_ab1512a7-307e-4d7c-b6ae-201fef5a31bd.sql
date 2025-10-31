-- FIX 1C: Update trigger to not skip custom phases with empty operations
-- This ensures custom phases are saved even when they don't have operations yet

CREATE OR REPLACE FUNCTION sync_custom_phases_on_update()
RETURNS TRIGGER AS $$
DECLARE
  phase jsonb;
  operation jsonb;
  step jsonb;
  phase_order int := 100;
  operation_order int := 0;
  new_operation_id uuid;
BEGIN
  -- Only sync for non-standard projects when phases change
  IF NEW.phases IS DISTINCT FROM OLD.phases 
     AND (NEW.is_standard_template IS NULL OR NEW.is_standard_template = false) THEN
    
    RAISE NOTICE '🔄 Syncing custom phases for project %', NEW.id;
    
    -- Delete existing custom phase operations to rebuild
    DELETE FROM template_operations 
    WHERE project_id = NEW.id AND is_custom_phase = true;
    
    RAISE NOTICE '🗑️ Deleted existing custom phase operations';
    
    -- Process each phase in the phases array
    FOR phase IN SELECT * FROM jsonb_array_elements(NEW.phases)
    LOOP
      -- Only process custom phases (not standard, not linked)
      IF COALESCE((phase->>'isStandard')::boolean, false) = false 
         AND COALESCE((phase->>'isLinked')::boolean, false) = false THEN
        
        RAISE NOTICE '📦 Processing custom phase: %', phase->>'name';
        
        -- FIX: Create placeholder operation if phase has no operations yet
        IF phase->'operations' IS NULL 
           OR jsonb_typeof(phase->'operations') != 'array' 
           OR jsonb_array_length(phase->'operations') = 0 THEN
          
          RAISE NOTICE '➕ Creating placeholder operation for empty phase: %', phase->>'name';
          
          -- Insert a placeholder operation so phase is saved to database
          INSERT INTO template_operations (
            project_id, 
            name, 
            description, 
            custom_phase_name, 
            custom_phase_description,
            custom_phase_display_order, 
            display_order,
            standard_phase_id
          ) VALUES (
            NEW.id,
            'Placeholder Operation',
            'Add operations to this custom phase',
            phase->>'name',
            COALESCE(phase->>'description', ''),
            phase_order,
            0,
            NULL
          );
          
          phase_order := phase_order + 10;
          CONTINUE;
        END IF;
        
        -- Process operations for this custom phase
        operation_order := 0;
        FOR operation IN SELECT * FROM jsonb_array_elements(phase->'operations')
        LOOP
          RAISE NOTICE '  ➕ Creating operation: %', operation->>'name';
          
          INSERT INTO template_operations (
            project_id, 
            name, 
            description, 
            custom_phase_name, 
            custom_phase_description,
            custom_phase_display_order, 
            display_order,
            standard_phase_id,
            flow_type,
            user_prompt,
            alternate_group,
            dependent_on
          ) VALUES (
            NEW.id,
            operation->>'name',
            operation->>'description',
            phase->>'name',
            COALESCE(phase->>'description', ''),
            phase_order,
            operation_order,
            NULL,
            operation->>'flowType',
            operation->>'userPrompt',
            operation->>'alternateGroup',
            (operation->>'dependentOn')::uuid
          ) RETURNING id INTO new_operation_id;
          
          -- Process steps for this operation
          IF operation->'steps' IS NOT NULL 
             AND jsonb_typeof(operation->'steps') = 'array' THEN
            FOR step IN SELECT * FROM jsonb_array_elements(operation->'steps')
            LOOP
              RAISE NOTICE '    ➕ Creating step: %', COALESCE(step->>'step', 'Untitled');
              
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
                COALESCE((step->>'stepNumber')::int, 1),
                COALESCE(step->>'step', 'Untitled Step'),
                step->>'description',
                COALESCE(step->'content', step->'content_sections', '[]'::jsonb),
                COALESCE(step->'materials', '[]'::jsonb),
                COALESCE(step->'tools', '[]'::jsonb),
                COALESCE(step->'outputs', '[]'::jsonb),
                COALESCE(step->'apps', '[]'::jsonb),
                COALESCE((step->'timeEstimation'->'variableTime'->>'low')::int, 
                         (step->>'estimatedTimeMinutes')::int, 0),
                COALESCE((step->>'stepNumber')::int, 1) - 1,
                COALESCE(step->>'flowType', 'prime'),
                COALESCE(step->>'stepType', 'prime')
              );
            END LOOP;
          END IF;
          
          operation_order := operation_order + 1;
        END LOOP;
        
        phase_order := phase_order + 10;
      END IF;
    END LOOP;
    
    RAISE NOTICE '✅ Custom phase sync completed';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS sync_custom_phases_trigger ON projects;
CREATE TRIGGER sync_custom_phases_trigger
  AFTER UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION sync_custom_phases_on_update();