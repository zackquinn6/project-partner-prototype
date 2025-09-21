-- Update existing tile flooring project runs to remove non-standard phases
-- Keep only standard phases: Kickoff, Planning, Close Project

UPDATE public.project_runs 
SET phases = '[
  {
    "id": "kickoff-phase",
    "name": "Kickoff",
    "description": "Essential project setup and agreement",
    "operations": [
      {
        "id": "kickoff-operation",
        "name": "Kickoff",
        "description": "Essential project setup and agreement",
        "steps": [
          {
            "id": "kickoff-step-1",
            "step": "Project Overview",
            "description": "Review and customize your project details, timeline, and objectives",
            "contentType": "text",
            "content": "This is your project overview step. Review all project details and make any necessary customizations before proceeding.",
            "materials": [],
            "tools": [],
            "outputs": [
              {
                "id": "overview-output",
                "name": "Project Overview Complete",
                "description": "Project details reviewed and customized",
                "type": "none"
              }
            ]
          },
          {
            "id": "kickoff-step-2",
            "step": "Project Partner Agreement",
            "description": "Review and sign the project partner agreement",
            "contentType": "text",
            "content": "Please review the project partner agreement terms and provide your digital signature to proceed.",
            "materials": [],
            "tools": [],
            "outputs": [
              {
                "id": "agreement-output",
                "name": "Signed Agreement",
                "description": "Project partner agreement signed and documented",
                "type": "none"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "planning-phase",
    "name": "Planning",
    "description": "Comprehensive project planning and preparation",
    "operations": [
      {
        "id": "initial-planning-operation",
        "name": "Initial Planning",
        "description": "Define project scope and select phases",
        "steps": [
          {
            "id": "planning-step-1",
            "step": "Project Work Scope",
            "description": "Define project scope, measurements, timing, and customize workflow",
            "contentType": "text",
            "content": "Complete the project sizing questionnaire and customize your project workflow by selecting phases from our library or creating custom phases.",
            "materials": [],
            "tools": [],
            "outputs": [
              {
                "id": "scope-output",
                "name": "Project Scope Defined",
                "description": "Project scope, timing, and workflow customized",
                "type": "none"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "close-project-phase",
    "name": "Close Project",
    "description": "Complete project closure and documentation",
    "operations": [
      {
        "id": "close-operation",
        "name": "Project Closure",
        "description": "Finalize project and document completion",
        "steps": [
          {
            "id": "close-step-1",
            "step": "Project Completion Review",
            "description": "Review completed work and document final results",
            "contentType": "text",
            "content": "Conduct a final review of all completed work, document any lessons learned, and officially close the project.",
            "materials": [],
            "tools": [],
            "outputs": [
              {
                "id": "completion-output",
                "name": "Project Completed",
                "description": "Project officially closed and documented",
                "type": "none"
              }
            ]
          }
        ]
      }
    ]
  }
]'::jsonb,
updated_at = now()
WHERE template_id IN (
  SELECT id FROM public.projects WHERE name ILIKE '%tile flooring installation%'
);