-- Populate Apply Thinset step with 3-level instructions
-- Step ID: 6b017693-28ff-44ee-945a-79ac728dbe4a

-- Quick Overview Level
INSERT INTO public.step_instructions (template_step_id, instruction_level, content) VALUES 
('6b017693-28ff-44ee-945a-79ac728dbe4a', 'quick', '{
  "text": "Apply thinset with proper trowel technique for full coverage",
  "sections": [
    {
      "title": "Application",
      "content": "Use notched trowel at 45° angle. Create uniform ridges. Work in small sections (3x3 ft). Don''t let thinset skin over.",
      "type": "standard"
    }
  ],
  "photos": [],
  "videos": [
    {
      "url": "https://www.youtube.com/watch?v=Way4rsXO2Ec",
      "title": "Professional Thin-set Application",
      "embed": "https://www.youtube.com/embed/Way4rsXO2Ec"
    }
  ],
  "links": []
}'::jsonb);

-- Detailed Level
INSERT INTO public.step_instructions (template_step_id, instruction_level, content) VALUES 
('6b017693-28ff-44ee-945a-79ac728dbe4a', 'detailed', '{
  "text": "Proper thinset application ensures 95% mortar coverage required for successful tile installation",
  "sections": [
    {
      "title": "Select Correct Trowel Size",
      "content": "• Small tiles (<8\\\"): 1/4\\\" x 1/4\\\" square-notch trowel\\n• Medium tiles (8-16\\\"): 1/4\\\" x 3/8\\\" square-notch\\n• Large tiles (16\\\" +): 1/2\\\" x 1/2\\\" square-notch\\n• Extra-large (24\\\"+): 3/4\\\" x 3/4\\\" or larger\\nRule: Thinset ridges should be 2/3 the tile thickness",
      "type": "standard"
    },
    {
      "title": "Troweling Technique",
      "content": "1. Hold trowel at 45-60° angle to floor (CRITICAL for proper coverage)\\n2. Press firmly to key mortar into substrate\\n3. Pull trowel in straight lines to create uniform ridges\\n4. All ridges must be same height and direction\\n5. Cover only area you can tile in 15-20 minutes (before skinning)",
      "type": "standard"
    },
    {
      "title": "Work in Sections",
      "content": "1. Start in corner or center (per your layout)\\n2. Apply thinset to 3x3 ft area maximum\\n3. Check for proper ridge formation - should hold shape\\n4. If ridges slump or flatten: mortar too wet\\n5. If mortar tears or pulls up: too dry",
      "type": "standard"
    },
    {
      "title": "Back-Buttering Large Tiles",
      "content": "For tiles >12\\\", apply thin layer of thinset to BACK of tile (back-buttering) in addition to floor application. This ensures 95% coverage required by ANSI standards.",
      "type": "tip"
    },
    {
      "title": "WARNING - Open Time",
      "content": "Thinset has 20-30 minute open time before it skins over. Skinned thinset won''t bond properly. If surface develops film, remove and re-trowel fresh mortar.",
      "type": "warning"
    }
  ],
  "photos": [],
  "videos": [
    {
      "url": "https://www.youtube.com/watch?v=Way4rsXO2Ec",
      "title": "Professional Thin-set Application",
      "embed": "https://www.youtube.com/embed/Way4rsXO2Ec"
    }
  ],
  "links": [
    {
      "url": "https://www.thisoldhouse.com/flooring/23006801/tile-setting",
      "title": "This Old House - Tile Setting Best Practices"
    }
  ]
}'::jsonb);

-- Contractor Level
INSERT INTO public.step_instructions (template_step_id, instruction_level, content) VALUES 
('6b017693-28ff-44ee-945a-79ac728dbe4a', 'contractor', '{
  "text": "ANSI A108.5 compliant thinset application for 95% minimum coverage",
  "sections": [
    {
      "title": "Trowel Sizing - TCNA Standards",
      "content": "Per TCNA Handbook:\\n• 1/4\\\" sq-notch: tiles up to 8\\\" (wet areas) or 16\\\" (dry areas)\\n• 3/8\\\" sq-notch: tiles 12-16\\\"\\n• 1/2\\\" sq-notch: tiles 16-24\\\"\\n• 3/4\\\" sq-notch: tiles 24\\\"+\\nSteam showers require 1/2\\\" minimum for tiles >8\\\"",
      "type": "standard"
    },
    {
      "title": "Coverage Requirements",
      "content": "ANSI A108.5 Section 3.6.4:\\n• Dry interior: 80% minimum coverage\\n• Wet areas (showers, exteriors): 95% minimum\\n• Commercial heavy traffic: 95% minimum\\n• All porcelain tile: 95% minimum (low water absorption)\\nVerify by removing test tile and checking back",
      "type": "standard"
    },
    {
      "title": "Troweling Parameters",
      "content": "• Trowel angle: 45-60° for proper collapse\\n• Ridge height: 50-75% of notch depth after keying\\n• Ridge spacing: Match notch width\\n• Mortar bed thickness: 3/32\\\" to 3/16\\\" after tile compression\\n• Substrate keying: Essential for bond - don''t just skim surface",
      "type": "standard"
    },
    {
      "title": "Open Time Management",
      "content": "Open time variables:\\n• Temperature: 70°F = 20-30 min, 90°F = 10-15 min\\n• Humidity: Low humidity accelerates skinning\\n• Substrate porosity: Porous substrates (concrete) shorten open time\\n• Modified vs unmodified: Modified has slightly longer open time\\nTouch test: Mortar should transfer to clean finger without film",
      "type": "standard"
    },
    {
      "title": "Common Installation Defects",
      "content": "⚠️ Insufficient coverage: Hollow spots, future delamination\\n⚠️ Wrong trowel size: Thin spots, weak bond\\n⚠️ Improper angle: Flattened ridges, poor contact\\n⚠️ Skinned mortar: Bond failure within months\\n⚠️ Mortar shrinkage: Excessive water in mix, voids under tile",
      "type": "warning"
    }
  ],
  "photos": [],
  "videos": [],
  "links": [
    {
      "url": "https://tcnatile.com/",
      "title": "TCNA Handbook Section EJ171"
    }
  ]
}'::jsonb);

-- Populate Set Tile step with 3-level instructions
-- Step ID: 9fe6e1b3-eaa1-41eb-8d22-18ebe5b4dc6f

-- Quick Overview Level
INSERT INTO public.step_instructions (template_step_id, instruction_level, content) VALUES 
('9fe6e1b3-eaa1-41eb-8d22-18ebe5b4dc6f', 'quick', '{
  "text": "Set tiles with consistent pressure and spacing",
  "sections": [
    {
      "title": "Setting Process",
      "content": "Place tile into mortar. Press firmly with slight twist. Use spacers for consistent joints. Check level frequently.",
      "type": "standard"
    }
  ],
  "photos": [],
  "videos": [],
  "links": []
}'::jsonb);

-- Detailed Level
INSERT INTO public.step_instructions (template_step_id, instruction_level, content) VALUES 
('9fe6e1b3-eaa1-41eb-8d22-18ebe5b4dc6f', 'detailed', '{
  "text": "Proper tile setting technique ensures level surface and prevents lippage",
  "sections": [
    {
      "title": "Placing the Tile",
      "content": "1. Pick up tile by edges (don''t touch face)\\n2. Position tile above mortar\\n3. Lower straight down onto mortar ridges\\n4. DON''T slide tile more than 1/4\\\" or you''ll void mortar coverage\\n5. Press firmly with slight side-to-side twist to collapse ridges",
      "type": "standard"
    },
    {
      "title": "Achieving Full Mortar Contact",
      "content": "1. Press tile down with firm, even pressure across entire surface\\n2. Use grout float or hand pressure for small tiles\\n3. Use rubber mallet for larger tiles (tap gently, don''t pound)\\n4. You should see slight mortar squeeze-out between joints\\n5. Goal: Collapse trowel ridges to 95% coverage",
      "type": "standard"
    },
    {
      "title": "Spacing & Leveling",
      "content": "1. Insert tile spacers at all four corners\\n2. Standard grout joint sizes:\\n   - Small tiles: 1/16\\\" to 1/8\\\"\\n   - 12\\\" tiles: 3/16\\\" to 1/4\\\"\\n   - Large format: 1/4\\\" to 3/8\\\"\\n3. Check level across multiple tiles with straightedge\\n4. Adjust high tiles by pressing down\\n5. Low tiles: remove, add mortar, reset",
      "type": "standard"
    },
    {
      "title": "Lippage Prevention",
      "content": "Lippage = height difference between adjacent tiles. Maximum allowable: 1/32\\\" for grout joints <1/4\\\", or 1/16\\\" for joints >1/4\\\". Use tile leveling system for consistent results.",
      "type": "tip"
    },
    {
      "title": "WARNING - Common Mistakes",
      "content": "❌ Sliding tiles excessively - voids mortar\\n❌ Not pressing firmly enough - hollow spots\\n❌ Pounding tiles with mallet - can crack tile\\n❌ Adjusting after mortar starts setting - breaks bond",
      "type": "warning"
    }
  ],
  "photos": [],
  "videos": [
    {
      "url": "https://www.youtube.com/watch?v=Way4rsXO2Ec",
      "title": "Professional Tile Setting",
      "embed": "https://www.youtube.com/embed/Way4rsXO2Ec"
    }
  ],
  "links": [
    {
      "url": "https://www.thisoldhouse.com/flooring/21016706/how-to-tile-a-floor",
      "title": "This Old House Complete Floor Tiling Guide"
    }
  ]
}'::jsonb);

-- Contractor Level
INSERT INTO public.step_instructions (template_step_id, instruction_level, content) VALUES 
('9fe6e1b3-eaa1-41eb-8d22-18ebe5b4dc6f', 'contractor', '{
  "text": "ANSI A108.02 compliant tile placement for dimensional tolerance and lippage control",
  "sections": [
    {
      "title": "Placement Specifications - ANSI Standards",
      "content": "Per ANSI A108.02:\\n• Maximum lippage for grout joints ≤1/4\\\": 1/32\\\" + tile warpage allowance\\n• Maximum lippage for joints >1/4\\\": 1/16\\\" + warpage\\n• Tile warpage allowance: ±1% of tile edge length (e.g., 12\\\" tile = ±1/8\\\")\\n• Joint width variation: ±1/16\\\" from specified",
      "type": "standard"
    },
    {
      "title": "Tile Placement Methodology",
      "content": "1. No lateral movement >6mm (1/4\\\") to maintain mortar coverage\\n2. Compression force: Sufficient to achieve 95% coverage verification\\n3. Beating-in method: Acceptable for non-rectified tile with hand beater\\n4. Direct pressure method: Required for rectified tile with leveling systems\\n5. Mortar squeeze-out: Minimum 50% joint fill indicates proper coverage",
      "type": "standard"
    },
    {
      "title": "Lippage Control Systems",
      "content": "For tiles >15\\\" or warpage >0.75%:\\n• Tile leveling systems (clips/wedges) required\\n• Systems maintain both joint width and height\\n• Remove clips after initial set (12-24 hrs)\\n• TCNA method F125: Lippage control system installation\\n• Particularly critical for large-format porcelain (rectified edges)",
      "type": "standard"
    },
    {
      "title": "Mortar Coverage Verification",
      "content": "QC protocol per ANSI A108.5:\\n1. Remove test tile within 15-20 minutes of set\\n2. Inspect back of tile for mortar coverage\\n3. Measure coverage area (95% minimum wet areas/porcelain)\\n4. Check ridge collapse - should show full contact\\n5. If <95%: Adjust trowel size, angle, or technique",
      "type": "standard"
    },
    {
      "title": "Dimensional Tolerance Issues",
      "content": "⚠️ Tile size variation >1/16\\\": Adjust joint widths progressively\\n⚠️ Substrate out-of-flat >1/4\\\" in 10ft: Correct before tiling\\n⚠️ Excessive warpage: Return tile to manufacturer\\n⚠️ Lippage >standard: Grinding required (costly)",
      "type": "warning"
    }
  ],
  "photos": [],
  "videos": [],
  "links": [
    {
      "url": "https://tcnatile.com/",
      "title": "TCNA Method EJ171 - Ceramic Tile Installation"
    }
  ]
}'::jsonb);

COMMENT ON TABLE public.step_instructions IS 'Content for Install phase: Mix Thinset, Apply Thinset, Set Tile - all at 3 instruction levels based on TCNA/Schluter/DIY sources';