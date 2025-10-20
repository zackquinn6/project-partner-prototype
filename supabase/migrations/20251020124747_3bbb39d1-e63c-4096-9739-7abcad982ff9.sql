-- Populate instructions for Grouting (Finish phase)
-- Apply grout step
INSERT INTO public.step_instructions (template_step_id, instruction_level, content)
SELECT 
  ts.id,
  'quick',
  jsonb_build_object(
    'text', 'Mix grout, spread diagonally across tiles, pack joints, clean excess.',
    'sections', jsonb_build_array(
      jsonb_build_object('title', 'Grouting Steps', 'content', '• Mix grout to peanut butter consistency\n• Spread diagonally with rubber float\n• Pack grout into joints\n• Remove excess at 45° angle\n• Wipe with damp sponge\n• Buff haze after drying', 'type', 'standard')
    ),
    'photos', jsonb_build_array(),
    'videos', jsonb_build_array(),
    'links', jsonb_build_array()
  )
FROM template_steps ts
JOIN template_operations toper ON ts.operation_id = toper.id
JOIN projects p ON toper.project_id = p.id
WHERE p.name ILIKE '%tile%' 
AND ts.step_title = 'Apply grout'
LIMIT 1;

INSERT INTO public.step_instructions (template_step_id, instruction_level, content)
SELECT 
  ts.id,
  'detailed',
  jsonb_build_object(
    'text', 'Grouting fills the joints between tiles and provides a finished, professional appearance.',
    'sections', jsonb_build_array(
      jsonb_build_object('title', 'Preparation', 'content', 'Ensure thinset has cured for at least 24 hours (48-72 for large format tiles). Remove all spacers and clean joints of debris. Vacuum thoroughly. For unsealed natural stone, seal tile faces before grouting to prevent staining.', 'type', 'standard'),
      jsonb_build_object('title', 'Mixing Grout', 'content', 'Pour clean water into bucket first, then add grout powder. Mix with drill and paddle to smooth, peanut butter-like consistency. Let slake (rest) for 10 minutes, then remix. Do not add more water after initial mix - this weakens grout. Mix only what you can apply in 30 minutes.', 'type', 'standard'),
      jsonb_build_object('title', 'Application', 'content', 'Scoop grout onto tiles with margin trowel. Spread using rubber grout float held at 45° angle, working diagonally across tile joints. Make multiple passes to pack grout firmly into joints with no voids. Joints should be filled flush with tile surface.', 'type', 'standard'),
      jsonb_build_object('title', 'Removing Excess', 'content', 'Hold float at 90° and scrape diagonally across tiles to remove excess grout. Work carefully to avoid pulling grout from joints. Wait 10-15 minutes until grout begins to firm up, then start sponge cleaning.', 'type', 'standard'),
      jsonb_build_object('title', 'Sponge Cleaning', 'content', 'Use barely damp sponge in circular motion to smooth joints and clean tile faces. Rinse sponge frequently in clean water. Do not over-wet - this can weaken grout. Make multiple light passes rather than heavy scrubbing.', 'type', 'standard'),
      jsonb_build_object('title', 'Final Cleanup', 'content', 'After 30 minutes, wipe away grout haze with clean, dry cloth. You may need to buff several times as grout continues to dry. For stubborn haze, use diluted vinegar solution (1:4 ratio) after grout has cured 48 hours.', 'type', 'standard'),
      jsonb_build_object('title', 'Important', 'content', 'Do not walk on floor for 24 hours. Keep dry for 72 hours - no water contact. Cure time before sealing: 48-72 hours for standard grout, 24 hours for rapid-set grout.', 'type', 'warning')
    ),
    'photos', jsonb_build_array(),
    'videos', jsonb_build_array(
      jsonb_build_object('url', 'https://www.youtube.com/watch?v=GT8m70GaNpY', 'title', 'How to Grout Tile - This Old House')
    ),
    'links', jsonb_build_array(
      jsonb_build_object('url', 'https://www.homedepot.com/c/ah/how-to-grout-tile/9ba683603be9fa5395fab90b73398e3', 'title', 'Home Depot: How to Grout Tile')
    )
  )
FROM template_steps ts
JOIN template_operations toper ON ts.operation_id = toper.id
JOIN projects p ON toper.project_id = p.id
WHERE p.name ILIKE '%tile%' 
AND ts.step_title = 'Apply grout'
LIMIT 1;

INSERT INTO public.step_instructions (template_step_id, instruction_level, content)
SELECT 
  ts.id,
  'contractor',
  jsonb_build_object(
    'text', 'Execute grouting per ANSI A108.10 standards with proper mixing ratios and application technique.',
    'sections', jsonb_build_array(
      jsonb_build_object('title', 'Pre-Grouting Requirements', 'content', 'Verify thinset cure: minimum 24h for modified, 48-72h for large format/unmodified. Joints must be free of thinset and debris to minimum 2/3 tile thickness. For natural stone: apply appropriate sealer to tile faces pre-grout. Test section recommended.', 'type', 'standard'),
      jsonb_build_object('title', 'Grout Selection & Mixing', 'content', 'Use sanded grout for joints >1/8", unsanded for <1/8". Epoxy grout for commercial/wet areas per ANSI A118.3. Mix to fluid consistency using drill and paddle - precise water ratio critical. Slake 10 minutes, remix without additional water. Working time: 30 minutes at 70°F.', 'type', 'standard'),
      jsonb_build_object('title', 'Application Protocol', 'content', 'Apply with hard rubber float at 45° angle, working diagonally. Multiple passes to achieve full joint density - no voids. For joints >3/8", apply in lifts. Pack firmly to eliminate air pockets which cause grout failure. Maintain consistent joint depth - typically flush with tile edges.', 'type', 'standard'),
      jsonb_build_object('title', 'Cleanup Sequence', 'content', 'Initial strike-off at 90° angle. Wait for initial set (10-20 min depending on conditions). Sponge cleanup using barely damp sponge - rinse frequently. Multiple light passes, never over-wet. Final buffing with dry microfiber after 30-60 minutes. Haze removal within 24h if needed.', 'type', 'standard'),
      jsonb_build_object('title', 'Movement Joint Treatment', 'content', 'Do NOT grout movement joints at perimeters, changes in plane, or over structural joints. Install approved movement joint material (silicone, urethane sealant) per TCNA EJ171. Color-match to grout. Critical for preventing crack transmission.', 'type', 'warning'),
      jsonb_build_object('title', 'Curing & Sealing', 'content', 'Cure time before foot traffic: 24-48h. Before heavy traffic: 72h. Keep dry during cure. For cement-based grout: apply penetrating sealer after 48-72h cure per manufacturer specs. Reapply annually in high-traffic areas. Epoxy grout requires no sealing.', 'type', 'standard'),
      jsonb_build_object('title', 'Quality Control', 'content', 'Verify: uniform joint color, no pinholes/voids, consistent joint depth, clean tile faces, proper cure before traffic. Document application date, product used, and coverage for warranty compliance.', 'type', 'tip')
    ),
    'photos', jsonb_build_array(),
    'videos', jsonb_build_array(),
    'links', jsonb_build_array(
      jsonb_build_object('url', 'https://www.tcnatile.com/faqs/42-grouting-and-caulking.html', 'title', 'TCNA Handbook - Grouting Standards'),
      jsonb_build_object('url', 'https://www.custom BuildingProducts.com/products/grout', 'title', 'Custom Building Products - Grout Selection Guide'),
      jsonb_build_object('url', 'https://www.schluter.com/schluter-us/en_US/Grout', 'title', 'Schluter - Grout Application Guidelines')
    )
  )
FROM template_steps ts
JOIN template_operations toper ON ts.operation_id = toper.id
JOIN projects p ON toper.project_id = p.id
WHERE p.name ILIKE '%tile%' 
AND ts.step_title = 'Apply grout'
LIMIT 1;