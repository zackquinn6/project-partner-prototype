-- Add workflow decision support to template operations and steps

-- Add columns to template_operations for decision workflow
ALTER TABLE template_operations
ADD COLUMN IF NOT EXISTS flow_type text,
ADD COLUMN IF NOT EXISTS user_prompt text,
ADD COLUMN IF NOT EXISTS alternate_group text;

-- Add column to template_steps for flow type
ALTER TABLE template_steps
ADD COLUMN IF NOT EXISTS flow_type text DEFAULT 'prime';

-- Add comments
COMMENT ON COLUMN template_operations.flow_type IS 'Workflow type: prime, alternate, if-necessary';
COMMENT ON COLUMN template_operations.user_prompt IS 'Question to ask user for alternate/if-necessary choices';
COMMENT ON COLUMN template_operations.alternate_group IS 'Group ID for grouping alternate operations together';
COMMENT ON COLUMN template_steps.flow_type IS 'Step flow type: prime, alternate, if-necessary, repeat, inspection';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_template_operations_flow_type ON template_operations(flow_type);
CREATE INDEX IF NOT EXISTS idx_template_steps_flow_type ON template_steps(flow_type);