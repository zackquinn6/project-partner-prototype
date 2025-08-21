-- Add new fields to profiles table for enhanced DIY survey
ALTER TABLE public.profiles 
ADD COLUMN home_ownership text,
ADD COLUMN home_build_year text,
ADD COLUMN home_state text,
ADD COLUMN preferred_learning_methods text[],
ADD COLUMN owned_tools jsonb DEFAULT '[]'::jsonb;

-- Remove the current_goal field as it's being removed from the survey
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS current_goal;