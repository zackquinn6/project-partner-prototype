-- The original phases got corrupted. Let's restore from a template or rebuild
-- Based on the original Tile Flooring Installation project structure

UPDATE public.projects 
SET phases = jsonb_build_array(
  -- Kickoff Phase (keep existing - it's working)
  phases->0,
  
  -- Planning Phase (rebuild)
  jsonb_build_object(
    'id', 'planning-phase',
    'name', 'Planning',
    'description', 'Comprehensive project planning and preparation',
    'operations', jsonb_build_array(
      jsonb_build_object(
        'id', 'initial-planning-operation',
        'name', 'Initial Planning',
        'description', 'Define project scope and select phases',
        'steps', jsonb_build_array(
          jsonb_build_object(
            'id', 'planning-step-1',
            'step', 'Project Work Scope',
            'description', 'Define project scope, measurements, timing, and customize workflow',
            'contentType', 'text',
            'content', 'Complete the project sizing questionnaire and customize your project workflow by selecting phases from our library or creating custom phases.',
            'materials', '[]'::jsonb,
            'tools', '[]'::jsonb,
            'outputs', jsonb_build_array(
              jsonb_build_object(
                'id', 'scope-output',
                'name', 'Project Scope Defined',
                'description', 'Project scope, timing, and workflow customized',
                'type', 'none'
              )
            )
          )
        )
      )
    )
  ),

  -- Ordering Phase (keep existing - it's working)  
  phases->2,
  
  -- Prep Phase (rebuild)
  jsonb_build_object(
    'id', 'prep-phase',
    'name', 'Prep',
    'description', 'Surface preparation and project setup',
    'operations', jsonb_build_array(
      jsonb_build_object(
        'id', 'project-setup-op',
        'name', 'Project Setup',
        'description', 'Initial project setup and preparation',
        'steps', jsonb_build_array(
          jsonb_build_object(
            'id', 'setup-step-1',
            'step', 'Room Preparation',
            'description', 'Prepare the room for tile installation',
            'contentType', 'text',
            'content', 'Clear the room of furniture and prepare the space for tile installation work.',
            'materials', '[]'::jsonb,
            'tools', '[]'::jsonb,
            'outputs', jsonb_build_array(
              jsonb_build_object(
                'id', 'room-prep-output',
                'name', 'Room Prepared',
                'description', 'Room cleared and ready for work',
                'type', 'none'
              )
            )
          )
        )
      )
    )
  ),
  
  -- Install Phase (rebuild)
  jsonb_build_object(
    'id', 'install-phase',
    'name', 'Install', 
    'description', 'Main tile installation work',
    'operations', jsonb_build_array(
      jsonb_build_object(
        'id', 'tile-install-op',
        'name', 'Tile Installation',
        'description', 'Install tiles according to layout plan',
        'steps', jsonb_build_array(
          jsonb_build_object(
            'id', 'install-step-1',
            'step', 'Tile Installation',
            'description', 'Install tiles following proper technique',
            'contentType', 'text',
            'content', 'Install tiles according to your layout plan, ensuring proper spacing and alignment.',
            'materials', '[]'::jsonb,
            'tools', '[]'::jsonb,
            'outputs', jsonb_build_array(
              jsonb_build_object(
                'id', 'tiles-installed-output',
                'name', 'Tiles Installed',
                'description', 'All tiles properly installed',
                'type', 'none'
              )
            )
          )
        )
      )
    )
  ),
  
  -- Close Project Phase (rebuild)
  jsonb_build_object(
    'id', 'close-project-phase',
    'name', 'Close Project',
    'description', 'Final cleanup, organization, and celebration of project completion',
    'operations', jsonb_build_array(
      jsonb_build_object(
        'id', 'cleanup-operation',
        'name', 'Project Cleanup',
        'description', 'Clean up workspace and organize tools',
        'steps', jsonb_build_array(
          jsonb_build_object(
            'id', 'cleanup-step-1',
            'step', 'Final Cleanup',
            'description', 'Clean workspace and organize tools',
            'contentType', 'text',
            'content', 'Clean up the work area and organize all tools and materials.',
            'materials', '[]'::jsonb,
            'tools', '[]'::jsonb,
            'outputs', jsonb_build_array(
              jsonb_build_object(
                'id', 'cleanup-output',
                'name', 'Project Cleaned Up',
                'description', 'Workspace cleaned and tools organized',
                'type', 'none'
              )
            )
          )
        )
      )
    )
  )
)
WHERE name = 'Tile Flooring Installation';