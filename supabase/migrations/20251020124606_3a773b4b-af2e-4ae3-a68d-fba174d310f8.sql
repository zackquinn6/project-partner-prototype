-- Populate instructions for Subfloor Prep steps
-- Install concrete board
INSERT INTO public.step_instructions (template_step_id, instruction_level, content)
SELECT 
  ts.id,
  'quick',
  jsonb_build_object(
    'text', 'Cut and screw cement board to subfloor with 1/8" gaps. Tape seams with alkali-resistant mesh tape.',
    'sections', jsonb_build_array(
      jsonb_build_object('title', 'Key Steps', 'content', '• Cut cement board to fit\n• Leave 1/8" expansion gaps\n• Screw every 8" on edges, 12" in field\n• Tape all seams', 'type', 'standard')
    ),
    'photos', jsonb_build_array(),
    'videos', jsonb_build_array(),
    'links', jsonb_build_array()
  )
FROM template_steps ts
JOIN template_operations toper ON ts.operation_id = toper.id
JOIN projects p ON toper.project_id = p.id
WHERE p.name ILIKE '%tile%' 
AND ts.step_title = 'Install concrete board'
LIMIT 1;

INSERT INTO public.step_instructions (template_step_id, instruction_level, content)
SELECT 
  ts.id,
  'detailed',
  jsonb_build_object(
    'text', 'Install cement backer board following TCNA guidelines for proper substrate preparation.',
    'sections', jsonb_build_array(
      jsonb_build_object('title', 'Measure and Cut', 'content', 'Measure room dimensions and cut cement board panels to fit. Score the board with a utility knife and snap along the line. Use a jigsaw for curved cuts around toilets or pipes.', 'type', 'standard'),
      jsonb_build_object('title', 'Layout Planning', 'content', 'Start with full sheets along the most visible wall. Stagger seams like brickwork - avoid four-corner intersections. Leave 1/8" gaps at all edges and between sheets for expansion.', 'type', 'standard'),
      jsonb_build_object('title', 'Fastening', 'content', 'Use 1-1/4" cement board screws every 8" around perimeter and every 12" in the field. Drive screws flush but not countersunk - cement board should pull tight to subfloor without breaking surface.', 'type', 'standard'),
      jsonb_build_object('title', 'Seam Treatment', 'content', 'Apply thin-set mortar over all seams and embed 2" wide alkali-resistant fiberglass mesh tape. Smooth with trowel and let dry per manufacturer specifications (typically 24 hours).', 'type', 'standard'),
      jsonb_build_object('title', 'Important', 'content', 'Never butt cement board tightly together - expansion gaps are critical. In wet areas, apply waterproofing membrane over entire surface after seams cure.', 'type', 'warning')
    ),
    'photos', jsonb_build_array(),
    'videos', jsonb_build_array(
      jsonb_build_object('url', 'https://www.youtube.com/watch?v=Way3VxjH0Qs', 'title', 'How to Install Cement Board - This Old House')
    ),
    'links', jsonb_build_array(
      jsonb_build_object('url', 'https://www.homedepot.com/c/ah/how-to-install-cement-board/9ba683603be9fa5395fab90b8cd4', 'title', 'Home Depot: How to Install Cement Board', 'description', 'Complete guide with photos')
    )
  )
FROM template_steps ts
JOIN template_operations toper ON ts.operation_id = toper.id
JOIN projects p ON toper.project_id = p.id
WHERE p.name ILIKE '%tile%' 
AND ts.step_title = 'Install concrete board'
LIMIT 1;

INSERT INTO public.step_instructions (template_step_id, instruction_level, content)
SELECT 
  ts.id,
  'contractor',
  jsonb_build_object(
    'text', 'Install CBU per TCNA Handbook Method F111 for wood subfloor or F145 for concrete.',
    'sections', jsonb_build_array(
      jsonb_build_object('title', 'Substrate Requirements', 'content', 'Wood subfloor must be minimum 5/8" exterior grade plywood or OSB with 16" OC joists. Maximum deflection L/360. Concrete must be cured minimum 28 days, flat to 1/4" in 10''.', 'type', 'standard'),
      jsonb_build_object('title', 'Installation Specs', 'content', 'Use 1/2" or 5/8" CBU depending on application. Fasten with approved screws: 1-1/4" for 1/2" board, 1-5/8" for 5/8" board. Spacing: 8" OC perimeter, 12" OC field. Minimum 3/8" from edges.', 'type', 'standard'),
      jsonb_build_object('title', 'Seam Treatment', 'content', 'Embed 2" alkali-resistant mesh tape in thin-set mortar (ANSI A118.1 or A118.4). Apply 1/16" thin-set layer, embed tape, apply second layer. Total thickness not to exceed 1/8".', 'type', 'standard'),
      jsonb_build_object('title', 'Waterproofing', 'content', 'For wet areas: Apply liquid or sheet membrane per ANSI A118.10. Critical at seams, corners, and penetrations. Schluter-KERDI or equivalent. Extend 6" up walls minimum.', 'type', 'standard'),
      jsonb_build_object('title', 'Code Compliance', 'content', 'Verify local code requirements. IRC R702.4.2 requires water-resistant backing in wet areas. Some jurisdictions require licensed plumber for drain work.', 'type', 'warning')
    ),
    'photos', jsonb_build_array(),
    'videos', jsonb_build_array(),
    'links', jsonb_build_array(
      jsonb_build_object('url', 'https://www.tcnatile.com/faqs/35-subfloor-preparation.html', 'title', 'TCNA Handbook - Subfloor Preparation Methods'),
      jsonb_build_object('url', 'https://www.schluter.com/schluter-us/en_US/Preparation', 'title', 'Schluter Systems - Substrate Preparation')
    )
  )
FROM template_steps ts
JOIN template_operations toper ON ts.operation_id = toper.id
JOIN projects p ON toper.project_id = p.id
WHERE p.name ILIKE '%tile%' 
AND ts.step_title = 'Install concrete board'
LIMIT 1;