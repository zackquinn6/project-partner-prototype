-- Update the Dishwasher Replacement template that project runs are using
UPDATE public.projects
SET 
  skill_level = 'Intermediate',
  diy_length_challenges = '1) Installation requires laying on floor. 
2) Requires minor electrical and plumbing connections to be made.',
  updated_at = now()
WHERE id = '2bb31cb8-a189-448b-a755-341a14ea96f1'
  AND name = 'Dishwasher Replacement';

-- Now update all project runs from this template
UPDATE public.project_runs pr
SET 
  skill_level = p.skill_level,
  diy_length_challenges = p.diy_length_challenges,
  updated_at = now()
FROM public.projects p
WHERE pr.template_id = p.id
  AND p.id = '2bb31cb8-a189-448b-a755-341a14ea96f1';