-- Add field to distinguish manual projects from system-managed projects
ALTER TABLE public.project_runs 
ADD COLUMN is_manual_entry boolean NOT NULL DEFAULT false;

-- Add index for performance when filtering manual vs system projects
CREATE INDEX idx_project_runs_is_manual ON public.project_runs(is_manual_entry);

-- Add a comment to document the field
COMMENT ON COLUMN public.project_runs.is_manual_entry IS 'True for user-uploaded manual project entries, false for system-managed projects';