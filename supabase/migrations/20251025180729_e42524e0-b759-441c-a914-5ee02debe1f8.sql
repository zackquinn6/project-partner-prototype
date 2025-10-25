-- Add ordered field to home_tasks table
ALTER TABLE home_tasks 
ADD COLUMN IF NOT EXISTS ordered boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN home_tasks.ordered IS 'Whether subtasks must be completed in order';