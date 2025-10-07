-- Phase 2: Backend Functions for Standard Project Template Architecture

-- Function 1: Get Standard Project Template
CREATE OR REPLACE FUNCTION public.get_standard_project_template()
RETURNS TABLE(
  project_id uuid,
  project_name text,
  phases jsonb
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as project_id,
    p.name as project_name,
    p.phases
  FROM public.projects p
  WHERE p.is_standard_template = true
  LIMIT 1;
END;
$function$;

-- Function 2: Apply Standard Phase Positioning
-- Merges standard phases with custom phases according to position rules
CREATE OR REPLACE FUNCTION public.apply_standard_phase_positioning(
  p_project_id uuid,
  p_custom_phases jsonb DEFAULT '[]'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  standard_project_phases jsonb;
  final_phases jsonb := '[]'::jsonb;
  standard_phase jsonb;
  custom_phase jsonb;
  position_rule text;
  position_value int;
  phase_name text;
  total_phases int;
  insert_position int;
BEGIN
  -- Get standard project phases
  SELECT phases INTO standard_project_phases
  FROM public.projects
  WHERE is_standard_template = true
  LIMIT 1;
  
  IF standard_project_phases IS NULL THEN
    RETURN p_custom_phases;
  END IF;
  
  -- Start with custom phases
  final_phases := p_custom_phases;
  total_phases := jsonb_array_length(final_phases);
  
  -- Process each standard phase according to its position rule
  FOR standard_phase IN SELECT * FROM jsonb_array_elements(standard_project_phases)
  LOOP
    phase_name := standard_phase->>'name';
    
    -- Get position rule from standard_phases table
    SELECT sp.position_rule, sp.position_value
    INTO position_rule, position_value
    FROM public.standard_phases sp
    WHERE sp.name = phase_name;
    
    -- Calculate insert position based on rule
    IF position_rule = 'first' THEN
      insert_position := 0;
    ELSIF position_rule = 'last' THEN
      insert_position := jsonb_array_length(final_phases);
    ELSIF position_rule = 'nth' THEN
      insert_position := LEAST(position_value - 1, jsonb_array_length(final_phases));
    ELSIF position_rule = 'last_minus_n' THEN
      insert_position := GREATEST(0, jsonb_array_length(final_phases) - position_value);
    ELSE
      insert_position := jsonb_array_length(final_phases);
    END IF;
    
    -- Insert standard phase at calculated position
    IF insert_position = 0 THEN
      final_phases := jsonb_build_array(standard_phase) || final_phases;
    ELSIF insert_position >= jsonb_array_length(final_phases) THEN
      final_phases := final_phases || jsonb_build_array(standard_phase);
    ELSE
      -- Insert in middle - rebuild array
      DECLARE
        temp_phases jsonb := '[]'::jsonb;
        i int := 0;
      BEGIN
        FOR custom_phase IN SELECT * FROM jsonb_array_elements(final_phases)
        LOOP
          IF i = insert_position THEN
            temp_phases := temp_phases || jsonb_build_array(standard_phase);
          END IF;
          temp_phases := temp_phases || jsonb_build_array(custom_phase);
          i := i + 1;
        END LOOP;
        final_phases := temp_phases;
      END;
    END IF;
  END LOOP;
  
  RETURN final_phases;
END;
$function$;

-- Function 3: Create Project with Standard Foundation
-- Creates a new project template by copying standard phases and operations
CREATE OR REPLACE FUNCTION public.create_project_with_standard_foundation(
  p_project_name text,
  p_description text DEFAULT NULL,
  p_category text DEFAULT NULL,
  p_difficulty text DEFAULT NULL,
  p_effort_level text DEFAULT NULL,
  p_estimated_time text DEFAULT NULL,
  p_image text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_project_id uuid;
  standard_project_id uuid;
  standard_operation record;
  new_operation_id uuid;
BEGIN
  -- Verify user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can create project templates';
  END IF;
  
  -- Get standard project ID
  SELECT id INTO standard_project_id
  FROM public.projects
  WHERE is_standard_template = true
  LIMIT 1;
  
  IF standard_project_id IS NULL THEN
    RAISE EXCEPTION 'Standard Project Foundation not found';
  END IF;
  
  -- Create new project
  INSERT INTO public.projects (
    name,
    description,
    category,
    difficulty,
    effort_level,
    estimated_time,
    image,
    status,
    publish_status,
    phases,
    created_by
  ) VALUES (
    p_project_name,
    p_description,
    p_category,
    p_difficulty,
    p_effort_level,
    p_estimated_time,
    p_image,
    'not-started',
    'draft',
    '[]'::jsonb,
    auth.uid()
  ) RETURNING id INTO new_project_id;
  
  -- Copy all standard operations and steps
  FOR standard_operation IN
    SELECT * FROM public.template_operations
    WHERE project_id = standard_project_id
    ORDER BY display_order
  LOOP
    -- Copy operation
    INSERT INTO public.template_operations (
      project_id,
      standard_phase_id,
      name,
      description,
      display_order
    ) VALUES (
      new_project_id,
      standard_operation.standard_phase_id,
      standard_operation.name,
      standard_operation.description,
      standard_operation.display_order
    ) RETURNING id INTO new_operation_id;
    
    -- Copy all steps for this operation
    INSERT INTO public.template_steps (
      operation_id,
      step_number,
      step_title,
      description,
      content_sections,
      materials,
      tools,
      outputs,
      estimated_time_minutes,
      display_order
    )
    SELECT
      new_operation_id,
      step_number,
      step_title,
      description,
      content_sections,
      materials,
      tools,
      outputs,
      estimated_time_minutes,
      display_order
    FROM public.template_steps
    WHERE operation_id = standard_operation.id
    ORDER BY display_order;
  END LOOP;
  
  -- Rebuild phases JSON
  UPDATE public.projects
  SET phases = rebuild_phases_json_from_templates(new_project_id)
  WHERE id = new_project_id;
  
  -- Log the creation
  PERFORM log_comprehensive_security_event(
    'project_created_with_standard_foundation',
    'medium',
    'Created new project with standard foundation: ' || p_project_name,
    auth.uid(),
    NULL, NULL, NULL,
    jsonb_build_object(
      'project_id', new_project_id,
      'project_name', p_project_name
    )
  );
  
  RETURN new_project_id;
END;
$function$;

-- Function 4: Create Project Run Snapshot
-- Creates an immutable snapshot of a project template for execution
CREATE OR REPLACE FUNCTION public.create_project_run_snapshot(
  p_template_id uuid,
  p_user_id uuid,
  p_run_name text,
  p_home_id uuid DEFAULT NULL,
  p_start_date timestamp with time zone DEFAULT now(),
  p_plan_end_date timestamp with time zone DEFAULT (now() + interval '30 days')
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_run_id uuid;
  template_project record;
BEGIN
  -- Verify user can create runs
  IF auth.uid() != p_user_id AND NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Cannot create project runs for other users';
  END IF;
  
  -- Get template project
  SELECT * INTO template_project
  FROM public.projects
  WHERE id = p_template_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template project not found';
  END IF;
  
  -- Create immutable snapshot
  INSERT INTO public.project_runs (
    template_id,
    user_id,
    name,
    description,
    home_id,
    status,
    start_date,
    plan_end_date,
    phases,
    category,
    difficulty,
    estimated_time,
    effort_level,
    skill_level,
    diy_length_challenges,
    completed_steps,
    progress
  ) VALUES (
    p_template_id,
    p_user_id,
    p_run_name,
    template_project.description,
    p_home_id,
    'not-started',
    p_start_date,
    p_plan_end_date,
    template_project.phases, -- IMMUTABLE SNAPSHOT
    template_project.category,
    template_project.difficulty,
    template_project.estimated_time,
    template_project.effort_level,
    template_project.skill_level,
    template_project.diy_length_challenges,
    '[]'::jsonb,
    0
  ) RETURNING id INTO new_run_id;
  
  -- Log the creation
  PERFORM log_comprehensive_security_event(
    'project_run_created',
    'low',
    'Created project run snapshot: ' || p_run_name,
    p_user_id,
    NULL, NULL, NULL,
    jsonb_build_object(
      'run_id', new_run_id,
      'template_id', p_template_id,
      'run_name', p_run_name
    )
  );
  
  RETURN new_run_id;
END;
$function$;

-- Function 5: Update create_project_revision to handle standard phases correctly
CREATE OR REPLACE FUNCTION public.create_project_revision(
  source_project_id uuid,
  revision_notes_text text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  source_project public.projects%ROWTYPE;
  new_project_id uuid;
  max_revision_number integer;
  parent_id uuid;
  old_operation_id uuid;
  new_operation_id uuid;
  rebuilt_phases jsonb;
BEGIN
  -- Check if user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Get the source project
  SELECT * INTO source_project FROM public.projects WHERE id = source_project_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Source project not found';
  END IF;
  
  -- Don't allow revisions of the Standard Project Foundation
  IF source_project.is_standard_template THEN
    RAISE EXCEPTION 'Cannot create revisions of the Standard Project Foundation';
  END IF;
  
  -- Determine parent project ID
  IF source_project.parent_project_id IS NOT NULL THEN
    parent_id := source_project.parent_project_id;
  ELSE
    parent_id := source_project_id;
  END IF;
  
  -- Get max revision number
  SELECT COALESCE(MAX(revision_number), -1) + 1 INTO max_revision_number
  FROM public.projects 
  WHERE parent_project_id = parent_id OR id = parent_id;
  
  -- Create the new revision
  INSERT INTO public.projects (
    name,
    description,
    image,
    status,
    publish_status,
    category,
    difficulty,
    effort_level,
    estimated_time,
    scaling_unit,
    phases,
    estimated_time_per_unit,
    parent_project_id,
    revision_number,
    revision_notes,
    created_by,
    created_from_revision,
    is_current_version,
    is_standard_template
  ) VALUES (
    source_project.name,
    source_project.description,
    source_project.image,
    'not-started',
    'draft',
    source_project.category,
    source_project.difficulty,
    source_project.effort_level,
    source_project.estimated_time,
    source_project.scaling_unit,
    '[]'::jsonb,
    source_project.estimated_time_per_unit,
    parent_id,
    max_revision_number,
    revision_notes_text,
    auth.uid(),
    source_project.revision_number,
    false,
    false -- Revisions are never standard templates
  ) RETURNING id INTO new_project_id;
  
  -- Copy ALL template_operations WITH their standard_phase_id links
  FOR old_operation_id IN 
    SELECT id FROM public.template_operations 
    WHERE project_id = source_project_id 
    ORDER BY display_order
  LOOP
    INSERT INTO public.template_operations (
      project_id,
      standard_phase_id, -- CRITICAL: Preserve standard phase link
      name,
      description,
      display_order
    )
    SELECT 
      new_project_id,
      standard_phase_id, -- CRITICAL: Copy the standard phase link
      name,
      description,
      display_order
    FROM public.template_operations
    WHERE id = old_operation_id
    RETURNING id INTO new_operation_id;
    
    -- Copy steps
    INSERT INTO public.template_steps (
      operation_id,
      step_number,
      step_title,
      description,
      content_sections,
      materials,
      tools,
      outputs,
      estimated_time_minutes,
      display_order
    )
    SELECT 
      new_operation_id,
      step_number,
      step_title,
      description,
      content_sections,
      materials,
      tools,
      outputs,
      estimated_time_minutes,
      display_order
    FROM public.template_steps
    WHERE operation_id = old_operation_id
    ORDER BY display_order;
  END LOOP;
  
  -- Rebuild phases JSON
  rebuilt_phases := rebuild_phases_json_from_templates(new_project_id);
  
  UPDATE public.projects
  SET phases = rebuilt_phases
  WHERE id = new_project_id;
  
  -- Log the revision
  PERFORM log_comprehensive_security_event(
    'project_revision_created',
    'medium',
    'Created project revision',
    auth.uid(),
    NULL, NULL, NULL,
    jsonb_build_object(
      'new_project_id', new_project_id,
      'source_project_id', source_project_id,
      'revision_number', max_revision_number
    )
  );
  
  RETURN new_project_id;
END;
$function$;