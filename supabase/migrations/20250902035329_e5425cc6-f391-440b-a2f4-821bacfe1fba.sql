-- Remove duplicate project, keeping only the first one
DELETE FROM public.projects 
WHERE name = 'Professional Tile Flooring Installation' 
AND id != (
  SELECT MIN(id) FROM public.projects 
  WHERE name = 'Professional Tile Flooring Installation'
);