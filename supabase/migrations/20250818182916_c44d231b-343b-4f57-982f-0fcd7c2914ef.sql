-- Add new fields for estimated time per unit and scaling unit
ALTER TABLE public.projects 
ADD COLUMN estimated_time_per_unit DECIMAL(10,2),
ADD COLUMN scaling_unit TEXT;

-- Create a check constraint for scaling unit values
ALTER TABLE public.projects 
ADD CONSTRAINT projects_scaling_unit_check 
CHECK (scaling_unit IS NULL OR scaling_unit IN (
  'per square foot', 
  'per 10x10 room', 
  'per linear foot', 
  'per cubic yard', 
  'per item'
));