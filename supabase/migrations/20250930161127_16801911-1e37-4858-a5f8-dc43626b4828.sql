-- Fix double-encoded phases in revision 1 of Tile Flooring Installation
-- The phases field contains a JSON string instead of actual JSONB array

UPDATE public.projects
SET phases = (phases#>>'{}')::jsonb
WHERE id = 'b7d4f5b0-f351-49fc-b686-dad335ba26eb'
  AND jsonb_typeof(phases) = 'string';