import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { ProjectRun } from '../../interfaces/ProjectRun';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useIsMobile } from '../../hooks/use-mobile';

interface WorkflowDecisionEngineProps {
  projectRun: ProjectRun;
  onStandardDecision: (phaseId: string, alternatives: string[]) => void;
  onIfNecessaryWork: (phaseId: string, optionalWork: string[]) => void;
  customizationState: {
    standardDecisions: Record<string, string[]>;
    ifNecessaryWork: Record<string, string[]>;
  };
}

interface DecisionOption {
  id: string;
  name: string;
  description: string;
  type: 'alternative' | 'if-necessary';
  alternatives?: string[];
  required?: boolean;
}

// Mock decision options - in a real app, these would come from your data model
const getDecisionOptionsForPhase = (phaseName: string): DecisionOption[] => {
  const phaseNameLower = phaseName.toLowerCase();
  
  if (phaseNameLower.includes('planning')) {
    return [
      {
        id: 'measurement-method',
        name: 'Measurement Method',
        description: 'Choose your preferred measurement approach',
        type: 'alternative',
        alternatives: ['Digital Laser Measuring', 'Traditional Tape Measure', 'Room Mapping App'],
        required: true
      },
      {
        id: 'planning-tools',
        name: 'Planning Tools',
        description: 'Optional planning assistance',
        type: 'if-necessary',
        alternatives: ['3D Room Visualization', 'Material Calculator', 'Timeline Optimizer']
      }
    ];
  }
  
  if (phaseNameLower.includes('prep')) {
    return [
      {
        id: 'surface-prep',
        name: 'Surface Preparation',
        description: 'Choose surface preparation method',
        type: 'alternative',
        alternatives: ['Chemical Stripping', 'Sanding', 'Steam Removal'],
        required: true
      },
      {
        id: 'additional-prep',
        name: 'Additional Preparation',
        description: 'Optional preparation steps',
        type: 'if-necessary',
        alternatives: ['Crack Repair', 'Primer Application', 'Moisture Barrier']
      }
    ];
  }
  
  if (phaseNameLower.includes('install')) {
    return [
      {
        id: 'installation-pattern',
        name: 'Installation Pattern',
        description: 'Choose tile layout pattern',
        type: 'alternative',
        alternatives: ['Straight Grid', 'Diagonal', 'Herringbone', 'Brick Pattern'],
        required: true
      },
      {
        id: 'edge-treatment',
        name: 'Edge Treatment',
        description: 'Optional edge finishing',
        type: 'if-necessary',
        alternatives: ['Bullnose Tiles', 'Metal Edge Strips', 'Caulk Finishing']
      }
    ];
  }
  
  return [];
};

export const WorkflowDecisionEngine: React.FC<WorkflowDecisionEngineProps> = ({
  projectRun,
  onStandardDecision,
  onIfNecessaryWork,
  customizationState
}) => {
  const isMobile = useIsMobile();

  const handleAlternativeSelection = (phaseId: string, decisionId: string, selectedAlternative: string) => {
    const currentDecisions = customizationState.standardDecisions[phaseId] || [];
    const updatedDecisions = currentDecisions.filter(d => !d.startsWith(decisionId + ':'));
    updatedDecisions.push(`${decisionId}:${selectedAlternative}`);
    onStandardDecision(phaseId, updatedDecisions);
  };

  const handleIfNecessarySelection = (phaseId: string, decisionId: string, option: string, checked: boolean) => {
    const currentWork = customizationState.ifNecessaryWork[phaseId] || [];
    const optionKey = `${decisionId}:${option}`;
    
    let updatedWork;
    if (checked) {
      updatedWork = [...currentWork, optionKey];
    } else {
      updatedWork = currentWork.filter(w => w !== optionKey);
    }
    
    onIfNecessaryWork(phaseId, updatedWork);
  };

  const getSelectedAlternative = (phaseId: string, decisionId: string): string | null => {
    const decisions = customizationState.standardDecisions[phaseId] || [];
    const decision = decisions.find(d => d.startsWith(decisionId + ':'));
    return decision ? decision.split(':')[1] : null;
  };

  const isIfNecessarySelected = (phaseId: string, decisionId: string, option: string): boolean => {
    const work = customizationState.ifNecessaryWork[phaseId] || [];
    return work.includes(`${decisionId}:${option}`);
  };

  return (
    <ScrollArea className="h-full">
      <div className={`space-y-6 ${isMobile ? 'px-1' : 'p-6'}`}>
        <div className="text-center mb-6">
          <h3 className={`font-semibold mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>Workflow Decision Points</h3>
          <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-sm'}`}>
            Make choices about how you want to execute each phase of your project.
            <strong className="text-primary"> Required decisions</strong> must be made, 
            <em className="text-muted-foreground"> optional work</em> can be added if needed.
          </p>
        </div>

        {projectRun.phases?.map((phase) => {
          const decisionOptions = getDecisionOptionsForPhase(phase.name);
          
          if (decisionOptions.length === 0) {
            return null;
          }

          return (
            <Card key={phase.id} className="w-full">
              <CardHeader className={isMobile ? 'pb-3' : ''}>
                <CardTitle className={`flex flex-col sm:flex-row sm:items-center gap-2 ${isMobile ? 'text-base' : ''}`}>
                  <span className="flex-1">{phase.name}</span>
                  <Badge variant="outline" className="self-start sm:self-center text-xs">
                    {phase.operations?.length || 0} operations
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">{phase.description}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {decisionOptions.map((decision) => (
                  <div key={decision.id} className={`border rounded-lg ${isMobile ? 'p-3' : 'p-4'}`}>
                    <div className={`flex items-start gap-3 mb-3 ${isMobile ? 'flex-col sm:flex-row' : ''}`}>
                      <div className={`${isMobile ? 'self-start' : 'mt-0.5'}`}>
                        {decision.type === 'alternative' ? (
                          <AlertCircle className="w-5 h-5 text-orange-500" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium flex flex-col sm:flex-row sm:items-center gap-2 ${isMobile ? 'text-sm' : ''}`}>
                          <span className="flex-1">{decision.name}</span>
                          <div className="flex gap-2">
                            {decision.required && (
                              <Badge variant="destructive" className="text-xs">Required</Badge>
                            )}
                            {decision.type === 'if-necessary' && (
                              <Badge variant="secondary" className="text-xs">Optional</Badge>
                            )}
                          </div>
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {decision.description}
                        </p>
                      </div>
                    </div>

                    {decision.type === 'alternative' && decision.alternatives && (
                      <RadioGroup
                        value={getSelectedAlternative(phase.id, decision.id) || ''}
                        onValueChange={(value) => handleAlternativeSelection(phase.id, decision.id, value)}
                        className={`space-y-3 ${isMobile ? 'ml-0 pl-0' : 'ml-8'}`}
                      >
                        {decision.alternatives.map((alternative) => (
                          <div key={alternative} className={`flex items-center space-x-3 ${isMobile ? 'p-3 bg-muted/30 rounded-lg' : ''}`}>
                            <RadioGroupItem 
                              value={alternative} 
                              id={`${decision.id}-${alternative}`}
                              className={isMobile ? 'scale-110' : ''}
                            />
                            <Label 
                              htmlFor={`${decision.id}-${alternative}`}
                              className={`font-normal cursor-pointer flex-1 ${isMobile ? 'text-sm leading-relaxed' : 'text-sm'}`}
                            >
                              {alternative}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}

                    {decision.type === 'if-necessary' && decision.alternatives && (
                      <div className={`space-y-3 ${isMobile ? 'ml-0 pl-0' : 'ml-8'}`}>
                        {decision.alternatives.map((option) => (
                          <div key={option} className={`flex items-center space-x-3 ${isMobile ? 'p-3 bg-muted/30 rounded-lg' : ''}`}>
                            <Checkbox
                              id={`${decision.id}-${option}`}
                              checked={isIfNecessarySelected(phase.id, decision.id, option)}
                              onCheckedChange={(checked) => 
                                handleIfNecessarySelection(phase.id, decision.id, option, checked as boolean)
                              }
                              className={isMobile ? 'scale-110' : ''}
                            />
                            <Label 
                              htmlFor={`${decision.id}-${option}`}
                              className={`font-normal cursor-pointer flex-1 ${isMobile ? 'text-sm leading-relaxed' : 'text-sm'}`}
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}

        {projectRun.phases?.every(phase => getDecisionOptionsForPhase(phase.name).length === 0) && (
          <Card>
            <CardContent className={`text-center ${isMobile ? 'py-6' : 'py-8'}`}>
              <CheckCircle2 className={`text-green-500 mx-auto mb-4 ${isMobile ? 'w-10 h-10' : 'w-12 h-12'}`} />
              <h3 className={`font-semibold mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>No Decisions Required</h3>
              <p className="text-muted-foreground text-sm">
                This project workflow has been pre-configured with optimal settings. 
                You can add custom work in the other tabs if needed.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
};