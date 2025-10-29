-- Ensure project template has the data
-- Update Dishwasher Replacement template to ensure data is present
UPDATE projects 
SET 
  skill_level = 'Intermediate',
  diy_length_challenges = '1) Installation requires laying on floor. 
2) Requires minor electrical and plumbing connections to be made.',
  category = ARRAY['Appliances', 'Electrical', 'Plumbing', 'Kitchen']
WHERE name = 'Dishwasher Replacement' 
  AND id = '536fe135-c999-465c-8cff-d679f4041884';

-- Update any existing project runs that don't have these fields to get them from template
UPDATE project_runs pr
SET 
  skill_level = p.skill_level,
  diy_length_challenges = p.diy_length_challenges,
  category = p.category
FROM projects p
WHERE pr.template_id = p.id
  AND (pr.skill_level IS NULL OR pr.diy_length_challenges IS NULL)
  AND p.skill_level IS NOT NULL;