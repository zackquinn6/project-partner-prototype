-- Add apps to Standard Project Foundation
-- This migration adds app references to specific workflow steps in the Standard Project

-- Update Project Planning step to include Project Customizer app
UPDATE projects
SET phases = jsonb_set(
  phases,
  '{0,operations,0,steps,0,apps}',
  '[{
    "id": "app-project-customizer",
    "appName": "Project Customizer",
    "appType": "native",
    "icon": "Settings",
    "description": "Customize your project phases and decisions",
    "actionKey": "project-customizer",
    "displayOrder": 1
  }]'::jsonb,
  true
)
WHERE id = '00000000-0000-0000-0000-000000000001'
AND phases->0->'operations'->0->'steps'->0 IS NOT NULL;

-- Update Project Scheduling step to include Project Scheduler app
UPDATE projects
SET phases = jsonb_set(
  phases,
  '{0,operations,1,steps,0,apps}',
  '[{
    "id": "app-project-scheduler",
    "appName": "Project Scheduler",
    "appType": "native",
    "icon": "Calendar",
    "description": "Plan your project timeline",
    "actionKey": "project-scheduler",
    "displayOrder": 1
  }]'::jsonb,
  true
)
WHERE id = '00000000-0000-0000-0000-000000000001'
AND phases->0->'operations'->1->'steps'->0 IS NOT NULL;

-- Update Ordering step to include Shopping Checklist and Materials Selection apps
UPDATE projects
SET phases = jsonb_set(
  phases,
  '{1,operations,0,steps,0,apps}',
  '[{
    "id": "app-shopping-checklist",
    "appName": "Shopping Checklist",
    "appType": "native",
    "icon": "ShoppingCart",
    "description": "Order tools and materials",
    "actionKey": "shopping-checklist",
    "displayOrder": 1
  }, {
    "id": "app-materials-selection",
    "appName": "Materials Selection",
    "appType": "native",
    "icon": "Package",
    "description": "Select and manage project materials",
    "actionKey": "materials-selection",
    "displayOrder": 2
  }]'::jsonb,
  true
)
WHERE id = '00000000-0000-0000-0000-000000000001'
AND phases->1->'operations'->0->'steps'->0 IS NOT NULL;