import { supabase } from '../src/integrations/supabase/client';

/**
 * Restoration script for Tile Flooring project content
 * This restores all operations and steps for the custom phases (Prep, Install, Finish)
 * to project ID: 0c3cecc0-bf7d-49e7-a94a-071f5d80fea3
 */

const PROJECT_ID = '0c3cecc0-bf7d-49e7-a94a-071f5d80fea3';

// Phase IDs from standard_phases table
const PREP_PHASE_ID = '840394b4-d7aa-4673-9251-270581da88fd';
const INSTALL_PHASE_ID = '4c19552d-0f38-41f4-b059-93b925f53b76';
const FINISH_PHASE_ID = '1c4d5069-ff4c-4645-8a82-2ff7269030b5';

async function restoreTileFlooringContent() {
  console.log('🔄 Starting Tile Flooring content restoration...');

  try {
    // PREP PHASE OPERATIONS
    console.log('\n📦 Creating Prep Phase operations...');
    
    // 1. Surface Prep Operation
    const { data: surfacePrepOp, error: surfacePrepError } = await supabase
      .from('template_operations')
      .insert({
        project_id: PROJECT_ID,
        standard_phase_id: PREP_PHASE_ID,
        name: 'Surface Cleaning and Inspection',
        description: 'Clean and inspect the installation area',
        display_order: 1,
        flow_type: 'prime'
      })
      .select()
      .single();

    if (surfacePrepError) throw surfacePrepError;
    console.log('✅ Surface Prep operation created');

    // Surface Prep Steps
    await supabase.from('template_steps').insert([
      {
        operation_id: surfacePrepOp.id,
        step_number: 1,
        step_title: 'Inspect and Clean Subfloor',
        description: 'Thoroughly inspect subfloor for damage and clean completely',
        display_order: 1,
        flow_type: 'prime',
        step_type: 'prime',
        content_sections: [
          {
            id: 'inspect-content-1',
            type: 'text',
            content: 'Ensure your surface is clean, smooth, dry and free of wax, soap scum and grease. Any damaged, loose or uneven areas must be repaired, patched and leveled.'
          },
          {
            id: 'inspect-content-2',
            type: 'text',
            content: 'Remove any moldings, trim, appliances, etc., which could interfere with installation. Door jambs may be undercut for tile to slip under.',
            title: 'Removal Preparation'
          }
        ],
        materials: [
          {
            libraryId: null,
            name: 'Floor Cleaning Supplies',
            description: 'Degreaser, scraper, vacuum',
            quantity: 1,
            notes: 'All-purpose cleaner, TSP cleaner'
          }
        ],
        tools: [
          {
            libraryId: null,
            name: 'Putty Knife',
            description: 'For scraping and removing debris',
            quantity: 1,
            notes: 'Scraper, Paint scraper'
          },
          {
            libraryId: null,
            name: 'Shop Vacuum',
            description: 'For thorough cleaning',
            quantity: 1,
            notes: 'Regular vacuum, Broom'
          }
        ],
        outputs: [
          {
            id: 'clean-subfloor-output',
            name: 'Clean Subfloor',
            description: 'Subfloor cleaned and inspected, ready for underlayment',
            type: 'none'
          }
        ],
        estimated_time_minutes: 60
      },
      {
        operation_id: surfacePrepOp.id,
        step_number: 2,
        step_title: 'Install Underlayment',
        description: 'Install cement backer board or appropriate underlayment',
        display_order: 2,
        flow_type: 'prime',
        step_type: 'prime',
        content_sections: [
          {
            id: 'underlayment-content-1',
            type: 'text',
            content: 'Install cement backer board using appropriate screws every 8 inches. Stagger joints and leave 1/8" gaps between sheets.'
          },
          {
            id: 'underlayment-content-2',
            type: 'text',
            content: 'Seal all joints with mesh tape and thinset mortar. Allow to cure according to manufacturer specifications.',
            title: 'Joint Sealing'
          }
        ],
        materials: [
          {
            libraryId: null,
            name: 'Floor Underlayment',
            description: 'Cement backer board',
            quantity: 1,
            notes: 'Plywood subfloor, Fiber cement board'
          },
          {
            libraryId: null,
            name: 'Backer Board Screws',
            description: '1-1/4" cement board screws',
            quantity: 1,
            notes: 'Deck screws, Construction screws'
          },
          {
            libraryId: null,
            name: 'Alkali-Resistant Mesh Tape',
            description: 'For sealing joints',
            quantity: 1,
            notes: 'Fiberglass tape, Paper tape'
          }
        ],
        tools: [
          {
            libraryId: null,
            name: 'Power Drill',
            description: 'For installing screws',
            quantity: 1,
            notes: 'Impact driver, Cordless drill'
          },
          {
            libraryId: null,
            name: 'Utility Knife',
            description: 'For cutting backer board',
            quantity: 1,
            notes: 'Box cutter, Razor knife'
          }
        ],
        outputs: [
          {
            id: 'underlayment-output',
            name: 'Installed Underlayment',
            description: 'Underlayment installed and cured, ready for tile',
            type: 'none'
          }
        ],
        estimated_time_minutes: 120
      }
    ]);
    console.log('✅ Surface Prep steps created');

    // 2. Layout Planning Operation
    const { data: layoutOp, error: layoutError } = await supabase
      .from('template_operations')
      .insert({
        project_id: PROJECT_ID,
        standard_phase_id: PREP_PHASE_ID,
        name: 'Layout Planning',
        description: 'Plan and mark tile layout for optimal appearance',
        display_order: 2,
        flow_type: 'prime'
      })
      .select()
      .single();

    if (layoutError) throw layoutError;
    console.log('✅ Layout Planning operation created');

    await supabase.from('template_steps').insert([
      {
        operation_id: layoutOp.id,
        step_number: 1,
        step_title: 'Mark Center Lines',
        description: 'Find and mark the center point and create layout lines',
        display_order: 1,
        flow_type: 'prime',
        step_type: 'prime',
        content_sections: [
          {
            id: 'center-content-1',
            type: 'text',
            content: 'Begin by marking the center point of all four walls. Snap chalk lines between the center points of opposite walls, which will intersect at the center of room.'
          },
          {
            id: 'center-content-2',
            type: 'text',
            content: 'Make sure they\'re perfectly square, and adjust if necessary. Use the 3-4-5 triangle method to verify square.',
            title: 'Square Check'
          }
        ],
        tools: [
          {
            libraryId: null,
            name: 'Chalk Line',
            description: 'For marking layout lines',
            quantity: 1,
            notes: 'Straight edge, Laser line'
          },
          {
            libraryId: null,
            name: 'Measuring Tape',
            description: '25ft minimum',
            quantity: 1,
            notes: 'Laser measure, Ruler'
          },
          {
            libraryId: null,
            name: 'Carpenter\'s Square',
            description: 'For checking right angles',
            quantity: 1,
            notes: 'Speed square, T-square'
          }
        ],
        outputs: [
          {
            id: 'center-lines-output',
            name: 'Layout Lines Marked',
            description: 'Center lines marked and verified square',
            type: 'none'
          }
        ],
        estimated_time_minutes: 30
      },
      {
        operation_id: layoutOp.id,
        step_number: 2,
        step_title: 'Dry Lay Tiles',
        description: 'Lay out tiles without adhesive to plan cuts and spacing',
        display_order: 2,
        flow_type: 'prime',
        step_type: 'prime',
        content_sections: [
          {
            id: 'dry-lay-content-1',
            type: 'text',
            content: 'Next, lay out a row of loose tiles along the center lines in both directions, leaving spaces for uniform joints (use tile spacers).'
          },
          {
            id: 'dry-lay-content-2',
            type: 'text',
            content: 'If this layout leaves cuts smaller than 1/2 tile at walls, adjust the center line by snapping a new line 1/2 tile closer to the wall.',
            title: 'Adjusting Layout'
          },
          {
            id: 'dry-lay-content-3',
            type: 'text',
            content: 'Now divide the room into smaller grids (approx. 2\' x 3\') by snapping additional lines parallel to center lines.',
            title: 'Grid Creation'
          }
        ],
        materials: [
          {
            libraryId: null,
            name: 'Sample Tiles',
            description: 'Several tiles for layout planning',
            quantity: 5,
            notes: 'Full tiles for testing, Tile samples'
          }
        ],
        tools: [
          {
            libraryId: null,
            name: 'Tile Spacers',
            description: 'Various sizes for testing',
            quantity: 1,
            notes: 'Cardboard spacers, Coins for spacing'
          }
        ],
        outputs: [
          {
            id: 'dry-layout-output',
            name: 'Dry Layout Complete',
            description: 'Tile layout planned and marked, ready for installation',
            type: 'none'
          }
        ],
        estimated_time_minutes: 45
      }
    ]);
    console.log('✅ Layout Planning steps created');

    // INSTALL PHASE OPERATIONS
    console.log('\n📦 Creating Install Phase operations...');

    // 3. Adhesive Application Operation
    const { data: adhesiveOp, error: adhesiveError } = await supabase
      .from('template_operations')
      .insert({
        project_id: PROJECT_ID,
        standard_phase_id: INSTALL_PHASE_ID,
        name: 'Adhesive Application',
        description: 'Mix and apply tile adhesive properly',
        display_order: 1,
        flow_type: 'prime'
      })
      .select()
      .single();

    if (adhesiveError) throw adhesiveError;
    console.log('✅ Adhesive Application operation created');

    await supabase.from('template_steps').insert([
      {
        operation_id: adhesiveOp.id,
        step_number: 1,
        step_title: 'Mix Tile Adhesive',
        description: 'Prepare tile adhesive according to manufacturer instructions',
        display_order: 1,
        flow_type: 'prime',
        step_type: 'prime',
        content_sections: [
          {
            id: 'mix-content-1',
            type: 'text',
            content: 'Select the right adhesive for the substrate you\'re using. Carefully read and follow all instructions and precautions on the adhesive or mortar package.'
          },
          {
            id: 'mix-content-2',
            type: 'text',
            content: 'Mix only enough to be used within 30 minutes. Use a mixing paddle and drill for consistent texture.',
            title: 'Mixing Guidelines'
          }
        ],
        materials: [
          {
            libraryId: null,
            name: 'Tile Adhesive/Mortar',
            description: 'Premium grade mortar',
            quantity: 1,
            notes: 'Modified mortar, Rapid-set adhesive'
          }
        ],
        tools: [
          {
            libraryId: null,
            name: 'Mixing Paddle & Drill',
            description: 'For consistent mixing',
            quantity: 1,
            notes: 'Hand mixing tool, Whisk attachment'
          },
          {
            libraryId: null,
            name: 'Mixing Bucket',
            description: 'Clean 5-gallon bucket',
            quantity: 1,
            notes: 'Large mixing bowl, Mortar tub'
          }
        ],
        outputs: [
          {
            id: 'mixed-adhesive-output',
            name: 'Mixed Adhesive',
            description: 'Properly mixed adhesive ready for application',
            type: 'none'
          }
        ],
        estimated_time_minutes: 15
      },
      {
        operation_id: adhesiveOp.id,
        step_number: 2,
        step_title: 'Apply Adhesive',
        description: 'Spread adhesive using proper troweling technique',
        display_order: 2,
        flow_type: 'prime',
        step_type: 'prime',
        content_sections: [
          {
            id: 'apply-content-1',
            type: 'text',
            content: 'Using the type of trowel recommended on the adhesive package spread a 1/4" coat on the surface of one grid area, using the flat side of the trowel. Do not cover guidelines.'
          },
          {
            id: 'apply-content-2',
            type: 'text',
            content: 'Next, use the notched side of trowel to comb adhesive into standing ridges by holding trowel at a 45-degree angle.',
            title: 'Combing Technique'
          },
          {
            id: 'apply-content-3',
            type: 'text',
            content: 'Apply adhesive to one grid at a time, enough to set tiles within 15 minutes.',
            title: 'Working Time'
          }
        ],
        tools: [
          {
            libraryId: null,
            name: 'Notched Trowel',
            description: '1/4" x 3/8" notched trowel',
            quantity: 1,
            notes: 'Size per adhesive manufacturer recommendations'
          }
        ],
        outputs: [
          {
            id: 'applied-adhesive-output',
            name: 'Adhesive Applied',
            description: 'Adhesive properly applied to work area',
            type: 'none'
          }
        ],
        estimated_time_minutes: 30
      }
    ]);
    console.log('✅ Adhesive Application steps created');

    // 4. Tile Setting Operation
    const { data: tileSettingOp, error: tileSettingError } = await supabase
      .from('template_operations')
      .insert({
        project_id: PROJECT_ID,
        standard_phase_id: INSTALL_PHASE_ID,
        name: 'Tile Setting',
        description: 'Set tiles systematically with proper spacing',
        display_order: 2,
        flow_type: 'prime'
      })
      .select()
      .single();

    if (tileSettingError) throw tileSettingError;
    console.log('✅ Tile Setting operation created');

    await supabase.from('template_steps').insert([
      {
        operation_id: tileSettingOp.id,
        step_number: 1,
        step_title: 'Cut Tiles',
        description: 'Measure and cut tiles for edges and obstacles',
        display_order: 1,
        flow_type: 'prime',
        step_type: 'prime',
        content_sections: [
          {
            id: 'cut-content-1',
            type: 'text',
            content: 'Measure each tile carefully before cutting. Mark cut lines clearly on the tile surface.'
          },
          {
            id: 'cut-content-2',
            type: 'text',
            content: 'Use a wet saw for straight cuts and tile nippers for curved cuts or notches around obstacles.',
            title: 'Cutting Technique'
          }
        ],
        tools: [
          {
            libraryId: null,
            name: 'Wet Tile Saw',
            description: 'For cutting tiles to size',
            quantity: 1,
            notes: 'Manual tile cutter, Angle grinder'
          },
          {
            libraryId: null,
            name: 'Tile Nippers',
            description: 'For curved and small cuts',
            quantity: 1,
            notes: 'Dremel tool, Score and snap'
          }
        ],
        outputs: [
          {
            id: 'cut-tiles-output',
            name: 'Cut Tiles Ready',
            description: 'All necessary tiles cut and ready for installation',
            type: 'none'
          }
        ],
        estimated_time_minutes: 60
      },
      {
        operation_id: tileSettingOp.id,
        step_number: 2,
        step_title: 'Set Tiles',
        description: 'Install tiles systematically using proper technique',
        display_order: 2,
        flow_type: 'prime',
        step_type: 'prime',
        content_sections: [
          {
            id: 'set-content-1',
            type: 'text',
            content: 'Variation of shades is an inherent characteristic of ceramic tile – mix tiles from several cartons as you set, for a blended effect.'
          },
          {
            id: 'set-content-2',
            type: 'text',
            content: 'Begin installing tiles in the center of the room, one grid at a time. Finish each grid before moving to the next.',
            title: 'Installation Sequence'
          },
          {
            id: 'set-content-3',
            type: 'text',
            content: 'Start with the first tile in the corner of the grid and work outward. Set tiles one at a time using a slight twisting motion. Don\'t slide tiles into place.',
            title: 'Setting Technique'
          },
          {
            id: 'set-content-4',
            type: 'text',
            content: 'Insert tile spacers as each tile is set, or leave equal joints between tiles. Fit perimeter tiles in each grid last, leaving 1/4" gap between tile and wall.',
            title: 'Spacing and Perimeter'
          }
        ],
        materials: [
          {
            libraryId: null,
            name: 'Floor Tiles',
            description: 'Main installation tiles',
            quantity: 1,
            notes: 'Ceramic tiles, Porcelain tiles, Natural stone'
          }
        ],
        tools: [
          {
            libraryId: null,
            name: 'Tile Spacers',
            description: 'For consistent gaps',
            quantity: 1,
            notes: 'Cardboard spacers, Coins'
          },
          {
            libraryId: null,
            name: 'Rubber Mallet',
            description: 'For setting tiles level',
            quantity: 1,
            notes: 'Dead blow hammer, Tapping block'
          },
          {
            libraryId: null,
            name: '4-Foot Level',
            description: 'For checking tile plane',
            quantity: 1,
            notes: '2-foot level, Laser level'
          }
        ],
        outputs: [
          {
            id: 'set-tiles-output',
            name: 'Tiles Set',
            description: 'All tiles properly set and leveled',
            type: 'major-aesthetics'
          }
        ],
        estimated_time_minutes: 240
      },
      {
        operation_id: tileSettingOp.id,
        step_number: 3,
        step_title: 'Level and Clean Tiles',
        description: 'Ensure tiles are level and clean excess adhesive',
        display_order: 3,
        flow_type: 'prime',
        step_type: 'prime',
        content_sections: [
          {
            id: 'level-content-1',
            type: 'text',
            content: 'When grid is completely installed, tap in all tiles with a rubber mallet or hammer and wood block to ensure a good bond and level plane.'
          },
          {
            id: 'level-content-2',
            type: 'text',
            content: 'Remove excess adhesive from joints with a putty knife and from tile with a damp sponge.',
            title: 'Cleaning'
          },
          {
            id: 'level-content-3',
            type: 'text',
            content: 'Do not walk on tiles until they are set (usually in 24 hours).',
            title: 'Curing Time'
          }
        ],
        tools: [
          {
            libraryId: null,
            name: 'Rubber Mallet',
            description: 'For final leveling',
            quantity: 1,
            notes: 'Dead blow hammer, Tapping block'
          },
          {
            libraryId: null,
            name: 'Putty Knife',
            description: 'For cleaning joints',
            quantity: 1,
            notes: 'Scraper, Margin trowel'
          }
        ],
        outputs: [
          {
            id: 'leveled-tiles-output',
            name: 'Leveled Clean Tiles',
            description: 'All tiles properly leveled and excess adhesive removed',
            type: 'performance-durability'
          }
        ],
        estimated_time_minutes: 60
      }
    ]);
    console.log('✅ Tile Setting steps created');

    // FINISH PHASE OPERATIONS
    console.log('\n📦 Creating Finish Phase operations...');

    // 5. Grouting Operation
    const { data: groutingOp, error: groutingError } = await supabase
      .from('template_operations')
      .insert({
        project_id: PROJECT_ID,
        standard_phase_id: FINISH_PHASE_ID,
        name: 'Grouting',
        description: 'Apply grout and finish tile installation',
        display_order: 1,
        flow_type: 'prime'
      })
      .select()
      .single();

    if (groutingError) throw groutingError;
    console.log('✅ Grouting operation created');

    await supabase.from('template_steps').insert([
      {
        operation_id: groutingOp.id,
        step_number: 1,
        step_title: 'Prepare for Grouting',
        description: 'Remove spacers and prepare grout mixture',
        display_order: 1,
        flow_type: 'prime',
        step_type: 'prime',
        content_sections: [
          {
            id: 'prep-grout-content-1',
            type: 'text',
            content: 'Generally, you should wait about 24 hours before grouting (refer to the adhesive package for specifics). Remove tile spacers completely.'
          },
          {
            id: 'prep-grout-content-2',
            type: 'text',
            content: 'Carefully read and follow all instructions and precautions on the grout package. Make only enough to use in about 30 minutes.',
            title: 'Grout Mixing'
          }
        ],
        materials: [
          {
            libraryId: null,
            name: 'Sanded Grout',
            description: 'For joints 1/8" and larger',
            quantity: 1,
            notes: 'Unsanded grout, Epoxy grout'
          }
        ],
        tools: [
          {
            libraryId: null,
            name: 'Mixing Paddle',
            description: 'For grout mixing',
            quantity: 1,
            notes: 'Hand mixing tool, Whisk attachment'
          }
        ],
        outputs: [
          {
            id: 'grout-ready-output',
            name: 'Grout Prepared',
            description: 'Spacers removed and grout properly mixed',
            type: 'none'
          }
        ],
        estimated_time_minutes: 30
      },
      {
        operation_id: groutingOp.id,
        step_number: 2,
        step_title: 'Apply Grout',
        description: 'Spread grout into joints using proper technique',
        display_order: 2,
        flow_type: 'prime',
        step_type: 'prime',
        content_sections: [
          {
            id: 'apply-grout-content-1',
            type: 'text',
            content: 'Spread grout on the tile surface, forcing down into joints with a rubber grout float or squeegee. Tilt the float at a 45-degree angle.'
          },
          {
            id: 'apply-grout-content-2',
            type: 'text',
            content: 'Remove excess grout from surface immediately with the edge of float. Tilt it at a 90-degree angle and scrape it diagonally across tiles.',
            title: 'Excess Removal'
          }
        ],
        tools: [
          {
            libraryId: null,
            name: 'Rubber Grout Float',
            description: 'For applying grout',
            quantity: 1,
            notes: 'Foam float, Hard rubber float'
          }
        ],
        outputs: [
          {
            id: 'grout-applied-output',
            name: 'Grout Applied',
            description: 'Grout properly applied to all joints',
            type: 'major-aesthetics'
          }
        ],
        estimated_time_minutes: 90
      },
      {
        operation_id: groutingOp.id,
        step_number: 3,
        step_title: 'Clean and Finish Grout',
        description: 'Clean grout haze and finish joints',
        display_order: 3,
        flow_type: 'prime',
        step_type: 'prime',
        content_sections: [
          {
            id: 'clean-grout-content-1',
            type: 'text',
            content: 'Wait 15-20 minutes for grout to set slightly, then use a damp sponge to clean grout residue from surface and smooth the grout joints.'
          },
          {
            id: 'clean-grout-content-2',
            type: 'text',
            content: 'Rinse sponge frequently and change water as needed. Let dry until grout is hard and haze forms on tile surface, then polish with a soft cloth.',
            title: 'Final Cleaning'
          },
          {
            id: 'clean-grout-content-3',
            type: 'text',
            content: 'Wait 72 hours for heavy use. Don\'t apply sealers or polishes for three weeks.',
            title: 'Curing Requirements'
          }
        ],
        tools: [
          {
            libraryId: null,
            name: 'Grout Sponges',
            description: 'Large pore sponges for cleanup',
            quantity: 2,
            notes: 'Microfiber cloths, Clean rags'
          }
        ],
        outputs: [
          {
            id: 'finished-grout-output',
            name: 'Finished Grout',
            description: 'Grout cleaned and finished, ready for sealing',
            type: 'major-aesthetics'
          }
        ],
        estimated_time_minutes: 60
      }
    ]);
    console.log('✅ Grouting steps created');

    // 6. Sealing Operation
    const { data: sealingOp, error: sealingError } = await supabase
      .from('template_operations')
      .insert({
        project_id: PROJECT_ID,
        standard_phase_id: FINISH_PHASE_ID,
        name: 'Sealing and Final Steps',
        description: 'Apply sealer and complete installation',
        display_order: 2,
        flow_type: 'prime'
      })
      .select()
      .single();

    if (sealingError) throw sealingError;
    console.log('✅ Sealing operation created');

    await supabase.from('template_steps').insert([
      {
        operation_id: sealingOp.id,
        step_number: 1,
        step_title: 'Apply Grout Sealer',
        description: 'Seal grout lines to prevent staining and moisture penetration',
        display_order: 1,
        flow_type: 'prime',
        step_type: 'prime',
        content_sections: [
          {
            id: 'sealer-content-1',
            type: 'text',
            content: 'Wait at least 48-72 hours after grouting before applying sealer. Clean the grout lines thoroughly before sealing.'
          },
          {
            id: 'sealer-content-2',
            type: 'text',
            content: 'Apply penetrating sealer according to manufacturer instructions. Use brush or applicator to ensure complete coverage.',
            title: 'Application Method'
          }
        ],
        materials: [
          {
            libraryId: null,
            name: 'Grout Sealer',
            description: 'Penetrating sealer',
            quantity: 1,
            notes: 'Silicone sealer, Acrylic sealer'
          }
        ],
        tools: [
          {
            libraryId: null,
            name: 'Small Brush or Applicator',
            description: 'For precise sealer application',
            quantity: 1,
            notes: 'Foam brush, Applicator bottle'
          }
        ],
        outputs: [
          {
            id: 'sealed-grout-output',
            name: 'Sealed Grout Lines',
            description: 'Grout properly sealed and protected',
            type: 'performance-durability'
          }
        ],
        estimated_time_minutes: 45
      },
      {
        operation_id: sealingOp.id,
        step_number: 2,
        step_title: 'Install Transition Strips',
        description: 'Install transition strips at doorways and room boundaries',
        display_order: 2,
        flow_type: 'prime',
        step_type: 'prime',
        content_sections: [
          {
            id: 'transition-content-1',
            type: 'text',
            content: 'Measure and cut transition strips to fit doorways and edges where tile meets other flooring types.'
          },
          {
            id: 'transition-content-2',
            type: 'text',
            content: 'Install according to manufacturer instructions, typically using adhesive or fasteners.',
            title: 'Installation Method'
          }
        ],
        materials: [
          {
            libraryId: null,
            name: 'Transition Strips',
            description: 'Metal or wood transition pieces',
            quantity: 1,
            notes: 'T-molding, Reducer strips'
          }
        ],
        tools: [
          {
            libraryId: null,
            name: 'Measuring Tape',
            description: 'For accurate measurements',
            quantity: 1
          },
          {
            libraryId: null,
            name: 'Hacksaw',
            description: 'For cutting metal strips',
            quantity: 1,
            notes: 'Miter saw for wood strips'
          }
        ],
        outputs: [
          {
            id: 'transitions-output',
            name: 'Installed Transitions',
            description: 'Professional transition strips installed',
            type: 'major-aesthetics'
          }
        ],
        estimated_time_minutes: 30
      }
    ]);
    console.log('✅ Sealing steps created');

    console.log('\n✅ Tile Flooring content restoration complete!');
    console.log('\n📊 Summary:');
    console.log('  - Prep Phase: 2 operations (Surface Prep, Layout Planning)');
    console.log('  - Install Phase: 2 operations (Adhesive Application, Tile Setting)');
    console.log('  - Finish Phase: 2 operations (Grouting, Sealing)');
    console.log('  - Total: 6 operations with detailed steps, materials, tools, and outputs');

  } catch (error) {
    console.error('❌ Error restoring Tile Flooring content:', error);
    throw error;
  }
}

// Execute restoration
restoreTileFlooringContent()
  .then(() => {
    console.log('\n🎉 Restoration successful!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Restoration failed:', error);
    process.exit(1);
  });
