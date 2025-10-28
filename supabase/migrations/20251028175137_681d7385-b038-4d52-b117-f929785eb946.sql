-- Create function to sync images across all project revisions
CREATE OR REPLACE FUNCTION sync_project_images_across_revisions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  parent_id uuid;
  revision_ids uuid[];
BEGIN
  -- Only sync if images or cover_image changed
  IF (TG_OP = 'UPDATE' AND 
      (OLD.images IS DISTINCT FROM NEW.images OR 
       OLD.cover_image IS DISTINCT FROM NEW.cover_image)) THEN
    
    -- Determine the parent project ID
    IF NEW.parent_project_id IS NOT NULL THEN
      parent_id := NEW.parent_project_id;
    ELSE
      parent_id := NEW.id;
    END IF;
    
    -- Update all revisions (including parent) with the new images
    UPDATE public.projects
    SET 
      images = NEW.images,
      cover_image = NEW.cover_image,
      updated_at = now()
    WHERE (id = parent_id OR parent_project_id = parent_id)
      AND id != NEW.id; -- Don't update the current record again
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS sync_images_on_project_update ON public.projects;

CREATE TRIGGER sync_images_on_project_update
  AFTER UPDATE ON public.projects
  FOR EACH ROW
  WHEN (OLD.images IS DISTINCT FROM NEW.images OR OLD.cover_image IS DISTINCT FROM NEW.cover_image)
  EXECUTE FUNCTION sync_project_images_across_revisions();

-- Add helpful comment
COMMENT ON FUNCTION sync_project_images_across_revisions() IS 
  'Automatically syncs images and cover_image across all revisions of a project when updated on any revision';