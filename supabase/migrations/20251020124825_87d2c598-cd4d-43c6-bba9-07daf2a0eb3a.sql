-- Populate instructions for Sealing (Finish phase)
-- Seal grout step
INSERT INTO public.step_instructions (template_step_id, instruction_level, content)
SELECT 
  ts.id,
  'quick',
  jsonb_build_object(
    'text', 'Apply penetrating sealer to grout lines after grout has fully cured.',
    'sections', jsonb_build_array(
      jsonb_build_object('title', 'Sealing Steps', 'content', '• Wait 48-72 hours after grouting\n• Apply sealer with applicator or brush\n• Let penetrate 5-10 minutes\n• Wipe excess from tile faces\n• Allow to cure per product instructions', 'type', 'standard')
    ),
    'photos', jsonb_build_array(),
    'videos', jsonb_build_array(),
    'links', jsonb_build_array()
  )
FROM template_steps ts
JOIN template_operations toper ON ts.operation_id = toper.id
JOIN projects p ON toper.project_id = p.id
WHERE p.name ILIKE '%tile%' 
AND ts.step_title = 'Seal grout'
LIMIT 1;

INSERT INTO public.step_instructions (template_step_id, instruction_level, content)
SELECT 
  ts.id,
  'detailed',
  jsonb_build_object(
    'text', 'Sealing grout protects against staining and moisture penetration, extending the life of your tile installation.',
    'sections', jsonb_build_array(
      jsonb_build_object('title', 'When to Seal', 'content', 'Wait minimum 48-72 hours after grouting for cement-based grout to fully cure. Grout must be completely dry - no dark spots indicating moisture. Test readiness by placing a few drops of water on grout - if it beads up, not ready; if it absorbs, ready to seal.', 'type', 'standard'),
      jsonb_build_object('title', 'Surface Preparation', 'content', 'Clean tile and grout thoroughly with pH-neutral cleaner. Remove all dirt, grout haze, and residue. Rinse well and allow to dry completely - typically 24 hours. Any contamination prevents sealer penetration and bonding.', 'type', 'standard'),
      jsonb_build_object('title', 'Sealer Selection', 'content', 'Use penetrating/impregnating sealer for cement-based grout - these soak into grout pores. For natural stone, use stone-safe sealer. Avoid topical sealers which can create slippery surfaces and yellow over time. Note: Epoxy grout does not require sealing.', 'type', 'standard'),
      jsonb_build_object('title', 'Application Method', 'content', 'Apply sealer using foam brush, applicator bottle, or small paint brush. Work in small sections (3x3 feet). Apply liberally to grout lines, allowing sealer to penetrate for 5-10 minutes. Some sealers require two coats.', 'type', 'standard'),
      jsonb_build_object('title', 'Removing Excess', 'content', 'Before sealer dries, wipe excess from tile faces using clean, dry cloth. Work in circular motion. Sealer left on tile faces creates hazy residue that is difficult to remove later. Check tile faces from different angles in good light.', 'type', 'warning'),
      jsonb_build_object('title', 'Curing and Maintenance', 'content', 'Allow sealer to cure per manufacturer instructions before water contact - typically 24-48 hours. Reapply sealer annually in high-traffic areas, every 2-3 years in low-traffic areas. Test effectiveness periodically with water droplet test.', 'type', 'standard'),
      jsonb_build_object('title', 'Natural Stone Note', 'content', 'Many natural stones (marble, limestone, travertine) also require sealing. Apply stone sealer before and after grouting per manufacturer recommendations. Some dense stones like porcelain or granite tiles do not require sealing.', 'type', 'tip')
    ),
    'photos', jsonb_build_array(),
    'videos', jsonb_build_array(
      jsonb_build_object('url', 'https://www.youtube.com/watch?v=KJV1gF3Ajdc', 'title', 'How to Seal Grout - This Old House')
    ),
    'links', jsonb_build_array(
      jsonb_build_object('url', 'https://www.thespruce.com/how-to-seal-grout-1824850', 'title', 'The Spruce: How to Seal Grout'),
      jsonb_build_object('url', 'https://www.homedepot.com/c/ab/types-of-grout-sealer/9ba683603be9fa5395fab90a7655920', 'title', 'Home Depot: Grout Sealer Types')
    )
  )
FROM template_steps ts
JOIN template_operations toper ON ts.operation_id = toper.id
JOIN projects p ON toper.project_id = p.id
WHERE p.name ILIKE '%tile%' 
AND ts.step_title = 'Seal grout'
LIMIT 1;

INSERT INTO public.step_instructions (template_step_id, instruction_level, content)
SELECT 
  ts.id,
  'contractor',
  jsonb_build_object(
    'text', 'Apply appropriate sealer per ANSI A118.13 standards for maximum stain and moisture protection.',
    'sections', jsonb_build_array(
      jsonb_build_object('title', 'Sealer Classification', 'content', 'Penetrating/Impregnating sealers: Recommended for cement-based grout per ANSI A118.13. Silicone, siloxane, or fluoropolymer-based. Penetrates pores without altering appearance. Surface sealers (acrylics): Not recommended - trap moisture, yellow, create slip hazard. Epoxy grout: No sealing required.', 'type', 'standard'),
      jsonb_build_object('title', 'Pre-Application Verification', 'content', 'Verify grout cure: Minimum 72 hours for standard grout, 14 days for epoxy grout (if sealing adjacent stone). Moisture meter reading <5% in grout. Surface must be clean per ANSI A137.1 - pH neutral cleaner, no residue. Test sealer on inconspicuous area first.', 'type', 'standard'),
      jsonb_build_object('title', 'Application Protocol', 'content', 'Apply using low-pressure sprayer or foam applicator. Two thin coats superior to single heavy coat. Allow first coat to penetrate per manufacturer specs (typically 5-15 minutes). Remove excess before drying using lint-free cloth. Second coat after first is dry (1-4 hours depending on product).', 'type', 'standard'),
      jsonb_build_object('title', 'Natural Stone Considerations', 'content', 'Test stone absorption with water droplet before grouting. High absorption stones (marble, limestone, travertine) require pre-grout sealing to prevent grout staining. Use stone-specific penetrating sealer. Reseal post-grout after 72h cure. Dense stones (porcelain, granite) typically need no sealing.', 'type', 'standard'),
      jsonb_build_object('title', 'Performance Verification', 'content', 'Conduct water droplet test 24h post-application. Water should bead on grout surface for 5-10 minutes minimum before absorbing. If immediate absorption, additional coat required. Document product used, application date, coverage rate for warranty.', 'type', 'standard'),
      jsonb_build_object('title', 'Maintenance Schedule', 'content', 'High-traffic commercial: Annual reapplication. Residential high-traffic (kitchens, entries): 1-2 years. Low-traffic residential: 2-3 years. Wet areas (showers): Annual inspection, reseal as needed. Conduct bi-annual water droplet tests.', 'type', 'tip'),
      jsonb_build_object('title', 'Code Compliance', 'content', 'ADA-compliant installations: Verify sealer does not create slip hazard - test with DCOF AcuTest per ANSI A326.3. Minimum wet DCOF: 0.42. Food service areas: Use food-safe, non-toxic sealer compliant with FDA regulations.', 'type', 'warning')
    ),
    'photos', jsonb_build_array(),
    'videos', jsonb_build_array(),
    'links', jsonb_build_array(
      jsonb_build_object('url', 'https://www.tcnatile.com/faqs/42-grouting-and-caulking.html', 'title', 'TCNA - Grout Sealing Standards'),
      jsonb_build_object('url', 'https://www.tilecouncil.org/maintenance/grout-sealing', 'title', 'Tile Council of North America - Sealer Selection'),
      jsonb_build_object('url', 'https://www.custom BuildingProducts.com/products/sealers', 'title', 'Custom Building Products - Penetrating Sealers')
    )
  )
FROM template_steps ts
JOIN template_operations toper ON ts.operation_id = toper.id
JOIN projects p ON toper.project_id = p.id
WHERE p.name ILIKE '%tile%' 
AND ts.step_title = 'Seal grout'
LIMIT 1;