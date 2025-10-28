-- Add cover_image field to projects if it doesn't exist
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS cover_image text;

-- Create project_owners junction table for multiple owners
CREATE TABLE IF NOT EXISTS public.project_owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  UNIQUE(project_id, user_id)
);

-- Enable RLS on project_owners
ALTER TABLE public.project_owners ENABLE ROW LEVEL SECURITY;

-- RLS policies for project_owners table
CREATE POLICY "Admins can manage all project owners"
  ON public.project_owners
  FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Project owners can add other project owners"
  ON public.project_owners
  FOR INSERT
  WITH CHECK (
    has_project_owner_role(auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.project_owners po
      WHERE po.project_id = project_owners.project_id
      AND po.user_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can view project owners"
  ON public.project_owners
  FOR SELECT
  USING (
    is_admin(auth.uid()) OR
    has_project_owner_role(auth.uid())
  );

CREATE POLICY "Project owners can remove other project owners"
  ON public.project_owners
  FOR DELETE
  USING (
    is_admin(auth.uid()) OR
    (
      has_project_owner_role(auth.uid()) AND
      EXISTS (
        SELECT 1 FROM public.project_owners po
        WHERE po.project_id = project_owners.project_id
        AND po.user_id = auth.uid()
      )
    )
  );

-- Drop and recreate is_project_owner function to check junction table
DROP FUNCTION IF EXISTS public.is_project_owner(uuid, uuid);
CREATE OR REPLACE FUNCTION public.is_project_owner(project_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.project_owners
    WHERE project_id = project_id_param
    AND user_id = user_id_param
  ) OR is_admin(user_id_param);
$$;

-- Update RLS policies on projects table to use the new function
DROP POLICY IF EXISTS "Project owners can update their projects" ON public.projects;
CREATE POLICY "Project owners can update their projects"
  ON public.projects
  FOR UPDATE
  USING (is_project_owner(id, auth.uid()));

DROP POLICY IF EXISTS "Project owners can view their projects" ON public.projects;
CREATE POLICY "Project owners can view their projects"
  ON public.projects
  FOR SELECT
  USING (
    is_admin(auth.uid()) OR
    is_project_owner(id, auth.uid()) OR
    publish_status = 'published'
  );

-- Migrate existing owner_id data to project_owners table
INSERT INTO public.project_owners (project_id, user_id, created_by)
SELECT id, owner_id, owner_id
FROM public.projects
WHERE owner_id IS NOT NULL
ON CONFLICT (project_id, user_id) DO NOTHING;

-- Keep owner_id column for backward compatibility but it's no longer the source of truth
COMMENT ON COLUMN public.projects.owner_id IS 'Deprecated: Use project_owners table instead. Kept for backward compatibility.';