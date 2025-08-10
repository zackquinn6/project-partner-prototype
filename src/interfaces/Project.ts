export interface Material {
  id: string;
  name: string;
  description: string;
  category: 'Hardware' | 'Software' | 'Consumable' | 'Other';
  required: boolean;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: 'Hardware' | 'Software' | 'Hand Tool' | 'Power Tool' | 'Other';
  required: boolean;
}

export interface Output {
  id: string;
  name: string;
  description: string;
  type: 'none' | 'major-aesthetics' | 'performance-durability' | 'safety';
  potentialEffects?: string;
  photosOfEffects?: string;
  mustGetRight?: string;
  qualityChecks?: string;
}

export interface WorkflowStep {
  id: string;
  phase: string;
  operation: string;
  step: string;
  description: string;
  contentType: 'text' | 'video' | 'image' | 'document';
  content: string;
  materials: Material[];
  tools: Tool[];
  outputs: Output[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  workflows: WorkflowStep[];
}