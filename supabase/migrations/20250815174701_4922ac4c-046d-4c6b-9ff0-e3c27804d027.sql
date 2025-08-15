-- Add survey fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skill_level TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avoid_projects TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS physical_capability TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS space_type TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_goal TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS survey_completed_at TIMESTAMP WITH TIME ZONE;