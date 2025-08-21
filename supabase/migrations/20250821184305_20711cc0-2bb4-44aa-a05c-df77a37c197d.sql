-- Add columns to project_runs table for phase ratings and issue reports
ALTER TABLE project_runs 
ADD COLUMN phase_ratings jsonb DEFAULT '[]'::jsonb,
ADD COLUMN issue_reports jsonb DEFAULT '[]'::jsonb;

-- Add comments to describe the new columns
COMMENT ON COLUMN project_runs.phase_ratings IS 'Array of phase rating objects with phaseId, phaseName, rating (1-5), and timestamp';
COMMENT ON COLUMN project_runs.issue_reports IS 'Array of issue report objects with stepId, phaseId, issues array, comments, and timestamp';