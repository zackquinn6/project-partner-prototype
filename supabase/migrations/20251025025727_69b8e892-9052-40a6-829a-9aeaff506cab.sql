-- Add not_available_dates column to home_task_people table
ALTER TABLE home_task_people 
ADD COLUMN not_available_dates DATE[] DEFAULT '{}';

-- Add comment to explain the column
COMMENT ON COLUMN home_task_people.not_available_dates IS 'Array of dates when this person is not available to work';