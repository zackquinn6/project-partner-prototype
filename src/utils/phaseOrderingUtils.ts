import { Phase } from "@/interfaces/Project";

/**
 * Ensures standard phases are in the correct order in a project
 * Standard phases: Kickoff -> Planning -> Ordering -> [Custom Phases] -> Close Project
 */
export function enforceStandardPhaseOrdering(phases: Phase[]): Phase[] {
  const standardPhaseNames = ['Kickoff', 'Planning', 'Ordering', 'Close Project'];
  
  // Separate standard and custom phases
  const standardPhases: Phase[] = [];
  const customPhases: Phase[] = [];
  const linkedPhases: Phase[] = [];
  
  phases.forEach(phase => {
    if (phase.isLinked) {
      linkedPhases.push(phase);
    } else if (standardPhaseNames.includes(phase.name)) {
      standardPhases.push(phase);
    } else {
      customPhases.push(phase);
    }
  });
  
  // Sort standard phases in the correct order
  const orderedStandardPhases = [
    standardPhases.find(p => p.name === 'Kickoff'),
    standardPhases.find(p => p.name === 'Planning'), 
    standardPhases.find(p => p.name === 'Ordering'),
  ].filter(Boolean) as Phase[];
  
  const closeProjectPhase = standardPhases.find(p => p.name === 'Close Project');
  
  // Combine in correct order: Standard -> Custom -> Linked -> Close Project
  const orderedPhases = [
    ...orderedStandardPhases,
    ...customPhases,
    ...linkedPhases,
    ...(closeProjectPhase ? [closeProjectPhase] : [])
  ];
  
  return orderedPhases;
}

/**
 * Validates that standard phases are in the correct order
 */
export function validateStandardPhaseOrdering(phases: Phase[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  const kickoffIndex = phases.findIndex(p => p.name === 'Kickoff' && !p.isLinked);
  const planningIndex = phases.findIndex(p => p.name === 'Planning' && !p.isLinked);
  const orderingIndex = phases.findIndex(p => p.name === 'Ordering' && !p.isLinked);
  const closeProjectIndex = phases.findIndex(p => p.name === 'Close Project' && !p.isLinked);
  
  // Check if standard phases exist and are in correct order
  if (kickoffIndex !== -1 && planningIndex !== -1 && kickoffIndex > planningIndex) {
    errors.push('Kickoff phase must come before Planning phase');
  }
  
  if (planningIndex !== -1 && orderingIndex !== -1 && planningIndex > orderingIndex) {
    errors.push('Planning phase must come before Ordering phase');
  }
  
  if (kickoffIndex !== -1 && orderingIndex !== -1 && kickoffIndex > orderingIndex) {
    errors.push('Kickoff phase must come before Ordering phase');
  }
  
  // Check that Close Project is last (if it exists)
  if (closeProjectIndex !== -1) {
    const hasPhaseAfterClose = phases.slice(closeProjectIndex + 1).length > 0;
    if (hasPhaseAfterClose) {
      errors.push('Close Project must be the last phase');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Gets the expected position for a standard phase
 */
export function getStandardPhaseExpectedPosition(phaseName: string, totalPhases: number): number {
  switch (phaseName) {
    case 'Kickoff':
      return 0;
    case 'Planning':
      return 1;
    case 'Ordering':
      return 2;
    case 'Close Project':
      return totalPhases - 1; // Always last
    default:
      return -1; // Not a standard phase
  }
}