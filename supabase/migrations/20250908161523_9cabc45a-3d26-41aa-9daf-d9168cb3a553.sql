-- Update and add comprehensive maintenance templates
-- First update existing templates to avoid foreign key constraint issues
UPDATE maintenance_templates SET 
  title = 'Clean HVAC Air Filter',
  description = 'Replace or clean your HVAC system air filter to improve air quality and efficiency',
  category = 'hvac',
  frequency_days = 30,
  instructions = 'Locate filter in return air duct or HVAC unit. Remove old filter. Insert new filter with airflow arrow pointing toward unit. Check monthly and replace every 1-3 months depending on usage.'
WHERE id = '0bfe4495-70db-42ab-84a8-08826933f6b5';

UPDATE maintenance_templates SET 
  title = 'Test Smoke Detector Batteries',
  description = 'Test smoke detectors and carbon monoxide detectors monthly, replace batteries annually',
  category = 'safety',
  frequency_days = 30,
  instructions = 'Press and hold test button on each detector. If beep is weak or absent, replace 9V battery. Test monthly, replace batteries annually. Test GFCI outlets by pressing test then reset buttons.'
WHERE id = 'ff2d4a38-a05f-43b0-9d0f-b59ad81b2527';

UPDATE maintenance_templates SET
  title = 'Check Door and Window Seals',
  description = 'Inspect weather stripping around doors and windows for gaps or damage to improve energy efficiency',
  category = 'hvac',
  frequency_days = 180,
  instructions = 'Run your hand around door and window frames to feel for air leaks. Check for cracked, torn, or compressed weather stripping. Replace as needed to prevent drafts.'
WHERE id = 'e24173f1-05d0-47d3-a746-47eeb50922ea';

UPDATE maintenance_templates SET
  title = 'Flush Hot Water Heater',
  description = 'Drain and flush your hot water heater to remove sediment buildup and improve efficiency',
  category = 'plumbing',
  frequency_days = 180,
  instructions = 'Turn off power/gas to heater. Connect hose to drain valve. Open drain valve and hot water tap to flush tank until water runs clear. Check for leaks around base.'
WHERE id = '34b3246d-30c3-4248-ad99-2625e7cdf842';

UPDATE maintenance_templates SET
  title = 'Change Refrigerator Water Filter',
  description = 'Replace the water filter in your refrigerator every 6 months to ensure clean, fresh-tasting water',
  category = 'appliances',
  frequency_days = 180,
  instructions = 'Locate the filter (usually inside the fridge or in the grille at the bottom). Turn counterclockwise to remove old filter. Insert new filter and turn clockwise until snug. Reset filter indicator if equipped.'
WHERE id = '6d5173ff-f58c-4ceb-8d78-d59903637600';

-- Now add comprehensive new maintenance templates
INSERT INTO maintenance_templates (title, description, category, frequency_days, instructions) VALUES

-- Monthly Tasks
('Vacuum Heat Registers', 'Clean heat registers and vents to ensure proper airflow', 'hvac', 30, 'Remove register covers. Vacuum inside ducts as far as possible. Wipe down register covers with damp cloth and reinstall.'),
('Check Air Vents', 'Ensure indoor and outdoor air vents are not blocked by furniture, debris, or vegetation', 'hvac', 30, 'Walk around home checking all exterior vents. Move any obstructions. Check indoor vents for furniture blocking airflow.'),
('Clean Garbage Disposal', 'Clean and deodorize garbage disposal to prevent clogs and odors', 'plumbing', 30, 'Grind ice cubes in disposal. Follow with hot water and baking soda. Run for 30 seconds then flush with hot water.'),
('Check Water Softener', 'Inspect water softener and replenish salt if necessary', 'plumbing', 30, 'Check salt level in brine tank. Add salt if below 1/3 full. Check for salt bridges or mushing.'),
('Inspect Sink Drains', 'Check tub and sink drains for debris and unclog if necessary', 'plumbing', 30, 'Remove visible debris from drain openings. Pour hot water down drains. Use drain cleaner if slow drainage detected.'),
('Inspect Electrical Cords', 'Check electrical cords throughout home for wear, damage, or fraying', 'safety', 30, 'Examine all visible electrical cords for cuts, burns, or exposed wires. Replace any damaged cords immediately.'),
('Test Generator', 'If you have a backup generator, test monthly during winter months', 'electrical', 30, 'Start generator and let run for 10-15 minutes. Check oil and fuel levels. Test transfer switch operation.'),
('Inspect Pool Equipment', 'If you have a pool, maintain equipment and water quality', 'outdoor', 30, 'Test and balance water chemistry weekly. Clean filters monthly. Inspect pump and filter system operation.'),

-- Quarterly Tasks (90 days)
('Clean Dryer Vent', 'Remove lint buildup from dryer vent to prevent fire hazards', 'appliances', 90, 'Disconnect dryer from wall. Clean lint trap thoroughly. Use dryer vent brush to clean vent pipe from both ends.'),
('Pest Prevention Prep', 'Prevent pests by maintaining yard and sealing entry points', 'exterior', 90, 'Keep firewood 20+ feet from house. Trim shrubs away from siding. Repair rotten woodwork. Remove wasp nests from eaves.'),

-- Semi-Annual Tasks (180 days)
('Clean Gutters and Downspouts', 'Remove leaves and debris from gutters and downspouts to prevent water damage', 'exterior', 180, 'Use ladder safely to access gutters. Remove all leaves and debris by hand or with scoop. Flush downspouts with hose to check for clogs.'),
('Power Wash Exterior', 'Clean windows and siding to remove dirt, mold, and mildew buildup', 'exterior', 180, 'Use appropriate pressure setting for surface. Work from top to bottom. Clean windows and siding methodically.'),
('Inspect Roofing', 'Check roof for missing, loose, or damaged shingles and potential leaks', 'exterior', 180, 'From ground level, use binoculars to inspect shingles. Look for missing, cracked, or curled shingles. Check flashing around vents and chimney.'),
('Inspect Door Hardware', 'Check and repair exterior door handles, locks, and hinges', 'security', 180, 'Test all door handles and locks for proper operation. Oil squeaky hinges. Tighten loose screws. Replace worn hardware.'),
('Clean Carpets', 'Deep clean carpets to remove accumulated dirt and allergens', 'interior', 180, 'Vacuum thoroughly first. Use steam cleaner or hire professional service. Allow adequate drying time.'),
('Test Sump Pump', 'Ensure sump pump is working properly before rainy season', 'plumbing', 180, 'Pour water into sump pit to test pump operation. Check that discharge pipe directs water away from foundation.'),
('Inspect Attic and Basement', 'Check for moisture, pests, or structural issues in hidden areas', 'interior', 180, 'Look for water stains, pest droppings, or unusual odors. Check stored items for moisture damage.'),
('Service Garage Door', 'Lubricate and adjust garage door mechanism', 'exterior', 180, 'Lubricate hinges, rollers, and tracks. Test auto-reverse safety feature. Check remote control batteries.'),
('Clean Windows', 'Wash interior and exterior windows for improved visibility and curb appeal', 'interior', 180, 'Use appropriate glass cleaner. Clean frames and sills. Check for cracked or damaged window panes.'),

-- Annual Tasks (365 days)
('Rake Leaves and Aerate Lawn', 'Prepare lawn for winter by removing leaves and aerating soil', 'landscaping', 365, 'Rake all leaves from lawn area. Use core aerator or spike aerator to improve soil drainage and root growth.'),
('Winterize Exterior Plumbing', 'Drain and winterize outdoor water systems before freezing weather', 'plumbing', 365, 'Disconnect and drain garden hoses. Shut off interior valves to outdoor faucets. Drain in-ground sprinkler systems.'),
('Repair Driveway and Walkways', 'Fill cracks and gaps in concrete surfaces before winter freeze cycles', 'exterior', 365, 'Clean out cracks and apply concrete crack filler. Seal larger gaps with concrete patch compound. Allow to cure per manufacturer instructions.'),
('Touch Up Exterior Paint', 'Inspect and touch up exterior siding and trim paint to protect from weather', 'exterior', 365, 'Scrape loose paint. Prime bare wood. Apply matching exterior paint to damaged areas. Focus on south and west-facing surfaces.'),
('Seal Windows and Doors', 'Apply caulk or weather stripping to prevent drafts and improve energy efficiency', 'hvac', 365, 'Check all window and door frames for gaps. Apply new caulk to exterior gaps. Replace worn weather stripping around doors.'),
('Insulate Outdoor Pipes', 'Protect outdoor faucets and pipes from freezing temperatures', 'plumbing', 365, 'Wrap foam insulation around outdoor faucets. Insulate pipes in unheated garages and crawl spaces.'),
('HVAC System Inspection', 'Have forced-air heating system professionally inspected before heating season', 'hvac', 365, 'Schedule professional inspection of furnace, heat pump, or boiler. Replace filter, check belts, test safety controls.'),
('Fireplace and Chimney Check', 'Inspect fireplace for damage and clean flues before use', 'safety', 365, 'Check fireplace screen and tools. Have chimney professionally cleaned and inspected. Test damper operation.'),
('Appliance Tune-Up', 'Service major appliances before heavy holiday use', 'appliances', 365, 'Clean refrigerator coils. Check dishwasher filter. Clean dryer vent. Test oven temperature accuracy.'),
('Replace Detector Batteries', 'Replace batteries in smoke and carbon monoxide detectors annually', 'safety', 365, 'Replace all 9V batteries in smoke and CO detectors. Test each unit after battery replacement. Install detectors on every floor.'),
('Inspect Roof After Winter', 'Check for winter damage to roofing materials', 'exterior', 365, 'Look for loose or missing shingles. Check gutters for damage. Inspect flashing and seals around roof penetrations.'),
('Service Air Conditioning', 'Prepare AC system for cooling season', 'hvac', 365, 'Replace filter. Clean outdoor unit coils. Check refrigerant lines. Schedule professional tune-up if needed.'),
('Check Deck and Patio', 'Inspect outdoor structures for winter damage and safety issues', 'exterior', 365, 'Look for loose boards or railings. Check for rot or insect damage. Clean and apply deck stain or sealant as needed.'),
('Test Irrigation System', 'Inspect and test sprinkler system after winter shutdown', 'landscaping', 365, 'Turn on water supply slowly. Check each zone for proper operation. Replace damaged sprinkler heads.'),
('Inspect Foundation', 'Check foundation for cracks, settling, or water damage', 'exterior', 365, 'Walk around home perimeter checking foundation walls. Look for new cracks, water stains, or pest entry points.'),
('Check Attic Ventilation', 'Ensure adequate attic ventilation to prevent heat buildup', 'hvac', 365, 'Check that soffit vents are not blocked. Ensure ridge or gable vents are open. Consider adding ventilation if attic is too hot.'),
('Maintain Lawn Equipment', 'Service lawn mowers and outdoor power equipment', 'landscaping', 365, 'Change oil in mower. Replace spark plug. Sharpen or replace mower blade. Clean air filter.'),
('Pressure Wash House', 'Deep clean exterior siding, deck, and walkways', 'exterior', 365, 'Use appropriate pressure and cleaning solutions for different surfaces. Work systematically from top to bottom.'),
('Professional Chimney Cleaning', 'Have chimney professionally cleaned and inspected', 'safety', 365, 'Schedule annual cleaning before fireplace season. Include inspection of chimney structure and cap.'),
('Check Exterior Caulking', 'Inspect and replace caulk around windows, doors, and other penetrations', 'exterior', 365, 'Look for cracked or missing caulk. Remove old caulk and apply new weatherproof sealant.'),
('Tree and Shrub Pruning', 'Prune trees and shrubs for health and safety', 'landscaping', 365, 'Remove dead or diseased branches. Trim branches away from house and power lines. Shape shrubs for healthy growth.'),
('Inspect Insulation', 'Check attic and basement insulation for gaps or settling', 'hvac', 365, 'Look for gaps in attic insulation. Check for air leaks around pipes and electrical penetrations. Add insulation as needed.'),

-- Bi-Annual Tasks (730 days)
('Deep Clean HVAC Ducts', 'Professional duct cleaning to improve air quality and system efficiency', 'hvac', 730, 'Hire professional service to clean air ducts and return vents. Especially important for homes with pets or allergies.');