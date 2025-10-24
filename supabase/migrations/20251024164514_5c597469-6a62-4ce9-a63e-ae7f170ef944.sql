-- Add assigned_person_id column to home_task_subtasks
ALTER TABLE home_task_subtasks 
ADD COLUMN assigned_person_id uuid REFERENCES home_task_people(id) ON DELETE SET NULL;