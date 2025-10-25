-- Drop the existing check constraint
ALTER TABLE home_task_people 
DROP CONSTRAINT home_task_people_diy_level_check;

-- Add updated constraint with all four levels
ALTER TABLE home_task_people 
ADD CONSTRAINT home_task_people_diy_level_check 
CHECK (diy_level = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text, 'pro'::text]));