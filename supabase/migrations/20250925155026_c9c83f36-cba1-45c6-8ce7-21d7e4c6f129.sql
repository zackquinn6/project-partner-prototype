-- Fix tile flooring project revisions step by step
-- Step 1: Update revision 5 to have no parent and become revision 1
UPDATE projects 
SET 
  revision_number = 1,
  parent_project_id = NULL,
  is_current_version = true
WHERE name = 'Tile Flooring Installation' 
AND revision_number = 5 
AND publish_status = 'published';

-- Step 2: Now delete the old revisions (1-4) since revision 5 no longer references them
DELETE FROM projects 
WHERE name = 'Tile Flooring Installation' 
AND revision_number IN (2, 3, 4)
AND publish_status = 'archived';

-- Step 3: Delete the original revision 1 (which was the parent)
DELETE FROM projects 
WHERE name = 'Tile Flooring Installation' 
AND revision_number = 1
AND publish_status = 'archived';