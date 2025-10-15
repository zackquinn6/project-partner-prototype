-- Add workflow decision examples to Tile Flooring project

-- Get the Prep phase ID
DO $$
DECLARE
  v_project_id uuid := '0c3cecc0-bf7d-49e7-a94a-071f5d80fea3';
  v_prep_phase_id uuid;
  v_op_wood_id uuid;
  v_op_concrete_id uuid;
  v_op_board_id uuid;
  v_op_membrane_id uuid;
  v_op_toilet_id uuid;
  v_op_leveler_id uuid;
BEGIN
  -- Get Prep phase ID
  SELECT id INTO v_prep_phase_id FROM standard_phases WHERE name = 'Prep';
  
  -- Add ALTERNATE operations for substrate choice (wood vs concrete)
  INSERT INTO template_operations (
    project_id, standard_phase_id, name, description, display_order,
    flow_type, user_prompt, alternate_group
  ) VALUES (
    v_project_id, v_prep_phase_id,
    'Wood Subfloor Preparation',
    'Prepare plywood subfloor for tile installation',
    3.5, -- Between existing operations
    'alternate',
    'Is your subfloor made of wood/plywood or concrete?',
    'substrate-prep'
  ) RETURNING id INTO v_op_wood_id;
  
  -- Add step for wood prep
  INSERT INTO template_steps (
    operation_id, step_number, step_title, description,
    content_sections, materials, tools, outputs, apps,
    display_order, flow_type
  ) VALUES (
    v_op_wood_id, 1, 'Inspect and Reinforce Wood Subfloor',
    'Check plywood thickness and add reinforcement if needed',
    '[{"id": "wood-prep-1", "type": "text", "content": "Plywood subfloor should be at least 1-1/8\" thick for tile. Add a layer of 1/2\" or 5/8\" plywood if current floor is too thin."}]'::jsonb,
    '[{"id": "plywood", "name": "Plywood Underlayment", "description": "1/2\" or 5/8\" exterior grade plywood"}]'::jsonb,
    '[{"id": "circular-saw", "name": "Circular Saw", "description": "For cutting plywood"}]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    0,
    'alternate'
  );
  
  -- Add concrete option
  INSERT INTO template_operations (
    project_id, standard_phase_id, name, description, display_order,
    flow_type, user_prompt, alternate_group
  ) VALUES (
    v_project_id, v_prep_phase_id,
    'Concrete Subfloor Preparation',
    'Prepare concrete slab for tile installation',
    3.6,
    'alternate',
    'Is your subfloor made of wood/plywood or concrete?',
    'substrate-prep'
  ) RETURNING id INTO v_op_concrete_id;
  
  INSERT INTO template_steps (
    operation_id, step_number, step_title, description,
    content_sections, materials, tools, outputs, display_order, flow_type
  ) VALUES (
    v_op_concrete_id, 1, 'Inspect and Level Concrete',
    'Check concrete for cracks and level',
    '[{"id": "concrete-prep-1", "type": "text", "content": "Concrete must be clean, level, and crack-free. Fill any cracks with concrete patching compound and allow to cure."}]'::jsonb,
    '[{"id": "concrete-patch", "name": "Concrete Patching Compound", "description": "For filling cracks"}]'::jsonb,
    '[{"id": "trowel", "name": "Trowel", "description": "For applying patch"}]'::jsonb,
    '[]'::jsonb,
    0,
    'alternate'
  );
  
  -- Add ALTERNATE operations for tile substrate (backer board vs membrane)
  INSERT INTO template_operations (
    project_id, standard_phase_id, name, description, display_order,
    flow_type, user_prompt, alternate_group
  ) VALUES (
    v_project_id, v_prep_phase_id,
    'Install Concrete Backer Board',
    'Install cement backer board as tile substrate',
    6.5,
    'alternate',
    'Do you want to use concrete backer board or uncoupling membrane?',
    'tile-substrate'
  ) RETURNING id INTO v_op_board_id;
  
  INSERT INTO template_steps (
    operation_id, step_number, step_title, description,
    content_sections, materials, tools, display_order, flow_type
  ) VALUES (
    v_op_board_id, 1, 'Install Backer Board',
    'Cut and install cement board over subfloor',
    '[{"id": "board-1", "type": "text", "content": "Install cement backer board using appropriate screws every 8 inches. Stagger joints and leave 1/8\" gaps between sheets."}]'::jsonb,
    '[{"id": "cement-board", "name": "Cement Backer Board", "description": "1/2\" cement board"}]'::jsonb,
    '[{"id": "utility-knife", "name": "Utility Knife", "description": "For scoring board"}]'::jsonb,
    0,
    'alternate'
  );
  
  INSERT INTO template_operations (
    project_id, standard_phase_id, name, description, display_order,
    flow_type, user_prompt, alternate_group
  ) VALUES (
    v_project_id, v_prep_phase_id,
    'Install Uncoupling Membrane',
    'Install uncoupling membrane as tile substrate',
    6.6,
    'alternate',
    'Do you want to use concrete backer board or uncoupling membrane?',
    'tile-substrate'
  ) RETURNING id INTO v_op_membrane_id;
  
  INSERT INTO template_steps (
    operation_id, step_number, step_title, description,
    content_sections, materials, tools, display_order, flow_type
  ) VALUES (
    v_op_membrane_id, 1, 'Install Membrane',
    'Roll out and secure uncoupling membrane',
    '[{"id": "membrane-1", "type": "text", "content": "Apply thin-set mortar to subfloor and embed uncoupling membrane into it. Use roller to ensure proper bond."}]'::jsonb,
    '[{"id": "uncoupling-membrane", "name": "Uncoupling Membrane", "description": "DITRA or similar"}]'::jsonb,
    '[{"id": "roller", "name": "Floor Roller", "description": "For pressing membrane"}]'::jsonb,
    0,
    'alternate'
  );
  
  -- Add IF-NECESSARY operation for toilet removal
  INSERT INTO template_operations (
    project_id, standard_phase_id, name, description, display_order,
    flow_type, user_prompt
  ) VALUES (
    v_project_id, v_prep_phase_id,
    'Toilet Removal and Reinstallation',
    'Remove toilet before tiling and reinstall after',
    2.5,
    'if-necessary',
    'Do you have a toilet in the installation area that needs to be removed?'
  ) RETURNING id INTO v_op_toilet_id;
  
  INSERT INTO template_steps (
    operation_id, step_number, step_title, description,
    content_sections, materials, tools, display_order, flow_type
  ) VALUES (
    v_op_toilet_id, 1, 'Remove and Reinstall Toilet',
    'Safely remove toilet from floor',
    '[{"id": "toilet-1", "type": "text", "content": "Turn off water supply, flush toilet to empty tank, disconnect water line, remove bolts, and carefully lift toilet away."}]'::jsonb,
    '[{"id": "wax-ring", "name": "Wax Ring", "description": "New wax ring for reinstallation"}]'::jsonb,
    '[{"id": "wrench", "name": "Adjustable Wrench", "description": "For disconnecting water line"}]'::jsonb,
    0,
    'if-necessary'
  );
  
  -- Add IF-NECESSARY operation for self-leveler
  INSERT INTO template_operations (
    project_id, standard_phase_id, name, description, display_order,
    flow_type, user_prompt
  ) VALUES (
    v_project_id, v_prep_phase_id,
    'Apply Self-Leveling Compound',
    'Level floor if variation exceeds 1/2"',
    4.5,
    'if-necessary',
    'Is your floor out of level by more than 1/2" in any area?'
  ) RETURNING id INTO v_op_leveler_id;
  
  INSERT INTO template_steps (
    operation_id, step_number, step_title, description,
    content_sections, materials, tools, display_order, flow_type
  ) VALUES (
    v_op_leveler_id, 1, 'Apply Self-Leveler',
    'Mix and pour self-leveling compound',
    '[{"id": "leveler-1", "type": "text", "content": "Mix self-leveling compound per instructions, pour onto floor, and spread with trowel. It will naturally level itself."}]'::jsonb,
    '[{"id": "self-leveler", "name": "Self-Leveling Compound", "description": "Floor leveling compound"}]'::jsonb,
    '[{"id": "mixing-paddle", "name": "Mixing Paddle", "description": "For mixing compound"}]'::jsonb,
    0,
    'if-necessary'
  );
  
  -- Trigger rebuild of phases JSON
  UPDATE projects 
  SET phases = rebuild_phases_json_from_templates(v_project_id),
      updated_at = now()
  WHERE id = v_project_id;
END $$;