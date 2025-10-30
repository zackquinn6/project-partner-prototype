-- Fix function search path security warning
-- Drop trigger first, then function, then recreate both

DROP TRIGGER IF EXISTS enforce_status_progress_alignment ON project_runs;
DROP FUNCTION IF EXISTS validate_project_status_progress();

CREATE OR REPLACE FUNCTION validate_project_status_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Enforce status-progress alignment rules
  IF NEW.progress = 100 AND NEW.status != 'complete' THEN
    NEW.status := 'complete';
  ELSIF NEW.progress = 0 AND NEW.status != 'not-started' THEN
    NEW.status := 'not-started';
  ELSIF NEW.progress > 0 AND NEW.progress < 100 AND NEW.status != 'in-progress' THEN
    NEW.status := 'in-progress';
  END IF;
  
  -- Prevent future end dates
  IF NEW.end_date IS NOT NULL AND NEW.end_date > CURRENT_DATE THEN
    RAISE EXCEPTION 'End date cannot be in the future';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp;

-- Recreate trigger
CREATE TRIGGER enforce_status_progress_alignment
  BEFORE INSERT OR UPDATE ON project_runs
  FOR EACH ROW
  EXECUTE FUNCTION validate_project_status_progress();