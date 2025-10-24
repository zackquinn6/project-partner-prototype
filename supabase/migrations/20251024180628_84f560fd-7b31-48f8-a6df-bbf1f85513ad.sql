-- Update instruction level terminology from 'contractor' to 'new_user'

-- Step 1: Drop the existing check constraint on step_instructions
ALTER TABLE step_instructions 
DROP CONSTRAINT IF EXISTS step_instructions_instruction_level_check;

-- Step 2: Update existing step_instructions records
UPDATE step_instructions 
SET instruction_level = 'new_user',
    updated_at = now()
WHERE instruction_level = 'contractor';

-- Step 3: Add new check constraint with updated values
ALTER TABLE step_instructions
ADD CONSTRAINT step_instructions_instruction_level_check 
CHECK (instruction_level IN ('quick', 'detailed', 'new_user'));

-- Step 4: Update existing project_runs records
UPDATE project_runs
SET instruction_level_preference = 'new_user',
    updated_at = now()
WHERE instruction_level_preference = 'contractor';

-- Step 5: Update default value for project_runs if needed
ALTER TABLE project_runs 
ALTER COLUMN instruction_level_preference SET DEFAULT 'detailed';

-- Step 6: Add comments to document the change
COMMENT ON COLUMN step_instructions.instruction_level IS 'Instruction detail level: quick, detailed, or new_user (formerly contractor)';
COMMENT ON COLUMN project_runs.instruction_level_preference IS 'User preferred instruction detail level: quick, detailed, or new_user (formerly contractor)';
