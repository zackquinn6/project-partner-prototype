-- Add multi-image support to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS cover_image TEXT;