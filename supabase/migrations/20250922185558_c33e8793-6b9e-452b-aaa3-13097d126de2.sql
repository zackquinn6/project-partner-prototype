-- Add diy_length_challenges field to projects table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'diy_length_challenges') THEN
        ALTER TABLE projects ADD COLUMN diy_length_challenges text;
    END IF;
END $$;