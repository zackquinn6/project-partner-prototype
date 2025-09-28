-- Fix the project to have proper phases without duplicates
UPDATE public.projects 
SET phases = jsonb_build_array(
  -- Kickoff Phase (keep existing)
  phases -> 0,
  -- Planning Phase (keep existing) 
  phases -> 1,
  -- Ordering Phase (keep existing)
  phases -> 2,
  -- Close Project Phase (single instance)
  phases -> 3
)
WHERE name = 'Tile Flooring Installation' 
AND revision_number = (
  SELECT MAX(revision_number) 
  FROM public.projects 
  WHERE name = 'Tile Flooring Installation'
);