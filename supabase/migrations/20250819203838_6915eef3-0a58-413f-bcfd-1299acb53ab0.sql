-- Create comprehensive Tile Flooring project
INSERT INTO projects (
  name, 
  description, 
  category, 
  difficulty, 
  effort_level, 
  estimated_time,
  estimated_time_per_unit,
  scaling_unit,
  status,
  publish_status,
  phases
) VALUES (
  'Tile Flooring Installation',
  'Complete ceramic or porcelain tile floor installation including substrate preparation, waterproofing, tile setting, and finishing. This project covers professional techniques for achieving a durable, waterproof tile floor suitable for bathrooms, kitchens, or any interior space.',
  'Flooring',
  'Intermediate',
  'High',
  '2-3 Days',
  4.5,
  'per 10x10 room',
  'not-started',
  'published',
  '[
    {
      "id": "plan-phase",
      "name": "Plan",
      "description": "Project planning, material calculation, and layout design",
      "operations": [
        {
          "id": "measure-calculate",
          "name": "Measure and Calculate Materials", 
          "description": "Accurate room measurement and material quantity calculation",
          "steps": [
            {
              "id": "measure-room",
              "step": "Measure Room Dimensions",
              "description": "Measure length, width, and calculate square footage. Account for irregular shapes, alcoves, and obstacles.",
              "contentType": "text",
              "content": "Use a tape measure to get accurate room dimensions. Multiply length × width for square footage. For irregular rooms, break into rectangles and add together. Always remeasure twice to verify accuracy.",
              "materials": [],
              "tools": [],
              "outputs": [
                {
                  "id": "room-measurements",
                  "name": "Accurate Room Measurements",
                  "description": "Precise measurements with square footage calculation",
                  "type": "performance-durability",
                  "requirement": "Measurements accurate within 1/8 inch",
                  "potentialEffects": "Incorrect measurements lead to material shortages or waste",
                  "keyInputs": ["Room length", "Room width", "Obstacle locations"],
                  "qualityChecks": "Double-check all measurements, verify calculations",
                  "mustGetRight": "Room square footage must be calculated correctly for proper material ordering"
                }
              ]
            },
            {
              "id": "calculate-materials",
              "step": "Calculate Tile and Material Quantities",
              "description": "Determine required tile quantity with 10% waste factor, plus all installation materials.",
              "contentType": "text", 
              "content": "Add 10% to square footage for waste and cuts. Calculate thinset: 1 bag per 40-50 sq ft. Grout: 1 bag per 100-200 sq ft depending on tile size and joint width. Order membrane to match room size plus 5%.",
              "materials": [],
              "tools": [],
              "outputs": [
                {
                  "id": "material-list",
                  "name": "Complete Material Shopping List",
                  "description": "Detailed list with quantities for all project materials",
                  "type": "performance-durability",
                  "requirement": "All materials calculated with appropriate waste factors",
                  "potentialEffects": "Insufficient materials cause project delays",
                  "keyInputs": ["Room square footage", "Tile size", "Joint width"],
                  "qualityChecks": "Review calculations, verify waste factors applied",
                  "mustGetRight": "Material quantities must account for cuts, waste, and breakage"
                }
              ]
            }
          ]
        },
        {
          "id": "layout-design",
          "name": "Design Tile Layout",
          "description": "Plan optimal tile arrangement and establish reference lines",
          "steps": [
            {
              "id": "create-layout-plan",
              "step": "Create Layout Plan",
              "description": "Determine tile pattern, starting point, and handle transitions to other rooms.",
              "contentType": "text",
              "content": "Draw room to scale on graph paper. Plan tile layout to minimize small cuts at visible edges. Consider door transitions, fixture locations, and pattern alignment. Center layout when possible.",
              "materials": [],
              "tools": [],
              "outputs": [
                {
                  "id": "layout-drawing",
                  "name": "Detailed Layout Drawing",
                  "description": "Scale drawing showing tile placement and cut locations",
                  "type": "major-aesthetics", 
                  "requirement": "Layout minimizes small cuts and maintains symmetry",
                  "potentialEffects": "Poor layout creates unsightly narrow cuts at edges",
                  "keyInputs": ["Room dimensions", "Tile size", "Pattern choice"],
                  "qualityChecks": "Review for balanced appearance and practical cuts",
                  "mustGetRight": "Layout must create visually pleasing tile arrangement"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "prep-phase", 
      "name": "Prep",
      "description": "Subfloor preparation, membrane installation, and waterproofing",
      "operations": [
        {
          "id": "subfloor-prep",
          "name": "Prepare Subfloor",
          "description": "Clean, level, and prepare substrate for tile installation", 
          "steps": [
            {
              "id": "remove-existing",
              "step": "Remove Existing Flooring",
              "description": "Remove old flooring material, adhesive residue, and any protruding fasteners.",
              "contentType": "text",
              "content": "Use appropriate tools to remove existing flooring. Scrape off adhesive residue with floor scraper. Set any protruding nails with nail set. Clean surface thoroughly.",
              "materials": [],
              "tools": [],
              "outputs": [
                {
                  "id": "clean-subfloor",
                  "name": "Clean Prepared Subfloor",
                  "description": "Subfloor free of debris, adhesive, and protrusions",
                  "type": "performance-durability",
                  "requirement": "Surface completely clean and smooth",
                  "potentialEffects": "Debris prevents proper tile adhesion",
                  "keyInputs": ["Existing flooring type", "Adhesive type"],
                  "qualityChecks": "Visual inspection, feel for smooth surface",
                  "mustGetRight": "Subfloor must be completely clean for proper membrane adhesion"
                }
              ]
            },
            {
              "id": "level-subfloor",
              "step": "Check and Level Subfloor", 
              "description": "Use level to identify high and low spots. Apply leveling compound to low areas.",
              "contentType": "text",
              "content": "Check subfloor with 4-foot level. Mark high and low spots. Sand down high spots if possible. Mix leveling compound per instructions and apply to low areas. Allow to cure completely.",
              "materials": [],
              "tools": [],
              "outputs": [
                {
                  "id": "level-subfloor-surface",
                  "name": "Level Subfloor Surface",
                  "description": "Subfloor level within 1/8 inch in 10 feet",
                  "type": "performance-durability",
                  "requirement": "No variations greater than 1/8 inch over 10-foot span",
                  "potentialEffects": "Uneven subfloor causes tile lippage and potential cracking",
                  "keyInputs": ["Subfloor material", "Level measurements"],
                  "qualityChecks": "Re-check with level after compound cures",
                  "mustGetRight": "Subfloor levelness is critical for proper tile installation"
                }
              ]
            }
          ]
        },
        {
          "id": "membrane-install", 
          "name": "Install Waterproof Membrane",
          "description": "Install uncoupling membrane for crack prevention and waterproofing",
          "steps": [
            {
              "id": "cut-membrane",
              "step": "Cut Membrane to Size",
              "description": "Measure and cut membrane sections with utility knife. Cut relief cuts around pipes and obstacles.",
              "contentType": "text",
              "content": "Lay membrane fleece-side down and mark cutting lines. Use sharp utility knife for clean cuts. Make relief cuts around pipes by cutting slits from edge to pipe location.",
              "materials": [],
              "tools": [],
              "outputs": [
                {
                  "id": "cut-membrane-pieces",
                  "name": "Properly Cut Membrane Sections",
                  "description": "Membrane pieces cut to fit room layout with proper relief cuts",
                  "type": "performance-durability",
                  "requirement": "Clean cuts that fit room dimensions exactly",
                  "potentialEffects": "Poor cuts create gaps or overlaps affecting waterproofing",
                  "keyInputs": ["Room measurements", "Obstacle locations"],
                  "qualityChecks": "Test fit before applying adhesive",
                  "mustGetRight": "Membrane must fit perfectly to ensure waterproof seal"
                }
              ]
            },
            {
              "id": "install-membrane",
              "step": "Install Membrane with Thinset",
              "description": "Apply thinset mortar and embed membrane sections, working out air bubbles.",
              "contentType": "text",
              "content": "Mix unmodified thinset to proper consistency. Spread with smooth trowel, then comb with notched side. Roll out membrane into wet thinset, pressing out air bubbles with float.",
              "materials": [],
              "tools": [],
              "outputs": [
                {
                  "id": "installed-membrane",
                  "name": "Properly Installed Membrane",
                  "description": "Membrane fully bonded with no air bubbles or lifting",
                  "type": "performance-durability",
                  "requirement": "Complete adhesion with no voids or bubbles",
                  "potentialEffects": "Air bubbles cause membrane failure and potential leaks", 
                  "keyInputs": ["Thinset consistency", "Application technique"],
                  "qualityChecks": "Check for complete bonding, no soft spots",
                  "mustGetRight": "Membrane must be fully bonded for waterproof integrity"
                }
              ]
            },
            {
              "id": "seal-seams",
              "step": "Waterproof Membrane Seams",
              "description": "Apply waterproof tape and thinset to all membrane seams and wall transitions.",
              "contentType": "text", 
              "content": "Apply thinset over seams. Embed waterproof tape with minimum 2-inch overlap on each side. Use trowel to press out air bubbles. Ensure complete coverage.",
              "materials": [],
              "tools": [],
              "outputs": [
                {
                  "id": "sealed-seams",
                  "name": "Waterproof Sealed Seams",
                  "description": "All membrane seams properly sealed with tape and thinset",
                  "type": "safety",
                  "requirement": "Complete waterproof seal at all seams",
                  "potentialEffects": "Unsealed seams allow water penetration and damage",
                  "keyInputs": ["Tape overlap", "Thinset coverage"],
                  "qualityChecks": "Visual inspection for complete coverage",
                  "mustGetRight": "Seams must be completely waterproof to prevent water damage"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "set-phase",
      "name": "Set", 
      "description": "Tile installation, cutting, and alignment",
      "operations": [
        {
          "id": "establish-lines",
          "name": "Establish Reference Lines",
          "description": "Mark center lines and starting points for tile installation",
          "steps": [
            {
              "id": "mark-center-lines",
              "step": "Mark Center Reference Lines",
              "description": "Find room center points and snap chalk lines for tile reference grid.",
              "contentType": "text",
              "content": "Measure opposite walls and mark center points. Snap chalk line between centers. Repeat for other direction. Use carpenter square to verify lines are perpendicular.",
              "materials": [],
              "tools": [],
              "outputs": [
                {
                  "id": "reference-lines",
                  "name": "Accurate Reference Lines",
                  "description": "Perpendicular chalk lines marking tile installation grid",
                  "type": "major-aesthetics",
                  "requirement": "Lines must be perfectly perpendicular and centered",
                  "potentialEffects": "Crooked reference lines result in misaligned tile installation",
                  "keyInputs": ["Room measurements", "Center calculations"],
                  "qualityChecks": "Verify with carpenter square, check measurements",
                  "mustGetRight": "Reference lines determine entire tile layout alignment"
                }
              ]
            },
            {
              "id": "dry-layout",
              "step": "Dry Fit Tile Layout",
              "description": "Test tile placement without adhesive to verify layout and make adjustments.",
              "contentType": "text",
              "content": "Place tiles along reference lines with spacers. Check for proper spacing and alignment. Adjust layout if small cuts would occur at visible edges. Mark any layout changes.",
              "materials": [],
              "tools": [],
              "outputs": [
                {
                  "id": "verified-layout",
                  "name": "Verified Tile Layout",
                  "description": "Final tile arrangement tested and approved",
                  "type": "major-aesthetics",
                  "requirement": "Layout creates balanced appearance with acceptable cut sizes",
                  "potentialEffects": "Poor layout creates unsightly small cuts or misalignment",
                  "keyInputs": ["Tile sizes", "Spacer gaps", "Room dimensions"],
                  "qualityChecks": "Review cut tile sizes, overall appearance",
                  "mustGetRight": "Layout must be finalized before permanent installation"
                }
              ]
            }
          ]
        },
        {
          "id": "install-tiles",
          "name": "Install Tiles",
          "description": "Apply thinset and install tiles following layout plan",
          "steps": [
            {
              "id": "mix-thinset",
              "step": "Mix Thinset Mortar",
              "description": "Mix unmodified thinset to proper peanut butter consistency for tile installation.",
              "contentType": "text",
              "content": "Mix thinset according to package directions. Achieve peanut butter consistency - holds ridges but spreads easily. Mix only what can be used in 30 minutes.",
              "materials": [],
              "tools": [],
              "outputs": [
                {
                  "id": "proper-thinset",
                  "name": "Properly Mixed Thinset",
                  "description": "Thinset mixed to optimal consistency for tile bonding",
                  "type": "performance-durability",
                  "requirement": "Proper consistency maintains ridges when combed",
                  "potentialEffects": "Wrong consistency causes poor tile adhesion",
                  "keyInputs": ["Water ratio", "Mixing time"],
                  "qualityChecks": "Test consistency with trowel ridges",
                  "mustGetRight": "Thinset consistency critical for proper tile bonding"
                }
              ]
            },
            {
              "id": "install-center-tiles",
              "step": "Install Center Tiles First",
              "description": "Start at room center and work outward, maintaining alignment and spacing.",
              "contentType": "text",
              "content": "Spread thinset with smooth trowel, then comb with notched edge at 45-degree angle. Set first tile at center intersection with slight twisting motion. Install along reference lines first.",
              "materials": [],
              "tools": [],
              "outputs": [
                {
                  "id": "center-tiles-set",
                  "name": "Center Tiles Properly Set",
                  "description": "Initial tiles installed with proper alignment and adhesion",
                  "type": "major-aesthetics",
                  "requirement": "Perfect alignment along reference lines",
                  "potentialEffects": "Misaligned start tiles affect entire installation",
                  "keyInputs": ["Reference line accuracy", "Thinset application"],
                  "qualityChecks": "Check alignment, pull test tile for adhesion",
                  "mustGetRight": "Center tiles set the standard for entire installation"
                }
              ]
            },
            {
              "id": "continue-installation",
              "step": "Continue Full Field Installation", 
              "description": "Work systematically outward, maintaining level and cleaning as you go.",
              "contentType": "text",
              "content": "Work in sections to keep thinset from skinning over. Place spacers at every corner. Check level frequently and adjust with rubber mallet. Clean excess thinset immediately.",
              "materials": [],
              "tools": [],
              "outputs": [
                {
                  "id": "field-tiles-complete",
                  "name": "Field Tiles Installation Complete",
                  "description": "All full tiles installed level and aligned",
                  "type": "major-aesthetics",
                  "requirement": "All tiles level within 1/32 inch",
                  "potentialEffects": "Uneven tiles create lippage and poor appearance",
                  "keyInputs": ["Thinset coverage", "Leveling technique"],
                  "qualityChecks": "Check with straightedge, verify spacing",
                  "mustGetRight": "Field tiles must be perfectly level for professional appearance"
                }
              ]
            }
          ]
        },
        {
          "id": "cut-edge-tiles",
          "name": "Cut and Install Edge Tiles",
          "description": "Measure, cut, and install perimeter tiles and any special cuts",
          "steps": [
            {
              "id": "measure-cuts",
              "step": "Measure for Edge Cuts",
              "description": "Carefully measure each edge tile location, accounting for expansion gaps.",
              "contentType": "text",
              "content": "Measure from last full tile to wall, subtract 1/4 inch for expansion gap and spacer width. Mark cut line on tile face. Double-check measurements before cutting.",
              "materials": [],
              "tools": [],
              "outputs": [
                {
                  "id": "cut-measurements",
                  "name": "Accurate Cut Measurements",
                  "description": "Precise measurements for all edge tile cuts",
                  "type": "major-aesthetics",
                  "requirement": "Measurements account for expansion gaps",
                  "potentialEffects": "Wrong measurements waste tiles and delay project",
                  "keyInputs": ["Wall distances", "Expansion gap requirements"],
                  "qualityChecks": "Double-check all measurements",
                  "mustGetRight": "Cut tiles must fit properly with correct gaps"
                }
              ]
            },
            {
              "id": "cut-tiles",
              "step": "Cut Tiles to Size",
              "description": "Use appropriate cutting tools for straight cuts, curves, and holes as needed.",
              "contentType": "text",
              "content": "Use tile cutter for straight cuts, wet saw for multiple cuts, nippers for curves, and hole saw for pipe penetrations. Always wear safety equipment.",
              "materials": [],
              "tools": [],
              "outputs": [
                {
                  "id": "cut-tiles-ready",
                  "name": "Properly Cut Tiles",
                  "description": "All edge tiles cut accurately to required dimensions",
                  "type": "major-aesthetics",
                  "requirement": "Clean cuts with smooth edges",
                  "potentialEffects": "Poor cuts create gaps or prevent proper fit",
                  "keyInputs": ["Cutting technique", "Tool selection"],
                  "qualityChecks": "Test fit before installing",
                  "mustGetRight": "Cut tiles must fit precisely in their spaces"
                }
              ]
            },
            {
              "id": "install-edge-tiles",
              "step": "Install Cut Edge Tiles",
              "description": "Install all perimeter tiles maintaining proper spacing and expansion gaps.",
              "contentType": "text",
              "content": "Apply thinset to wall area and back-butter cut tiles if needed. Maintain 1/4-inch expansion gap at walls. Use spacers to maintain joint width.",
              "materials": [],
              "tools": [],
              "outputs": [
                {
                  "id": "edge-installation-complete",
                  "name": "Edge Tile Installation Complete",
                  "description": "All perimeter tiles properly installed with correct gaps",
                  "type": "major-aesthetics",
                  "requirement": "Consistent gaps and alignment with field tiles",
                  "potentialEffects": "Improper edge installation affects overall appearance",
                  "keyInputs": ["Expansion gap consistency", "Alignment accuracy"],
                  "qualityChecks": "Check gaps, verify alignment",
                  "mustGetRight": "Edge tiles complete the professional appearance"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "finish-phase",
      "name": "Finish",
      "description": "Grouting, sealing, cleanup, and final details",
      "operations": [
        {
          "id": "grout-installation",
          "name": "Grout Installation",
          "description": "Remove spacers, apply grout, and clean tile surface",
          "steps": [
            {
              "id": "prepare-for-grout",
              "step": "Prepare Surface for Grouting",
              "description": "Allow thinset to cure, remove spacers, and clean joints of debris.",
              "contentType": "text",
              "content": "Wait 24 hours for thinset to cure. Remove all tile spacers carefully. Clean grout joints of any thinset or debris using utility knife or grout rake.",
              "materials": [],
              "tools": [],
              "outputs": [
                {
                  "id": "ready-for-grout",
                  "name": "Surface Ready for Grouting",
                  "description": "Clean joints with all spacers removed and thinset cured",
                  "type": "performance-durability",
                  "requirement": "Joints completely clean and thinset fully cured",
                  "potentialEffects": "Debris in joints prevents proper grout adhesion",
                  "keyInputs": ["Cure time", "Joint cleanliness"],
                  "qualityChecks": "Visual inspection of all joints",
                  "mustGetRight": "Clean joints essential for strong grout bond"
                }
              ]
            },
            {
              "id": "mix-apply-grout",
              "step": "Mix and Apply Grout",
              "description": "Mix grout to proper consistency and apply with rubber float diagonally across tiles.",
              "contentType": "text",
              "content": "Mix grout according to directions. Apply with rubber float held at 45-degree angle, pressing into joints. Work diagonally across tiles to avoid pulling grout from joints.",
              "materials": [],
              "tools": [],
              "outputs": [
                {
                  "id": "grout-applied",
                  "name": "Grout Properly Applied",
                  "description": "All joints completely filled with grout",
                  "type": "performance-durability",
                  "requirement": "Joints completely filled with no voids",
                  "potentialEffects": "Incomplete grout fill allows moisture penetration",
                  "keyInputs": ["Grout consistency", "Application technique"],
                  "qualityChecks": "Check for complete joint fill",
                  "mustGetRight": "Complete grout fill prevents water damage"
                }
              ]
            },
            {
              "id": "clean-grout-haze",
              "step": "Clean Grout Haze",
              "description": "Remove excess grout and clean haze from tile surface with damp sponge.",
              "contentType": "text",
              "content": "Wait 20 minutes after grouting. Clean with slightly damp sponge using circular motions. Rinse sponge frequently in clean water. Remove all haze for clear tile surface.",
              "materials": [],
              "tools": [],
              "outputs": [
                {
                  "id": "clean-tile-surface", 
                  "name": "Clean Tile Surface",
                  "description": "Tile surface completely free of grout haze and residue",
                  "type": "major-aesthetics",
                  "requirement": "No grout haze or residue on tile faces",
                  "potentialEffects": "Grout haze creates cloudy appearance on tiles",
                  "keyInputs": ["Cleaning technique", "Water cleanliness"],
                  "qualityChecks": "Visual inspection in good lighting",
                  "mustGetRight": "Clean tiles showcase the finished installation"
                }
              ]
            }
          ]
        },
        {
          "id": "final-sealing",
          "name": "Final Sealing and Protection",
          "description": "Apply sealants and protective finishes",
          "steps": [
            {
              "id": "cure-grout",
              "step": "Allow Grout to Cure",
              "description": "Wait required time for grout to fully cure before sealing and use.",
              "contentType": "text", 
              "content": "Allow grout to cure per manufacturer specifications (typically 72 hours). Avoid foot traffic during cure period. Maintain proper temperature and humidity.",
              "materials": [],
              "tools": [],
              "outputs": [
                {
                  "id": "cured-grout",
                  "name": "Fully Cured Grout",
                  "description": "Grout achieved full strength and ready for sealing",
                  "type": "performance-durability",
                  "requirement": "Complete cure per manufacturer timeline",
                  "potentialEffects": "Insufficient cure time weakens grout strength",
                  "keyInputs": ["Cure time", "Environmental conditions"],
                  "qualityChecks": "Verify cure time met, test firmness",
                  "mustGetRight": "Proper cure ensures maximum grout strength"
                }
              ]
            },
            {
              "id": "apply-caulk",
              "step": "Apply Expansion Joint Caulk",
              "description": "Caulk all expansion gaps at walls, transitions, and fixtures with silicone sealant.",
              "contentType": "text",
              "content": "Apply silicone caulk to all expansion gaps using caulk gun. Smooth with finger or tool for neat appearance. Remove excess immediately.",
              "materials": [],
              "tools": [],
              "outputs": [
                {
                  "id": "sealed-expansion-joints",
                  "name": "Sealed Expansion Joints",
                  "description": "All expansion gaps properly sealed with flexible caulk",
                  "type": "safety",
                  "requirement": "Complete seal of all expansion gaps",
                  "potentialEffects": "Unsealed gaps allow water penetration",
                  "keyInputs": ["Caulk type", "Application technique"],
                  "qualityChecks": "Check all perimeter gaps sealed",
                  "mustGetRight": "Expansion joint sealing prevents water damage"
                }
              ]
            },
            {
              "id": "seal-grout",
              "step": "Apply Grout Sealer",
              "description": "After 3 weeks, apply penetrating grout sealer to protect against staining.",
              "contentType": "text",
              "content": "Wait 3 weeks after grouting. Clean grout thoroughly before sealing. Apply penetrating grout sealer according to manufacturer directions. Wipe excess from tile faces.",
              "materials": [],
              "tools": [],
              "outputs": [
                {
                  "id": "protected-grout",
                  "name": "Protected Sealed Grout",
                  "description": "Grout protected with penetrating sealer against stains",
                  "type": "performance-durability",
                  "requirement": "Complete grout sealer coverage",
                  "potentialEffects": "Unsealed grout stains and deteriorates faster",
                  "keyInputs": ["Sealer type", "Application coverage"],
                  "qualityChecks": "Verify complete coverage, no excess on tiles",
                  "mustGetRight": "Grout sealing essential for long-term protection"
                }
              ]
            }
          ]
        },
        {
          "id": "final-cleanup",
          "name": "Final Cleanup and Inspection",
          "description": "Complete project cleanup and quality inspection",
          "steps": [
            {
              "id": "final-cleaning",
              "step": "Final Surface Cleaning",
              "description": "Thoroughly clean all surfaces and remove any remaining haze or residue.",
              "contentType": "text",
              "content": "Use grout haze remover if needed for stubborn residue. Clean tile surfaces with appropriate cleaner. Vacuum and mop to remove all dust and debris.",
              "materials": [],
              "tools": [],
              "outputs": [
                {
                  "id": "pristine-surface",
                  "name": "Pristine Clean Surface",
                  "description": "Completely clean tile installation ready for use",
                  "type": "major-aesthetics",
                  "requirement": "All surfaces spotless and residue-free",
                  "potentialEffects": "Poor cleanup detracts from professional appearance",
                  "keyInputs": ["Cleaning products", "Cleaning technique"],
                  "qualityChecks": "Inspect under good lighting for cleanliness",
                  "mustGetRight": "Final cleaning showcases the quality installation"
                }
              ]
            },
            {
              "id": "install-trim",
              "step": "Install Baseboards and Trim",
              "description": "Install baseboards, quarter round, and transition strips to complete the installation.",
              "contentType": "text",
              "content": "Install baseboards over expansion gaps. Add quarter round if needed. Install transition strips at doorways. Caulk gaps between trim and tile.",
              "materials": [],
              "tools": [],
              "outputs": [
                {
                  "id": "completed-installation",
                  "name": "Complete Finished Installation",
                  "description": "Professional tile installation with all trim and transitions complete",
                  "type": "major-aesthetics",
                  "requirement": "All edges properly finished with appropriate trim",
                  "potentialEffects": "Missing trim leaves installation looking unfinished",
                  "keyInputs": ["Trim selection", "Installation quality"],
                  "qualityChecks": "Inspect all edges and transitions",
                  "mustGetRight": "Proper trim work completes the professional appearance"
                }
              ]
            }
          ]
        }
      ]
    }
  ]'
);