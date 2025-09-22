-- Update project runs to ensure kickoff completion tracking works with 4 steps
-- Remove any incorrectly tracked kickoff steps that don't match the new IDs
UPDATE project_runs 
SET completed_steps = (
  SELECT jsonb_agg(step_id)
  FROM jsonb_array_elements_text(completed_steps) AS step_id
  WHERE step_id NOT IN ('kickoff-step-1', 'kickoff-step-2') 
    OR step_id IN (
      SELECT CASE 
        WHEN step_id = 'kickoff-step-1' AND 
             EXISTS(SELECT 1 FROM jsonb_array_elements_text(completed_steps) AS s WHERE s = 'kickoff-step-2') 
        THEN 'kickoff-step-2'  -- Convert old step-1 (Project Overview) to new step-2
        WHEN step_id = 'kickoff-step-2' 
        THEN 'kickoff-step-4'  -- Convert old step-2 (Agreement) to new step-4
        ELSE step_id
      END
      FROM jsonb_array_elements_text(completed_steps) AS inner_step
      WHERE inner_step = step_id
    )
)
WHERE template_id IN (
  SELECT id FROM projects 
  WHERE phases->0->>'name' = 'Kickoff'
)
AND (
  completed_steps ? 'kickoff-step-1' 
  OR completed_steps ? 'kickoff-step-2'
);