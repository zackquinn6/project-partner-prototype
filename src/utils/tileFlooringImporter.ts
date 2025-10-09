import { Project, Phase, Operation, WorkflowStep, Output, StepInput } from '@/interfaces/Project';
import { ensureStandardPhasesForNewProject } from './projectUtils';

interface ParsedRow {
  flow: string;
  phase: string;
  operation: string;
  step: string;
  description: string;
  outputs: string;
  inputs: string;
}

export function parseTileFlooringData(tableData: string): Project {
  // Parse the markdown table
  const lines = tableData.split('\n').filter(line => line.trim().startsWith('|'));
  
  // Skip header and separator rows
  const dataLines = lines.slice(2);
  
  const parsedRows: ParsedRow[] = dataLines.map(line => {
    const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
    return {
      flow: cells[0] || '',
      phase: cells[1] || '',
      operation: cells[2] || '',
      step: cells[3] || '',
      description: cells[4] || '',
      outputs: cells[5] || '',
      inputs: cells[6] || ''
    };
  }).filter(row => row.phase && row.operation && row.step);

  // Group by phase -> operation -> step and combine outputs
  const phaseMap = new Map<string, Phase>();
  
  parsedRows.forEach(row => {
    const phaseName = row.phase.trim();
    const operationName = row.operation.trim();
    const stepName = row.step.trim();
    
    // Get or create phase
    if (!phaseMap.has(phaseName)) {
      phaseMap.set(phaseName, {
        id: generateId(phaseName),
        name: phaseName,
        description: `${phaseName} phase for tile flooring installation`,
        operations: []
      });
    }
    
    const phase = phaseMap.get(phaseName)!;
    
    // Find or create operation
    let operation = phase.operations.find(op => op.name === operationName);
    if (!operation) {
      operation = {
        id: generateId(operationName),
        name: operationName,
        description: `${operationName} operation`,
        steps: []
      };
      phase.operations.push(operation);
    }
    
    // Find or create step
    let step = operation.steps.find(s => s.step === stepName);
    if (!step) {
      // Parse inputs from the first row for this step
      const inputs = parseInputs(row.inputs, stepName);
      
      step = {
        id: generateId(stepName),
        step: stepName,
        description: row.description,
        contentType: 'text',
        content: row.description,
        contentSections: [{
          id: generateId(`${stepName}-content`),
          type: 'text',
          content: row.description
        }],
        inputs,
        outputs: [],
        materials: [],
        tools: []
      };
      operation.steps.push(step);
    }
    
    // Add output to this step
    if (row.outputs) {
      const outputName = row.outputs.replace(/<br\/?>/gi, '\n').trim();
      if (outputName) {
        step.outputs.push({
          id: generateId(`${stepName}-output-${step.outputs.length}`),
          name: outputName,
          description: outputName,
          type: 'none'
        });
      }
    }
  });
  
  // Convert phases to array
  const customPhases = Array.from(phaseMap.values());
  
  // Add standard phases
  const allPhases = ensureStandardPhasesForNewProject(customPhases);
  
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    name: 'Tile Flooring',
    description: 'Complete tile flooring installation project with detailed workflow steps, outputs, and process inputs',
    phases: allPhases,
    category: 'Flooring',
    effortLevel: 'High',
    skillLevel: 'Advanced',
    estimatedTime: '3-7 days',
    publishStatus: 'draft',
    createdAt: now,
    updatedAt: now,
    startDate: now,
    planEndDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    status: 'not-started'
  };
}

function parseInputs(inputsText: string, stepName: string): StepInput[] {
  if (!inputsText) return [];
  
  // Replace <br/> tags with newlines
  const cleanedText = inputsText.replace(/<br\/?>/gi, '\n');
  
  // Split by newlines and filter empty lines
  const inputLines = cleanedText.split('\n').filter(line => line.trim());
  
  const inputs: StepInput[] = [];
  
  inputLines.forEach((line, index) => {
    // Remove leading asterisk and whitespace
    const cleanInput = line.replace(/^\*\s*/, '').trim();
    
    if (cleanInput) {
      inputs.push({
        id: generateId(`${stepName}-input-${index}`),
        name: cleanInput,
        description: cleanInput,
        type: 'text',
        required: true
      });
    }
  });
  
  return inputs;
}

function generateId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50) + '-' + Math.random().toString(36).substring(2, 8);
}
