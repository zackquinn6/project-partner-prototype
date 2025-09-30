-- Phase 4: Migrate Tile Flooring Installation Content
-- Project ID: caa74687-63fc-4bd1-865b-032a043fdcdc
-- Planning Phase ID: 6643dc0f-937e-4d77-ba64-1d7c00a71562

-- Insert template operations for Tile Flooring Installation
-- All operations map to the "Planning" standard phase

-- Prep Phase Operations
INSERT INTO public.template_operations (project_id, standard_phase_id, name, description, display_order) VALUES
('caa74687-63fc-4bd1-865b-032a043fdcdc', '6643dc0f-937e-4d77-ba64-1d7c00a71562', 'Project Setup', 'Initial project preparation, furniture removal, workstation setup, and materials staging', 1),
('caa74687-63fc-4bd1-865b-032a043fdcdc', '6643dc0f-937e-4d77-ba64-1d7c00a71562', 'Hazardous materials removal', 'Remove hazardous materials like asbestos or lead if present', 2),
('caa74687-63fc-4bd1-865b-032a043fdcdc', '6643dc0f-937e-4d77-ba64-1d7c00a71562', 'Demo', 'Remove existing flooring, trim, and prepare surfaces', 3),
('caa74687-63fc-4bd1-865b-032a043fdcdc', '6643dc0f-937e-4d77-ba64-1d7c00a71562', 'Demo - wood floor', 'Specialized preparation for wood floor substrates', 4),
('caa74687-63fc-4bd1-865b-032a043fdcdc', '6643dc0f-937e-4d77-ba64-1d7c00a71562', 'Subfloor prep', 'Prepare concrete and subfloor surfaces for tile installation', 5),
('caa74687-63fc-4bd1-865b-032a043fdcdc', '6643dc0f-937e-4d77-ba64-1d7c00a71562', 'Assess floor', 'Measure and assess floor conditions post-demo', 6),
('caa74687-63fc-4bd1-865b-032a043fdcdc', '6643dc0f-937e-4d77-ba64-1d7c00a71562', 'Tile base install', 'Install concrete board or uncoupling membrane', 7),
('caa74687-63fc-4bd1-865b-032a043fdcdc', '6643dc0f-937e-4d77-ba64-1d7c00a71562', 'Cleaning', 'Clean tools and workspace during prep phase', 8),
('caa74687-63fc-4bd1-865b-032a043fdcdc', '6643dc0f-937e-4d77-ba64-1d7c00a71562', 'Layout', 'Plan and test tile layout', 9);

-- Install Phase Operations
INSERT INTO public.template_operations (project_id, standard_phase_id, name, description, display_order) VALUES
('caa74687-63fc-4bd1-865b-032a043fdcdc', '6643dc0f-937e-4d77-ba64-1d7c00a71562', 'Cut', 'Cut tiles to size and shape', 10),
('caa74687-63fc-4bd1-865b-032a043fdcdc', '6643dc0f-937e-4d77-ba64-1d7c00a71562', 'Mix', 'Mix thinset mortar', 11),
('caa74687-63fc-4bd1-865b-032a043fdcdc', '6643dc0f-937e-4d77-ba64-1d7c00a71562', 'Set', 'Set tiles in mortar bed', 12),
('caa74687-63fc-4bd1-865b-032a043fdcdc', '6643dc0f-937e-4d77-ba64-1d7c00a71562', 'Install tile trim and baseboard', 'Install tile trim and edge profiles', 13),
('caa74687-63fc-4bd1-865b-032a043fdcdc', '6643dc0f-937e-4d77-ba64-1d7c00a71562', 'Pausing mid-project', 'Prepare workspace when pausing installation', 14),
('caa74687-63fc-4bd1-865b-032a043fdcdc', '6643dc0f-937e-4d77-ba64-1d7c00a71562', 'Thinset curing', 'Allow thinset to cure', 15),
('caa74687-63fc-4bd1-865b-032a043fdcdc', '6643dc0f-937e-4d77-ba64-1d7c00a71562', 'Leveling system removal', 'Remove leveling clips from tile surface', 16);

-- Finish Phase Operations
INSERT INTO public.template_operations (project_id, standard_phase_id, name, description, display_order) VALUES
('caa74687-63fc-4bd1-865b-032a043fdcdc', '6643dc0f-937e-4d77-ba64-1d7c00a71562', 'Grout & caulk', 'Apply grout and caulk to tile joints', 17),
('caa74687-63fc-4bd1-865b-032a043fdcdc', '6643dc0f-937e-4d77-ba64-1d7c00a71562', 'Seal', 'Seal grout and natural stone', 18),
('caa74687-63fc-4bd1-865b-032a043fdcdc', '6643dc0f-937e-4d77-ba64-1d7c00a71562', 'Install wood trim and baseboard', 'Install wood moldings and baseboards', 19),
('caa74687-63fc-4bd1-865b-032a043fdcdc', '6643dc0f-937e-4d77-ba64-1d7c00a71562', 'Install toilet', 'Reinstall toilet on new floor', 20),
('caa74687-63fc-4bd1-865b-032a043fdcdc', '6643dc0f-937e-4d77-ba64-1d7c00a71562', 'Complete project', 'Document completion with photos and feedback', 21),
('caa74687-63fc-4bd1-865b-032a043fdcdc', '6643dc0f-937e-4d77-ba64-1d7c00a71562', 'Prep for pickup', 'Clean and package tools for return', 22),
('caa74687-63fc-4bd1-865b-032a043fdcdc', '6643dc0f-937e-4d77-ba64-1d7c00a71562', 'Materials disposal', 'Dispose of waste materials and store leftovers', 23),
('caa74687-63fc-4bd1-865b-032a043fdcdc', '6643dc0f-937e-4d77-ba64-1d7c00a71562', 'Post-install inspection', 'Final quality inspection', 24);