-- Fix create_project_revision to handle phases correctly and ensure proper cascade deletes

-- 1. Fix the create_project_revision function to handle phases type safely
CREATE OR REPLACE FUNCTION public.create_project_revision(
  source_project_id uuid,
  revision_notes_text text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  source_project public.projects%ROWTYPE;
  new_project_id uuid;
  max_revision_number integer;
  parent_id uuid;
  phases_count integer;
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
  
  -- Create the new revision project WITH PHASES AS-IS (no rebuilding)
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
    cover_image,
    images,
    status,
    publish_status,
    phases,
    created_by,
    parent_project_id,
    revision_number,
    revision_notes
  )
  SELECT 
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
    cover_image,
    images,
    status,
    'draft',
    phases,
    auth.uid(),
    parent_id,
    max_revision_number,
    revision_notes_text
  FROM public.projects
  WHERE id = source_project_id
  RETURNING id INTO new_project_id;
  
  -- Copy template_operations (for standard phase cascade support)
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
  )
  SELECT 
    new_project_id,
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
  FROM public.template_operations
  WHERE project_id = source_project_id;
  
  -- Copy template_steps
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
    new_ops.id,
    ts.step_number,
    ts.step_title,
    ts.description,
    ts.content_sections,
    ts.materials,
    ts.tools,
    ts.outputs,
    ts.apps,
    ts.estimated_time_minutes,
    ts.display_order,
    ts.flow_type,
    ts.step_type
  FROM public.template_steps ts
  JOIN public.template_operations old_ops ON ts.operation_id = old_ops.id
  JOIN public.template_operations new_ops ON (
    new_ops.project_id = new_project_id 
    AND new_ops.name = old_ops.name
    AND new_ops.display_order = old_ops.display_order
  )
  WHERE old_ops.project_id = source_project_id;
  
  -- Calculate phase count safely (handle both text and jsonb)
  BEGIN
    IF source_project.phases IS NULL THEN
      phases_count := 0;
    ELSIF pg_typeof(source_project.phases)::text LIKE '%json%' THEN
      phases_count := jsonb_array_length(source_project.phases::jsonb);
    ELSE
      phases_count := 0;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    phases_count := 0;
  END;
  
  -- Log the revision creation
  PERFORM log_comprehensive_security_event(
    'project_revision_created',
    'medium',
    'Created project revision: ' || source_project.name || ' (Rev ' || max_revision_number || ')',
    auth.uid(),
    NULL, NULL, NULL,
    jsonb_build_object(
      'source_project_id', source_project_id,
      'new_project_id', new_project_id,
      'revision_number', max_revision_number,
      'phase_count', phases_count
    )
  );
  
  RETURN new_project_id;
END;
$$;

-- 2. Ensure cascade deletes work properly for projects
-- First, check if template_operations has proper cascade
DO $$
BEGIN
  -- Drop existing foreign key if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'template_operations_project_id_fkey' 
    AND table_name = 'template_operations'
  ) THEN
    ALTER TABLE public.template_operations 
    DROP CONSTRAINT template_operations_project_id_fkey;
  END IF;
  
  -- Add it back with CASCADE
  ALTER TABLE public.template_operations
  ADD CONSTRAINT template_operations_project_id_fkey 
  FOREIGN KEY (project_id) 
  REFERENCES public.projects(id) 
  ON DELETE CASCADE;
END $$;

-- Ensure template_steps cascade from template_operations
DO $$
BEGIN
  -- Drop existing foreign key if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'template_steps_operation_id_fkey' 
    AND table_name = 'template_steps'
  ) THEN
    ALTER TABLE public.template_steps 
    DROP CONSTRAINT template_steps_operation_id_fkey;
  END IF;
  
  -- Add it back with CASCADE
  ALTER TABLE public.template_steps
  ADD CONSTRAINT template_steps_operation_id_fkey 
  FOREIGN KEY (operation_id) 
  REFERENCES public.template_operations(id) 
  ON DELETE CASCADE;
END $$;