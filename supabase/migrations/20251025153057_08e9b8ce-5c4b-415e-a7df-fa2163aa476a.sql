-- Fix home_task_subtasks diy_level check constraint to allow all valid values
ALTER TABLE home_task_subtasks DROP CONSTRAINT IF EXISTS home_task_subtasks_diy_level_check;

ALTER TABLE home_task_subtasks ADD CONSTRAINT home_task_subtasks_diy_level_check 
  CHECK (diy_level IN ('beginner', 'intermediate', 'advanced', 'professional'));