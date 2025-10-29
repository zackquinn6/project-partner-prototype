-- Manually reorder Kickoff operations to correct order
UPDATE template_operations
SET display_order = 0,
    updated_at = now()
WHERE id = 'd78049e0-6a4c-46b6-85c9-8eedcb5625d3' -- Project Overview
  AND project_id = '00000000-0000-0000-0000-000000000001';

UPDATE template_operations
SET display_order = 1,
    updated_at = now()
WHERE id = '8699b7c2-d504-4206-845c-4b1194cf3214' -- DIY Profile
  AND project_id = '00000000-0000-0000-0000-000000000001';

UPDATE template_operations
SET display_order = 2,
    updated_at = now()
WHERE id = '80cab82f-414b-4b4e-b953-8809ac4a891a' -- Project Profile
  AND project_id = '00000000-0000-0000-0000-000000000001';

-- Rebuild phases JSON from the reordered template data
UPDATE projects
SET phases = rebuild_phases_json_from_templates(id),
    updated_at = now()
WHERE id = '00000000-0000-0000-0000-000000000001';