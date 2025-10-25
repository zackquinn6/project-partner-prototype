-- Add new columns to home_task_people for enhanced availability management
ALTER TABLE home_task_people 
ADD COLUMN IF NOT EXISTS availability_mode TEXT DEFAULT 'general' CHECK (availability_mode IN ('general', 'specific')),
ADD COLUMN IF NOT EXISTS availability_start_date DATE,
ADD COLUMN IF NOT EXISTS availability_end_date DATE,
ADD COLUMN IF NOT EXISTS specific_dates DATE[];