-- Populate Mix Thinset step with 3-level instructions
-- Step ID: 490d6012-4380-4f46-9aab-52236fb56540

-- Quick Overview Level
INSERT INTO public.step_instructions (template_step_id, instruction_level, content) VALUES 
('490d6012-4380-4f46-9aab-52236fb56540', 'quick', '{
  "text": "Mix thinset mortar to proper consistency",
  "sections": [
    {
      "title": "Mix Process",
      "content": "Add powder to water (not water to powder). Mix to mashed potato consistency. Let slake 10 minutes, remix.",
      "type": "standard"
    }
  ],
  "photos": [],
  "videos": [
    {
      "url": "https://www.youtube.com/watch?v=Way4rsXO2Ec",
      "title": "Professional Thinset Mixing Technique",
      "embed": "https://www.youtube.com/embed/Way4rsXO2Ec"
    }
  ],
  "links": [
    {
      "url": "https://www.schluter.com/schluter-us/en_US/Setting-Materials",
      "title": "Schluter SET® Thinset Mortar Guide"
    }
  ]
}'::jsonb);

-- Detailed Level (Default - Maximum detail for those with no project experience)
INSERT INTO public.step_instructions (template_step_id, instruction_level, content) VALUES 
('490d6012-4380-4f46-9aab-52236fb56540', 'detailed', '{
  "text": "Properly mixed thinset mortar is critical for tile adhesion and preventing failures",
  "sections": [
    {
      "title": "SAFETY FIRST",
      "content": "Wear safety glasses, dust mask, and gloves. Portland cement in thinset is caustic and can irritate skin and eyes. Work in well-ventilated area.",
      "type": "warning"
    },
    {
      "title": "Mixing Ratio & Water Temperature",
      "content": "1. Pour COLD, clean water into bucket first (typically 5-6 quarts per 50lb bag - check manufacturer instructions)\\n2. Water temperature matters: 65-75°F is ideal. Cold water slows set time, hot water accelerates it\\n3. NEVER add powder to water in reverse - this creates lumps",
      "type": "standard"
    },
    {
      "title": "Mixing Process",
      "content": "1. Slowly add thinset powder to water while mixing continuously\\n2. Use paddle mixer at LOW speed (300-400 RPM) to avoid air bubbles\\n3. Mix for 2-3 minutes until smooth, lump-free consistency\\n4. Target consistency: creamy mashed potatoes that hold paddle mixer ridges\\n5. If too thick: add water 1oz at a time. If too thin: add powder gradually",
      "type": "standard"
    },
    {
      "title": "Slaking Period (CRITICAL)",
      "content": "1. Let mixed thinset REST for 10 minutes (called slaking)\\n2. This allows chemical reactions to occur and improves workability\\n3. Do NOT add water during slaking\\n4. After 10 minutes, remix for 30-60 seconds at low speed\\n5. Thinset is now ready - use within 3-4 hours (pot life)",
      "type": "standard"
    },
    {
      "title": "Quality Checks",
      "content": "✓ No dry powder lumps visible\\n✓ Smooth, creamy texture\\n✓ Holds shape when troweled\\n✓ Not too wet (will slump)\\n✓ Not too dry (will be difficult to spread)",
      "type": "tip"
    }
  ],
  "photos": [],
  "videos": [
    {
      "url": "https://www.youtube.com/watch?v=Way4rsXO2Ec",
      "title": "Professional Thinset Mixing Technique",
      "embed": "https://www.youtube.com/embed/Way4rsXO2Ec"
    }
  ],
  "links": [
    {
      "url": "https://www.schluter.com/schluter-us/en_US/Setting-Materials",
      "title": "Schluter SET® Thinset Mortar Guide",
      "description": "Professional-grade unmodified thinset specifications"
    },
    {
      "url": "https://www.thisoldhouse.com/flooring/21016706/how-to-tile-a-floor",
      "title": "This Old House Tile Floor Installation",
      "description": "Complete tiling guide with mixing instructions"
    }
  ]
}'::jsonb);

-- Contractor Level (Expert technical details)
INSERT INTO public.step_instructions (template_step_id, instruction_level, content) VALUES 
('490d6012-4380-4f46-9aab-52236fb56540', 'contractor', '{
  "text": "TCNA and ANSI A118.1/A118.4 compliant thinset mixing for optimal bond strength",
  "sections": [
    {
      "title": "Material Standards & Selection",
      "content": "• Use ANSI A118.1 (unmodified) or A118.4 (latex-modified) thinset per substrate requirements\\n• For Schluter membranes (DITRA, KERDI): ANSI A118.1 unmodified only\\n• For large format tile (>15\\\"): Use medium-bed or large-tile mortar (A118.15)\\n• Verify mortar meets TCNA handbook method recommendations for substrate type",
      "type": "standard"
    },
    {
      "title": "Mixing Parameters - TCNA Standards",
      "content": "• Water-to-powder ratio: 5.5-6.5 quarts per 50lb bag (verify SDS)\\n• Mix speed: 300-450 RPM maximum to prevent air entrainment\\n• Initial mix duration: 2-3 minutes minimum\\n• Slake time: 10 minutes (non-negotiable per ANSI)\\n• Remix duration: 60 seconds\\n• Pot life: 3-4 hours at 70°F (shorter in heat, longer in cold)",
      "type": "standard"
    },
    {
      "title": "Bond Strength Factors",
      "content": "• Under-mixed mortar: Reduced bond strength, premature failure\\n• Over-mixed mortar: Air entrapment, reduced coverage, hollow spots\\n• Improper slaking: Incomplete polymer hydration (modified thinset), poor workability\\n• Temperature effects: <50°F or >95°F installation prohibited per TCNA\\n• Target bond strength: >50 psi per ANSI A118.1 for unmodified, >200 psi for modified",
      "type": "standard"
    },
    {
      "title": "Quality Control Checks",
      "content": "• Consistency test: Trowel ridges should hold shape without slumping\\n• Coverage test: Check for 95% mortar coverage on back of tile per ANSI A108.5\\n• Skin-over test: Mortar should not skin over within open time (typically 20-30 min)\\n• Sag resistance: Vertical installations - zero sag per TCNA method",
      "type": "standard"
    },
    {
      "title": "Common Failure Modes",
      "content": "⚠️ Insufficient water: Dusty mix, poor trowelability, reduced bond\\n⚠️ Excess water: Excessive shrinkage, weak bond, extended cure time\\n⚠️ Skipped slaking: Poor workability, premature setup\\n⚠️ Contaminated water: Impurities affect hydration chemistry",
      "type": "warning"
    }
  ],
  "photos": [],
  "videos": [
    {
      "url": "https://www.youtube.com/watch?v=Way4rsXO2Ec",
      "title": "Professional Thinset Mixing Technique",
      "embed": "https://www.youtube.com/embed/Way4rsXO2Ec"
    }
  ],
  "links": [
    {
      "url": "https://tcnatile.com/",
      "title": "TCNA Handbook - Industry Standards",
      "description": "Official ceramic tile installation standards and methods"
    },
    {
      "url": "https://www.schluter.com/schluter-us/en_US/Setting-Materials",
      "title": "Schluter SET® Technical Data",
      "description": "ANSI A118.1 compliant unmodified thinset specifications"
    }
  ]
}'::jsonb);

COMMENT ON TABLE public.step_instructions IS 'Initial content population for Tile Flooring Install phase - Mix Thinset step with 3 instruction levels based on TCNA/Schluter standards';