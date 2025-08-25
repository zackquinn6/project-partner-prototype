-- Add revision tracking to projects table
ALTER TABLE public.projects 
ADD COLUMN revision_number INTEGER DEFAULT 1,
ADD COLUMN parent_project_id UUID REFERENCES public.projects(id),
ADD COLUMN revision_notes TEXT,
ADD COLUMN created_from_revision INTEGER DEFAULT NULL;

-- Create an index for better performance on revision queries
CREATE INDEX idx_projects_parent_project_id ON public.projects(parent_project_id);
CREATE INDEX idx_projects_revision_number ON public.projects(revision_number);

-- Create a function to increment revision numbers
CREATE OR REPLACE FUNCTION increment_project_revision()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is a new revision of an existing project
  IF NEW.parent_project_id IS NOT NULL THEN
    -- Get the max revision number for this project family
    SELECT COALESCE(MAX(revision_number), 0) + 1
    INTO NEW.revision_number
    FROM public.projects 
    WHERE parent_project_id = NEW.parent_project_id 
       OR id = NEW.parent_project_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-increment revision numbers
CREATE TRIGGER trigger_increment_project_revision
  BEFORE INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION increment_project_revision();

-- Update existing projects to have revision 1
UPDATE public.projects 
SET revision_number = 1 
WHERE revision_number IS NULL;