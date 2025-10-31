-- Fix: Remove "(Revision)" suffix from project names
-- This was being carried over when creating new revisions

-- First, clean up existing projects with "(Revision)" in the name
UPDATE public.projects
SET name = TRIM(REPLACE(name, '(Revision)', ''))
WHERE name LIKE '%(Revision)%';

-- Update create_project_revision to strip "(Revision)" from source name
CREATE OR REPLACE FUNCTION public.create_project_revision(
  source_project_id uuid,
  revision_notes_text text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  new_revision_id uuid;
  source_project record;
  max_revision_number int;
  parent_id uuid;
  source_operation record;
  new_operation_id uuid;
  rebuilt_phases jsonb;
  custom_ops_count int := 0;
  standard_ops_count int := 0;
  total_steps_copied int := 0;
  clean_project_name text;
BEGIN
  -- Verify user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can create project revisions';
  END IF;
  
  -- Get source project
  SELECT * INTO source_project
  FROM public.projects
  WHERE id = source_project_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Source project not found';
  END IF;
  
  -- Clean project name by removing "(Revision)" suffix if present
  clean_project_name := TRIM(REPLACE(source_project.name, '(Revision)', ''));
  
  -- Determine parent project and next revision number
  IF source_project.parent_project_id IS NOT NULL THEN
    parent_id := source_project.parent_project_id;
  ELSE
    parent_id := source_project.id;
  END IF;
  
  SELECT COALESCE(MAX(revision_number), -1) + 1 INTO max_revision_number
  FROM public.projects
  WHERE id = parent_id OR parent_project_id = parent_id;
  
  RAISE NOTICE '📋 Creating revision % from source project %', max_revision_number, source_project_id;
  
  -- Create new revision project with clean name
  INSERT INTO public.projects (
    name,
    description,
    category,
    difficulty,
    effort_level,
    skill_level,
    estimated_time,
    scaling_unit,
    diy_length_challenges,
    image,
    images,
    cover_image,
    status,
    publish_status,
    phases,
    parent_project_id,
    revision_number,
    revision_notes,
    is_current_version,
    created_by
  ) VALUES (
    clean_project_name,  -- Use cleaned name
    source_project.description,
    source_project.category,
    source_project.difficulty,
    source_project.effort_level,
    source_project.skill_level,
    source_project.estimated_time,
    source_project.scaling_unit,
    source_project.diy_length_challenges,
    source_project.image,
    source_project.images,
    source_project.cover_image,
    'not-started',
    'draft',
    '[]'::jsonb,
    parent_id,
    max_revision_number,
    revision_notes_text,
    false,
    auth.uid()
  ) RETURNING id INTO new_revision_id;
  
  RAISE NOTICE '✅ Created new revision project: %', new_revision_id;
  
  -- Copy ALL operations (both standard and custom) and their steps
  FOR source_operation IN
    SELECT * FROM public.template_operations
    WHERE project_id = source_project_id
    ORDER BY display_order
  LOOP
    -- Track operation type
    IF source_operation.is_custom_phase THEN
      custom_ops_count := custom_ops_count + 1;
      RAISE NOTICE '📦 Copying CUSTOM operation: % (phase: %)', 
        source_operation.name, source_operation.custom_phase_name;
    ELSE
      standard_ops_count := standard_ops_count + 1;
      RAISE NOTICE '📦 Copying STANDARD operation: % (phase_id: %)', 
        source_operation.name, source_operation.standard_phase_id;
    END IF;
    
    -- Copy operation (preserving custom phase info)
    INSERT INTO public.template_operations (
      project_id,
      standard_phase_id,
      custom_phase_name,
      custom_phase_description,
      custom_phase_display_order,
      name,
      description,
      display_order,
      flow_type,
      user_prompt,
      alternate_group,
      dependent_on
    ) VALUES (
      new_revision_id,
      source_operation.standard_phase_id,
      source_operation.custom_phase_name,
      source_operation.custom_phase_description,
      source_operation.custom_phase_display_order,
      source_operation.name,
      source_operation.description,
      source_operation.display_order,
      source_operation.flow_type,
      source_operation.user_prompt,
      source_operation.alternate_group,
      source_operation.dependent_on
    ) RETURNING id INTO new_operation_id;
    
    -- Copy all steps for this operation (with content)
    INSERT INTO public.template_steps (
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
      apps,
      estimated_time_minutes,
      display_order,
      flow_type,
      step_type
    FROM public.template_steps
    WHERE operation_id = source_operation.id
    ORDER BY display_order;
    
    -- Count steps copied
    GET DIAGNOSTICS total_steps_copied = ROW_COUNT;
    RAISE NOTICE '  ✅ Copied % steps for operation %', total_steps_copied, source_operation.name;
  END LOOP;
  
  -- Log summary
  RAISE NOTICE '📊 COPY SUMMARY:';
  RAISE NOTICE '  - Standard operations: %', standard_ops_count;
  RAISE NOTICE '  - Custom operations: %', custom_ops_count;
  RAISE NOTICE '  - Total operations: %', (custom_ops_count + standard_ops_count);
  RAISE NOTICE '  - Total steps: %', total_steps_copied;
  
  -- Rebuild phases JSON from copied template data
  RAISE NOTICE '🔧 Rebuilding phases JSON...';
  rebuilt_phases := rebuild_phases_json_from_templates(new_revision_id);
  
  -- Update project with rebuilt phases
  UPDATE public.projects
  SET phases = rebuilt_phases
  WHERE id = new_revision_id;
  
  RAISE NOTICE '✅ Revision creation complete: %', new_revision_id;
  
  -- Log the creation
  PERFORM log_comprehensive_security_event(
    'project_revision_created',
    'medium',
    'Created revision ' || max_revision_number || ' of project: ' || clean_project_name,
    auth.uid(),
    NULL, NULL, NULL,
    jsonb_build_object(
      'source_project_id', source_project_id,
      'new_revision_id', new_revision_id,
      'revision_number', max_revision_number,
      'standard_operations_copied', standard_ops_count,
      'custom_operations_copied', custom_ops_count,
      'total_steps_copied', total_steps_copied,
      'revision_notes', revision_notes_text
    )
  );
  
  RETURN new_revision_id;
END;
$function$;