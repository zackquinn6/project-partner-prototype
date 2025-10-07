-- Step 1: Add missing columns to standard_phases
ALTER TABLE public.standard_phases
ADD COLUMN IF NOT EXISTS position_rule TEXT NOT NULL DEFAULT 'last',
ADD COLUMN IF NOT EXISTS position_value INTEGER,
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT false;

-- Step 2: Update standard phases with positioning rules
UPDATE public.standard_phases SET position_rule = 'first', position_value = NULL, is_locked = true WHERE name = 'Kickoff';
UPDATE public.standard_phases SET position_rule = 'nth', position_value = 2, is_locked = true WHERE name = 'Planning';
UPDATE public.standard_phases SET position_rule = 'last_minus_n', position_value = 1, is_locked = true WHERE name = 'Ordering';
UPDATE public.standard_phases SET position_rule = 'last', position_value = NULL, is_locked = true WHERE name = 'Close Project';

-- Step 3: Get the Standard Project Foundation ID and standard phase IDs
DO $$
DECLARE
  standard_project_id UUID := '00000000-0000-0000-0000-000000000001';
  kickoff_phase_id UUID;
  planning_phase_id UUID;
  ordering_phase_id UUID;
  close_phase_id UUID;
  
  -- Operation IDs
  diy_profile_op_id UUID;
  project_overview_op_id UUID;
  project_profile_op_id UUID;
  service_terms_op_id UUID;
  initial_planning_op_id UUID;
  measure_assess_op_id UUID;
  final_planning_op_id UUID;
  project_customizer_op_id UUID;
  project_scheduler_op_id UUID;
  shopping_checklist_op_id UUID;
  ordering_op_id UUID;
  closeout_op_id UUID;
  celebration_op_id UUID;
BEGIN
  -- Get phase IDs
  SELECT id INTO kickoff_phase_id FROM public.standard_phases WHERE name = 'Kickoff';
  SELECT id INTO planning_phase_id FROM public.standard_phases WHERE name = 'Planning';
  SELECT id INTO ordering_phase_id FROM public.standard_phases WHERE name = 'Ordering';
  SELECT id INTO close_phase_id FROM public.standard_phases WHERE name = 'Close Project';

  -- Delete existing operations and steps for standard project (in case of re-run)
  DELETE FROM public.template_steps WHERE operation_id IN (
    SELECT id FROM public.template_operations WHERE project_id = standard_project_id
  );
  DELETE FROM public.template_operations WHERE project_id = standard_project_id;

  -- KICKOFF PHASE OPERATIONS
  INSERT INTO public.template_operations (project_id, standard_phase_id, name, description, display_order)
  VALUES (standard_project_id, kickoff_phase_id, 'DIY Profile', 'Assess your DIY readiness and project fit', 0)
  RETURNING id INTO diy_profile_op_id;

  INSERT INTO public.template_steps (operation_id, step_number, step_title, description, content_sections, display_order)
  VALUES (diy_profile_op_id, 1, 'Complete DIY Assessment', 'Answer questions about your experience and preferences', '[]'::jsonb, 0);

  INSERT INTO public.template_operations (project_id, standard_phase_id, name, description, display_order)
  VALUES (standard_project_id, kickoff_phase_id, 'Project Overview', 'Review project scope and requirements', 1)
  RETURNING id INTO project_overview_op_id;

  INSERT INTO public.template_steps (operation_id, step_number, step_title, description, content_sections, display_order)
  VALUES (project_overview_op_id, 1, 'Review Project Details', 'Understand the full scope of your project', '[]'::jsonb, 0);

  INSERT INTO public.template_operations (project_id, standard_phase_id, name, description, display_order)
  VALUES (standard_project_id, kickoff_phase_id, 'Project Profile', 'Define project-specific details', 2)
  RETURNING id INTO project_profile_op_id;

  INSERT INTO public.template_steps (operation_id, step_number, step_title, description, content_sections, display_order)
  VALUES (project_profile_op_id, 1, 'Set Project Parameters', 'Configure project-specific settings and preferences', '[]'::jsonb, 0);

  INSERT INTO public.template_operations (project_id, standard_phase_id, name, description, display_order)
  VALUES (standard_project_id, kickoff_phase_id, 'Service Terms', 'Review and accept service terms', 3)
  RETURNING id INTO service_terms_op_id;

  INSERT INTO public.template_steps (operation_id, step_number, step_title, description, content_sections, display_order)
  VALUES (service_terms_op_id, 1, 'Accept Terms', 'Review and accept the project service agreement', '[]'::jsonb, 0);

  -- PLANNING PHASE OPERATIONS
  INSERT INTO public.template_operations (project_id, standard_phase_id, name, description, display_order)
  VALUES (standard_project_id, planning_phase_id, 'Initial Planning', 'Set up your project foundation', 0)
  RETURNING id INTO initial_planning_op_id;

  INSERT INTO public.template_steps (operation_id, step_number, step_title, description, content_sections, display_order)
  VALUES (initial_planning_op_id, 1, 'Define Project Goals', 'Establish clear objectives for your project', '[]'::jsonb, 0);

  INSERT INTO public.template_operations (project_id, standard_phase_id, name, description, display_order)
  VALUES (standard_project_id, planning_phase_id, 'Measure & Assess', 'Take measurements and assess conditions', 1)
  RETURNING id INTO measure_assess_op_id;

  INSERT INTO public.template_steps (operation_id, step_number, step_title, description, content_sections, display_order)
  VALUES (measure_assess_op_id, 1, 'Gather Measurements', 'Collect all necessary measurements for planning', '[]'::jsonb, 0);

  INSERT INTO public.template_operations (project_id, standard_phase_id, name, description, display_order)
  VALUES (standard_project_id, planning_phase_id, 'Final Planning', 'Finalize your project plan', 2)
  RETURNING id INTO final_planning_op_id;

  INSERT INTO public.template_steps (operation_id, step_number, step_title, description, content_sections, display_order)
  VALUES (final_planning_op_id, 1, 'Review Complete Plan', 'Review and approve your finalized project plan', '[]'::jsonb, 0);

  INSERT INTO public.template_operations (project_id, standard_phase_id, name, description, display_order)
  VALUES (standard_project_id, planning_phase_id, 'Project Customizer', 'Customize project phases and steps', 3)
  RETURNING id INTO project_customizer_op_id;

  INSERT INTO public.template_steps (operation_id, step_number, step_title, description, content_sections, display_order)
  VALUES (project_customizer_op_id, 1, 'Customize Workflow', 'Adjust phases and steps to match your needs', '[]'::jsonb, 0);

  INSERT INTO public.template_operations (project_id, standard_phase_id, name, description, display_order)
  VALUES (standard_project_id, planning_phase_id, 'Project Scheduler', 'Schedule your project timeline', 4)
  RETURNING id INTO project_scheduler_op_id;

  INSERT INTO public.template_steps (operation_id, step_number, step_title, description, content_sections, display_order)
  VALUES (project_scheduler_op_id, 1, 'Set Project Timeline', 'Create your project schedule and milestones', '[]'::jsonb, 0);

  -- ORDERING PHASE OPERATIONS
  INSERT INTO public.template_operations (project_id, standard_phase_id, name, description, display_order)
  VALUES (standard_project_id, ordering_phase_id, 'Shopping Checklist', 'Prepare your materials and tools list', 0)
  RETURNING id INTO shopping_checklist_op_id;

  INSERT INTO public.template_steps (operation_id, step_number, step_title, description, content_sections, display_order)
  VALUES (shopping_checklist_op_id, 1, 'Create Shopping List', 'Compile all materials and tools needed', '[]'::jsonb, 0);

  INSERT INTO public.template_operations (project_id, standard_phase_id, name, description, display_order)
  VALUES (standard_project_id, ordering_phase_id, 'Tool & Material Ordering', 'Order or acquire needed items', 1)
  RETURNING id INTO ordering_op_id;

  INSERT INTO public.template_steps (operation_id, step_number, step_title, description, content_sections, display_order)
  VALUES (ordering_op_id, 1, 'Purchase Materials', 'Order or buy all required materials and tools', '[]'::jsonb, 0);

  -- CLOSE PROJECT PHASE OPERATIONS
  INSERT INTO public.template_operations (project_id, standard_phase_id, name, description, display_order)
  VALUES (standard_project_id, close_phase_id, 'Tool & Material Closeout', 'Return rentals and organize leftover materials', 0)
  RETURNING id INTO closeout_op_id;

  INSERT INTO public.template_steps (operation_id, step_number, step_title, description, content_sections, display_order)
  VALUES (closeout_op_id, 1, 'Return Rentals', 'Return all rented tools and equipment', '[]'::jsonb, 0);
  INSERT INTO public.template_steps (operation_id, step_number, step_title, description, content_sections, display_order)
  VALUES (closeout_op_id, 2, 'Organize Materials', 'Store or dispose of leftover materials properly', '[]'::jsonb, 1);

  INSERT INTO public.template_operations (project_id, standard_phase_id, name, description, display_order)
  VALUES (standard_project_id, close_phase_id, 'Celebration', 'Review and celebrate your completed project', 1)
  RETURNING id INTO celebration_op_id;

  INSERT INTO public.template_steps (operation_id, step_number, step_title, description, content_sections, display_order)
  VALUES (celebration_op_id, 1, 'Project Review', 'Review what went well and what could be improved', '[]'::jsonb, 0);
  INSERT INTO public.template_steps (operation_id, step_number, step_title, description, content_sections, display_order)
  VALUES (celebration_op_id, 2, 'Celebrate Success', 'Take photos and celebrate your accomplishment!', '[]'::jsonb, 1);

  -- Step 4: Rebuild phases JSON for Standard Project Foundation
  UPDATE public.projects
  SET phases = rebuild_phases_json_from_templates(standard_project_id),
      updated_at = now()
  WHERE id = standard_project_id;

END $$;