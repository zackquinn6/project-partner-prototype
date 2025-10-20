-- Populate instructions for Layout and Planning steps
-- Measure and Layout
INSERT INTO public.step_instructions (template_step_id, instruction_level, content)
SELECT 
  ts.id,
  'quick',
  jsonb_build_object(
    'text', 'Find room center, snap chalk lines, dry-lay tiles to plan layout.',
    'sections', jsonb_build_array(
      jsonb_build_object('title', 'Quick Steps', 'content', '• Mark room centerlines\n• Snap perpendicular chalk lines\n• Dry-lay tiles to check pattern\n• Adjust to avoid small cuts at edges', 'type', 'standard')
    ),
    'photos', jsonb_build_array(),
    'videos', jsonb_build_array(),
    'links', jsonb_build_array()
  )
FROM template_steps ts
JOIN template_operations toper ON ts.operation_id = toper.id
JOIN projects p ON toper.project_id = p.id
WHERE p.name ILIKE '%tile%' 
AND ts.step_title = 'Layout'
LIMIT 1;

INSERT INTO public.step_instructions (template_step_id, instruction_level, content)
SELECT 
  ts.id,
  'detailed',
  jsonb_build_object(
    'text', 'Proper layout planning ensures balanced tile placement and professional-looking results.',
    'sections', jsonb_build_array(
      jsonb_build_object('title', 'Find Center Point', 'content', 'Measure and mark the center of each wall. Snap chalk lines connecting opposite wall centers, creating perpendicular lines that intersect at room center. Verify lines are perfectly square using 3-4-5 triangle method.', 'type', 'standard'),
      jsonb_build_object('title', 'Dry Layout Test', 'content', 'Starting at center intersection, lay out tiles along both chalk lines without adhesive. Include spacers to represent grout joints. This reveals how tiles will align at room edges and in corners.', 'type', 'standard'),
      jsonb_build_object('title', 'Adjust for Best Fit', 'content', 'Evaluate end tiles - you want at least half a tile at all edges. If end cuts will be too narrow (less than 2"), shift the centerline by half a tile width. Recalculate and resnap lines if needed.', 'type', 'standard'),
      jsonb_build_object('title', 'Mark Reference Lines', 'content', 'Once satisfied with layout, mark additional reference lines every 3-4 tiles in both directions. These guide lines keep your installation straight as you work. Number quadrants for organization.', 'type', 'standard'),
      jsonb_build_object('title', 'Plan Cut Tiles', 'content', 'Identify all locations requiring cut tiles - around toilets, in corners, at doorways. Measure carefully and mark tiles for cutting before starting installation. Account for 1/8" expansion gap at walls.', 'type', 'tip')
    ),
    'photos', jsonb_build_array(),
    'videos', jsonb_build_array(
      jsonb_build_object('url', 'https://www.youtube.com/watch?v=BxPH6YYpLl8', 'title', 'Tile Layout Planning - This Old House')
    ),
    'links', jsonb_build_array(
      jsonb_build_object('url', 'https://www.thespruce.com/how-to-lay-out-tile-1822766', 'title', 'The Spruce: How to Layout Tile Floor')
    )
  )
FROM template_steps ts
JOIN template_operations toper ON ts.operation_id = toper.id
JOIN projects p ON toper.project_id = p.id
WHERE p.name ILIKE '%tile%' 
AND ts.step_title = 'Layout'
LIMIT 1;

INSERT INTO public.step_instructions (template_step_id, instruction_level, content)
SELECT 
  ts.id,
  'contractor',
  jsonb_build_object(
    'text', 'Execute precision layout per TCNA guidelines ensuring optimal tile distribution and pattern alignment.',
    'sections', jsonb_build_array(
      jsonb_build_object('title', 'Reference Grid Setup', 'content', 'Establish primary reference lines at room center using laser level or precision chalk lines. Verify perpendicularity with precision square - tolerance ±1/16" over 10''. For large format tile (>15"), establish additional reference grid at 4'' intervals.', 'type', 'standard'),
      jsonb_build_object('title', 'Pattern Analysis', 'content', 'For directional patterns (wood-look, etc.): determine optimal plank direction - typically perpendicular to main traffic flow. For patterns like herringbone or basketweave: calculate pattern repeat and establish starting point that maintains symmetry.', 'type', 'standard'),
      jsonb_build_object('title', 'Cut Tile Optimization', 'content', 'Calculate tile distribution to minimize cuts under 1/3 tile width. For large format: adjust grid to avoid cuts <6" which are prone to lippage. Consider waterfall edges, thresholds, and transitions in layout planning.', 'type', 'standard'),
      jsonb_build_object('title', 'Elevation Mapping', 'content', 'For lippage-sensitive installations (rectified tile, large format): map floor elevations along reference grid. Plan installation sequence starting from highest point. Note variations >1/8" requiring additional thinset buildup.', 'type', 'standard'),
      jsonb_build_object('title', 'Documentation', 'content', 'Photograph approved layout. Document: centerline locations, starting quadrant, pattern direction, threshold details, special cuts. Required for warranty claims and future repairs.', 'type', 'tip')
    ),
    'photos', jsonb_build_array(),
    'videos', jsonb_build_array(),
    'links', jsonb_build_array(
      jsonb_build_object('url', 'https://www.tcnatile.com/faqs/41-installation.html', 'title', 'TCNA - Professional Installation Standards'),
      jsonb_build_object('url', 'https://www.schluter.com/schluter-us/en_US/Tile-Installation', 'title', 'Schluter - Large Format Tile Layout')
    )
  )
FROM template_steps ts
JOIN template_operations toper ON ts.operation_id = toper.id
JOIN projects p ON toper.project_id = p.id
WHERE p.name ILIKE '%tile%' 
AND ts.step_title = 'Layout'
LIMIT 1;