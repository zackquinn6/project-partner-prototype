import { Phase, Operation, WorkflowStep } from '@/interfaces/Project';

export const createKickoffPhase = (): Phase => {
  const kickoffSteps: WorkflowStep[] = [
    {
      id: 'kickoff-step-1',
      step: 'Project Overview',
      description: 'Review and customize your project details, timeline, and objectives',
      contentType: 'text' as const,
      content: 'This is your project overview step. Review all project details and make any necessary customizations before proceeding.',
      materials: [],
      tools: [],
      outputs: [{
        id: 'overview-output',
        name: 'Project Overview Complete',
        description: 'Project details reviewed and customized',
        type: 'none' as const
      }]
    },
    {
      id: 'kickoff-step-2',
      step: 'Project Partner Agreement',
      description: 'Review and sign the project partner agreement',
      contentType: 'text' as const,
      content: 'Please review the project partner agreement terms and provide your digital signature to proceed.',
      materials: [],
      tools: [],
      outputs: [{
        id: 'agreement-output',
        name: 'Signed Agreement',
        description: 'Project partner agreement signed and documented',
        type: 'none' as const
      }]
    },
    {
      id: 'kickoff-step-3',
      step: 'Project Planning',
      description: 'Customize your project workflow by adding phases from our library',
      contentType: 'text' as const,
      content: 'Customize your project by adding additional phases from our library or create custom phases for your specific needs.',
      materials: [],
      tools: [],
      outputs: [{
        id: 'planning-output',
        name: 'Project Workflow Customized',
        description: 'Project phases selected and workflow finalized',
        type: 'none' as const
      }]
    }
  ];

  const kickoffOperation: Operation = {
    id: 'kickoff-operation',
    name: 'Kickoff',
    description: 'Essential project setup and customization',
    steps: kickoffSteps
  };

  const kickoffPhase: Phase = {
    id: 'kickoff-phase',
    name: 'Kickoff',
    description: 'Essential project setup, agreement, and customization',
    operations: [kickoffOperation]
  };

  return kickoffPhase;
};

export const createOrderingPhase = (): Phase => {
  const orderingSteps: WorkflowStep[] = [
    {
      id: 'ordering-step-1',
      step: 'Tool & Material Ordering',
      description: 'Order all required tools and materials for your project using the integrated shopping browser',
      contentType: 'text' as const,
      content: 'Use the shopping browser to purchase all required tools and materials. Check off items as you order them to track your progress.',
      materials: [],
      tools: [],
      outputs: [{
        id: 'ordering-output',
        name: 'All Items Ordered',
        description: 'All required tools and materials have been ordered',
        type: 'none' as const
      }]
    }
  ];

  const orderingOperation: Operation = {
    id: 'ordering-operation',
    name: 'Tool & Material Ordering',
    description: 'Order all project tools and materials',
    steps: orderingSteps
  };

  const orderingPhase: Phase = {
    id: 'ordering-phase',
    name: 'Ordering',
    description: 'Order all required tools and materials for the project',
    operations: [orderingOperation]
  };

  return orderingPhase;
};

export const addStandardPhasesToProjectRun = (phases: Phase[]): Phase[] => {
  let processedPhases = [...phases];
  
  // Check if kickoff phase already exists
  const hasKickoff = processedPhases.some(phase => phase.name === 'Kickoff');
  if (!hasKickoff) {
    processedPhases = [createKickoffPhase(), ...processedPhases];
  }
  
  // Check if ordering phase already exists
  const hasOrdering = processedPhases.some(phase => phase.name === 'Ordering');
  if (!hasOrdering) {
    // Insert ordering phase as second phase (after kickoff)
    const kickoffIndex = processedPhases.findIndex(phase => phase.name === 'Kickoff');
    if (kickoffIndex >= 0) {
      processedPhases.splice(kickoffIndex + 1, 0, createOrderingPhase());
    } else {
      processedPhases.unshift(createOrderingPhase());
    }
  }

  return processedPhases;
};

// Keep the old function for backward compatibility
export const addKickoffPhaseToProjectRun = addStandardPhasesToProjectRun;

export const isKickoffPhaseComplete = (completedSteps: string[]): boolean => {
  const kickoffStepIds = [
    'kickoff-step-1',
    'kickoff-step-2', 
    'kickoff-step-3'
  ];
  
  return kickoffStepIds.every(stepId => completedSteps.includes(stepId));
};

export const getKickoffStepIndex = (stepId: string): number => {
  const kickoffStepIds = [
    'kickoff-step-1',
    'kickoff-step-2',
    'kickoff-step-3'
  ];
  
  return kickoffStepIds.indexOf(stepId);
};