-- Fix the create_project_revision function to not add revision text to project names
CREATE OR REPLACE FUNCTION public.create_project_revision(source_project_id uuid, revision_notes_text text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  source_project public.projects%ROWTYPE;
  new_project_id uuid;
  max_revision_number integer;
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
  
  -- Determine parent project ID and get max revision number
  IF source_project.parent_project_id IS NOT NULL THEN
    -- This is already a revision, use its parent
    SELECT COALESCE(MAX(revision_number), 0) + 1 INTO max_revision_number
    FROM public.projects 
    WHERE parent_project_id = source_project.parent_project_id OR id = source_project.parent_project_id;
  ELSE
    -- This is the original project, it becomes the parent
    SELECT COALESCE(MAX(revision_number), 0) + 1 INTO max_revision_number
    FROM public.projects 
    WHERE parent_project_id = source_project_id OR id = source_project_id;
  END IF;
  
  -- Create the new revision - KEEP ORIGINAL NAME WITHOUT REVISION TEXT
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
    is_current_version
  ) VALUES (
    source_project.name, -- Keep original name without revision text
    source_project.description,
    source_project.image,
    'not-started',
    'draft', -- Always start as draft
    source_project.category,
    source_project.difficulty,
    source_project.effort_level,
    source_project.estimated_time,
    source_project.scaling_unit,
    source_project.phases,
    source_project.estimated_time_per_unit,
    COALESCE(source_project.parent_project_id, source_project_id),
    max_revision_number,
    revision_notes_text,
    auth.uid(),
    source_project.revision_number,
    false -- Not current version until promoted
  ) RETURNING id INTO new_project_id;
  
  RETURN new_project_id;
END;
$function$;