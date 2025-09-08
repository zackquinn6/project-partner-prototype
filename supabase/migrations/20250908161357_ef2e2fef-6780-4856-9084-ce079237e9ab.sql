-- First, delete existing templates to avoid duplicates
DELETE FROM maintenance_templates;

-- Insert comprehensive maintenance templates based on BHG checklist
INSERT INTO maintenance_templates (title, description, category, frequency_days, instructions) VALUES

-- Monthly Tasks
('Clean HVAC Air Filter', 'Replace or clean your HVAC system air filter to improve air quality and efficiency', 'hvac', 30, 'Locate filter in return air duct or HVAC unit. Remove old filter. Insert new filter with airflow arrow pointing toward unit. Check monthly and replace every 1-3 months depending on usage.'),
('Vacuum Heat Registers', 'Clean heat registers and vents to ensure proper airflow', 'hvac', 30, 'Remove register covers. Vacuum inside ducts as far as possible. Wipe down register covers and reinstall.'),
('Check Air Vents', 'Ensure indoor and outdoor air vents are not blocked by furniture, debris, or vegetation', 'hvac', 30, 'Walk around home checking all exterior vents. Move any obstructions. Check indoor vents for furniture blocking airflow.'),
('Clean Garbage Disposal', 'Clean and deodorize garbage disposal to prevent clogs and odors', 'plumbing', 30, 'Grind ice cubes in disposal. Follow with hot water and baking soda. Run for 30 seconds then flush with hot water.'),
('Check Water Softener', 'Inspect water softener and replenish salt if necessary', 'plumbing', 30, 'Check salt level in brine tank. Add salt if below 1/3 full. Check for salt bridges or mushing.'),
('Inspect Sink Drains', 'Check tub and sink drains for debris and unclog if necessary', 'plumbing', 30, 'Remove visible debris from drain openings. Pour hot water down drains. Use drain cleaner if slow drainage detected.'),
('Flush Water Heater', 'Flush hot water from water heater to remove accumulated sediment', 'plumbing', 90, 'Turn off power/gas to heater. Connect hose to drain valve. Open drain valve and hot water tap to flush tank until water runs clear.'),
('Test Safety Devices', 'Test smoke alarms, carbon monoxide detectors, and GFCI outlets', 'safety', 30, 'Press test button on each smoke detector and CO detector. Test GFCI outlets by pressing test then reset buttons. Replace batteries if beeping occurs.'),
('Inspect Electrical Cords', 'Check electrical cords throughout home for wear, damage, or fraying', 'safety', 30, 'Examine all visible electrical cords for cuts, burns, or exposed wires. Replace any damaged cords immediately.'),

-- Fall Tasks (90-120 days)
('Rake Leaves and Aerate Lawn', 'Prepare lawn for winter by removing leaves and aerating soil', 'landscaping', 365, 'Rake all leaves from lawn area. Use core aerator or spike aerator to improve soil drainage and root growth.'),
('Clean Gutters and Downspouts', 'Remove leaves and debris from gutters and downspouts to prevent water damage', 'exterior', 180, 'Use ladder safely to access gutters. Remove all leaves and debris by hand or with scoop. Flush downspouts with hose to check for clogs.'),
('Pest Prevention Prep', 'Prevent pests by maintaining yard and sealing entry points', 'exterior', 90, 'Keep firewood 20+ feet from house. Trim shrubs away from siding. Repair rotten woodwork. Remove wasp nests from eaves.'),
('Winterize Exterior Plumbing', 'Drain and winterize outdoor water systems before freezing weather', 'plumbing', 365, 'Disconnect and drain garden hoses. Shut off interior valves to outdoor faucets. Drain in-ground sprinkler systems.'),
('Repair Driveway and Walkways', 'Fill cracks and gaps in concrete surfaces before winter freeze cycles', 'exterior', 365, 'Clean out cracks and apply concrete crack filler. Seal larger gaps with concrete patch compound. Allow to cure per manufacturer instructions.'),
('Touch Up Exterior Paint', 'Inspect and touch up exterior siding and trim paint to protect from weather', 'exterior', 365, 'Scrape loose paint. Prime bare wood. Apply matching exterior paint to damaged areas. Focus on south and west-facing surfaces.'),
('Power Wash Exterior', 'Clean windows and siding to remove dirt, mold, and mildew buildup', 'exterior', 180, 'Use appropriate pressure setting for surface. Work from top to bottom. Clean windows and siding methodically.'),
('Inspect Roofing', 'Check roof for missing, loose, or damaged shingles and potential leaks', 'exterior', 180, 'From ground level, use binoculars to inspect shingles. Look for missing, cracked, or curled shingles. Check flashing around vents and chimney.'),
('Seal Windows and Doors', 'Apply caulk or weather stripping to prevent drafts and improve energy efficiency', 'hvac', 365, 'Check all window and door frames for gaps. Apply new caulk to exterior gaps. Replace worn weather stripping around doors.'),
('Inspect Door Hardware', 'Check and repair exterior door handles, locks, and hinges', 'security', 180, 'Test all door handles and locks for proper operation. Oil squeaky hinges. Tighten loose screws. Replace worn hardware.'),
('Insulate Outdoor Pipes', 'Protect outdoor faucets and pipes from freezing temperatures', 'plumbing', 365, 'Wrap foam insulation around outdoor faucets. Insulate pipes in unheated garages and crawl spaces.'),
('HVAC System Inspection', 'Have forced-air heating system professionally inspected before heating season', 'hvac', 365, 'Schedule professional inspection of furnace, heat pump, or boiler. Replace filter, check belts, test safety controls.'),
('Fireplace and Chimney Check', 'Inspect fireplace for damage and clean flues before use', 'safety', 365, 'Check fireplace screen and tools. Have chimney professionally cleaned and inspected. Test damper operation.'),
('Appliance Tune-Up', 'Service major appliances before heavy holiday use', 'appliances', 365, 'Clean refrigerator coils. Check dishwasher filter. Clean dryer vent. Test oven temperature accuracy.'),
('Replace Detector Batteries', 'Replace batteries in smoke and carbon monoxide detectors', 'safety', 365, 'Replace all 9V batteries in smoke and CO detectors. Test each unit after battery replacement. Install detectors on every floor.'),
('Clean Carpets', 'Deep clean carpets to remove accumulated dirt and allergens', 'interior', 180, 'Vacuum thoroughly first. Use steam cleaner or hire professional service. Allow adequate drying time.'),
('Clean Dryer Vent', 'Remove lint buildup from dryer vent to prevent fire hazards', 'appliances', 90, 'Disconnect dryer from wall. Clean lint trap thoroughly. Use dryer vent brush to clean vent pipe from both ends.'),
('Check Water Heater', 'Inspect water heater for leaks, corrosion, or other issues', 'plumbing', 180, 'Look for water pooling around base. Check temperature and pressure relief valve. Test water temperature at faucets.'),

-- Winter Tasks
('Check Heating System', 'Monitor heating system performance during peak usage season', 'hvac', 30, 'Listen for unusual noises. Check that all rooms heat evenly. Monitor energy bills for unusual increases.'),
('Inspect Insulation', 'Check attic and basement insulation for gaps or settling', 'hvac', 365, 'Look for gaps in attic insulation. Check for air leaks around pipes and electrical penetrations. Add insulation as needed.'),
('Test Generator', 'If you have a backup generator, test monthly during winter months', 'electrical', 30, 'Start generator and let run for 10-15 minutes. Check oil and fuel levels. Test transfer switch operation.'),

-- Spring Tasks
('Inspect Roof After Winter', 'Check for winter damage to roofing materials', 'exterior', 365, 'Look for loose or missing shingles. Check gutters for damage. Inspect flashing and seals around roof penetrations.'),
('Service Air Conditioning', 'Prepare AC system for cooling season', 'hvac', 365, 'Replace filter. Clean outdoor unit coils. Check refrigerant lines. Schedule professional tune-up if needed.'),
('Check Deck and Patio', 'Inspect outdoor structures for winter damage and safety issues', 'exterior', 365, 'Look for loose boards or railings. Check for rot or insect damage. Clean and apply deck stain or sealant as needed.'),
('Test Irrigation System', 'Inspect and test sprinkler system after winter shutdown', 'landscaping', 365, 'Turn on water supply slowly. Check each zone for proper operation. Replace damaged sprinkler heads.'),
('Clean Windows', 'Wash interior and exterior windows for improved visibility and curb appeal', 'interior', 180, 'Use appropriate glass cleaner. Clean frames and sills. Check for cracked or damaged window panes.'),
('Inspect Foundation', 'Check foundation for cracks, settling, or water damage', 'exterior', 365, 'Walk around home perimeter checking foundation walls. Look for new cracks, water stains, or pest entry points.'),

-- Summer Tasks
('Check Attic Ventilation', 'Ensure adequate attic ventilation to prevent heat buildup', 'hvac', 365, 'Check that soffit vents are not blocked. Ensure ridge or gable vents are open. Consider adding ventilation if attic is too hot.'),
('Inspect Pool Equipment', 'If you have a pool, maintain equipment and water quality', 'outdoor', 30, 'Test and balance water chemistry weekly. Clean filters monthly. Inspect pump and filter system operation.'),
('Maintain Lawn Equipment', 'Service lawn mowers and outdoor power equipment', 'landscaping', 365, 'Change oil in mower. Replace spark plug. Sharpen or replace mower blade. Clean air filter.'),

-- Bi-Annual Tasks
('Deep Clean HVAC Ducts', 'Professional duct cleaning to improve air quality and system efficiency', 'hvac', 730, 'Hire professional service to clean air ducts and return vents. Especially important for homes with pets or allergies.'),
('Pressure Wash House', 'Deep clean exterior siding, deck, and walkways', 'exterior', 365, 'Use appropriate pressure and cleaning solutions for different surfaces. Work systematically from top to bottom.'),
('Professional Chimney Cleaning', 'Have chimney professionally cleaned and inspected', 'safety', 365, 'Schedule annual cleaning before fireplace season. Include inspection of chimney structure and cap.'),
('Test Sump Pump', 'Ensure sump pump is working properly before rainy season', 'plumbing', 180, 'Pour water into sump pit to test pump operation. Check that discharge pipe directs water away from foundation.'),
('Inspect Attic and Basement', 'Check for moisture, pests, or structural issues in hidden areas', 'interior', 180, 'Look for water stains, pest droppings, or unusual odors. Check stored items for moisture damage.'),
('Service Garage Door', 'Lubricate and adjust garage door mechanism', 'exterior', 180, 'Lubricate hinges, rollers, and tracks. Test auto-reverse safety feature. Check remote control batteries.'),
('Check Exterior Caulking', 'Inspect and replace caulk around windows, doors, and other penetrations', 'exterior', 365, 'Look for cracked or missing caulk. Remove old caulk and apply new weatherproof sealant.'),
('Tree and Shrub Pruning', 'Prune trees and shrubs for health and safety', 'landscaping', 365, 'Remove dead or diseased branches. Trim branches away from house and power lines. Shape shrubs for healthy growth.');