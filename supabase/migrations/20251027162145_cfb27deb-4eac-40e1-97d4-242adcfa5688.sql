-- Update home_tasks DIY level constraint to include advanced
ALTER TABLE home_tasks DROP CONSTRAINT IF EXISTS home_tasks_diy_level_check;
ALTER TABLE home_tasks ADD CONSTRAINT home_tasks_diy_level_check 
  CHECK (diy_level IN ('beginner', 'intermediate', 'advanced', 'pro'));

-- Update home_task_subtasks DIY level constraint to include advanced
ALTER TABLE home_task_subtasks DROP CONSTRAINT IF EXISTS home_task_subtasks_diy_level_check;
ALTER TABLE home_task_subtasks ADD CONSTRAINT home_task_subtasks_diy_level_check 
  CHECK (diy_level IN ('beginner', 'intermediate', 'advanced', 'pro'));

-- Update home_task_people DIY level constraint to include advanced
ALTER TABLE home_task_people DROP CONSTRAINT IF EXISTS home_task_people_diy_level_check;
ALTER TABLE home_task_people ADD CONSTRAINT home_task_people_diy_level_check 
  CHECK (diy_level IN ('beginner', 'intermediate', 'advanced', 'pro'));