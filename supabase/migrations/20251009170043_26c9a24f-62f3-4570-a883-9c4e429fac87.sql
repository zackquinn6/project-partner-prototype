-- Add structured JSONB columns to project_runs for app-specific data
ALTER TABLE project_runs
ADD COLUMN shopping_checklist_data jsonb DEFAULT '{"orderedItems": [], "completedDate": null}'::jsonb,
ADD COLUMN schedule_events jsonb DEFAULT '{"events": [], "teamMembers": [], "globalSettings": {}}'::jsonb,
ADD COLUMN customization_decisions jsonb DEFAULT '{"standardDecisions": {}, "ifNecessaryWork": {}, "customPlannedWork": [], "customUnplannedWork": [], "workflowOrder": []}'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN project_runs.shopping_checklist_data IS 'Stores ordered items and completion status for shopping checklist app';
COMMENT ON COLUMN project_runs.schedule_events IS 'Stores calendar events, team members, and scheduling preferences for project scheduler app';
COMMENT ON COLUMN project_runs.customization_decisions IS 'Stores user decisions, custom work items, and workflow order for project customizer app';