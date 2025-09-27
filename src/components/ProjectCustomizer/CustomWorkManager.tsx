import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { ScrollArea } from '../ui/scroll-area';
import { Phase, Operation, WorkflowStep } from '../../interfaces/Project';
import { AlertTriangle, Plus, Trash2, Save, X, ChevronDown, ChevronRight } from 'lucide-react';
import { useIsMobile } from '../../hooks/use-mobile';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

interface CustomWorkManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCustomWork: (phase: Phase) => void;
}

interface CustomOperation {
  name: string;
  description: string;
  estimatedTime: string;
  steps: CustomStep[];
}

interface CustomStep {
  step: string;
  description: string;
  content: string;
}

export const CustomWorkManager: React.FC<CustomWorkManagerProps> = ({
  open,
  onOpenChange,
  onCreateCustomWork
}) => {
  const [phaseName, setPhaseName] = useState('');
  const [phaseDescription, setPhaseDescription] = useState('');
  const [operations, setOperations] = useState<CustomOperation[]>([
    {
      name: '',
      description: '',
      estimatedTime: '',
      steps: [{
        step: '',
        description: '',
        content: ''
      }]
    }
  ]);
  const [expandedOperations, setExpandedOperations] = useState<Set<number>>(new Set([0]));
  const isMobile = useIsMobile();

  const resetForm = () => {
    setPhaseName('');
    setPhaseDescription('');
    setOperations([{
      name: '',
      description: '',
      estimatedTime: '',
      steps: [{
        step: '',
        description: '',
        content: ''
      }]
    }]);
    setExpandedOperations(new Set([0]));
  };

  const addOperation = () => {
    const newIndex = operations.length;
    setOperations(prev => [...prev, {
      name: '',
      description: '',
      estimatedTime: '',
      steps: [{
        step: '',
        description: '',
        content: ''
      }]
    }]);
    setExpandedOperations(prev => new Set([...prev, newIndex]));
  };

  const removeOperation = (index: number) => {
    if (operations.length > 1) {
      setOperations(prev => prev.filter((_, i) => i !== index));
      setExpandedOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  const toggleOperation = (index: number) => {
    setExpandedOperations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const updateOperation = (index: number, field: keyof CustomOperation, value: any) => {
    setOperations(prev => prev.map((op, i) => 
      i === index ? { ...op, [field]: value } : op
    ));
  };

  const addStep = (operationIndex: number) => {
    setOperations(prev => prev.map((op, i) => 
      i === operationIndex 
        ? {
            ...op,
            steps: [...op.steps, { step: '', description: '', content: '' }]
          }
        : op
    ));
  };

  const removeStep = (operationIndex: number, stepIndex: number) => {
    setOperations(prev => prev.map((op, i) => 
      i === operationIndex 
        ? {
            ...op,
            steps: op.steps.filter((_, si) => si !== stepIndex)
          }
        : op
    ));
  };

  const updateStep = (operationIndex: number, stepIndex: number, field: keyof CustomStep, value: string) => {
    setOperations(prev => prev.map((op, i) => 
      i === operationIndex 
        ? {
            ...op,
            steps: op.steps.map((step, si) => 
              si === stepIndex ? { ...step, [field]: value } : step
            )
          }
        : op
    ));
  };

  const handleCreatePhase = () => {
    if (!phaseName.trim()) return;

    // Convert to Phase interface
    const customPhase: Phase = {
      id: `custom-unplanned-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: phaseName,
      description: phaseDescription,
      operations: operations.map((op, opIndex) => ({
        id: `op-${opIndex}`,
        name: op.name,
        description: op.description,
        estimatedTime: op.estimatedTime,
        steps: op.steps.map((step, stepIndex) => ({
          id: `step-${opIndex}-${stepIndex}`,
          step: step.step,
          description: step.description,
          contentType: 'text' as const,
          content: step.content,
          materials: [],
          tools: [],
          outputs: [],
          phaseName: phaseName,
          operationName: op.name
        }))
      }))
    };

    onCreateCustomWork(customPhase);
    resetForm();
    onOpenChange(false);
  };

  const isFormValid = () => {
    return phaseName.trim() && 
           operations.length > 0 && 
           operations.every(op => 
             op.name.trim() && 
             op.steps.length > 0 && 
             op.steps.every(step => step.step.trim())
           );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isMobile 
        ? "w-full h-full max-w-full max-h-full rounded-none border-0 p-0 [&>button]:hidden" 
        : "max-w-4xl h-[85vh] p-0 [&>button]:hidden"
      }>
        <DialogHeader className={`${isMobile ? 'p-4 pb-3' : 'p-6 pb-4'} border-b`}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className={`flex items-center gap-2 ${isMobile ? 'text-base' : ''}`}>
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Create Custom Unplanned Work
              </DialogTitle>
              <DialogDescription className={`mt-2 ${isMobile ? 'text-sm' : ''}`}>
                Design a custom phase for work not covered by standard templates.
              </DialogDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="ml-2">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className={`flex-1 ${isMobile ? 'p-4' : 'p-6'}`}>
          <div className="space-y-6">
            {/* Warning */}
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800 text-sm">
                <strong>Important:</strong> Custom unplanned work may affect your project success guarantee. 
                Ensure all safety requirements and building codes are researched before creating custom work.
              </AlertDescription>
            </Alert>

            {/* Phase Details */}
            <Card>
              <CardHeader className={isMobile ? 'pb-3' : ''}>
                <CardTitle className={isMobile ? 'text-base' : ''}>Phase Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="phase-name" className="text-sm font-medium">Phase Name *</Label>
                  <Input
                    id="phase-name"
                    value={phaseName}
                    onChange={(e) => setPhaseName(e.target.value)}
                    placeholder="Enter phase name (e.g., 'Custom Accent Wall Installation')"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phase-description" className="text-sm font-medium">Phase Description</Label>
                  <Textarea
                    id="phase-description"
                    value={phaseDescription}
                    onChange={(e) => setPhaseDescription(e.target.value)}
                    placeholder="Describe what this phase accomplishes and any special considerations..."
                    rows={isMobile ? 2 : 3}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Operations */}
            <Card>
              <CardHeader className={isMobile ? 'pb-3' : ''}>
                <div className="flex items-center justify-between">
                  <CardTitle className={isMobile ? 'text-base' : ''}>Operations</CardTitle>
                  <Button onClick={addOperation} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Operation
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {operations.map((operation, opIndex) => (
                  <Card key={opIndex}>
                    <Collapsible 
                      open={expandedOperations.has(opIndex)} 
                      onOpenChange={() => toggleOperation(opIndex)}
                    >
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/5 transition-colors pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {expandedOperations.has(opIndex) ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                              <h4 className={`font-medium ${isMobile ? 'text-sm' : ''}`}>
                                Operation {opIndex + 1} {operation.name && `- ${operation.name}`}
                              </h4>
                            </div>
                            {operations.length > 1 && (
                              <Button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeOperation(opIndex);
                                }}
                                variant="ghost" 
                                size="sm"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <CardContent className="space-y-4 pt-0">
                          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                            <div>
                              <Label className="text-sm font-medium">Operation Name *</Label>
                              <Input
                                value={operation.name}
                                onChange={(e) => updateOperation(opIndex, 'name', e.target.value)}
                                placeholder="e.g., 'Install Feature Lighting'"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Estimated Time</Label>
                              <Input
                                value={operation.estimatedTime}
                                onChange={(e) => updateOperation(opIndex, 'estimatedTime', e.target.value)}
                                placeholder="e.g., '2-3 hours'"
                                className="mt-1"
                              />
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium">Operation Description</Label>
                            <Textarea
                              value={operation.description}
                              onChange={(e) => updateOperation(opIndex, 'description', e.target.value)}
                              placeholder="Describe this operation in detail..."
                              rows={2}
                              className="mt-1"
                            />
                          </div>

                          {/* Steps */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <Label className="text-sm font-medium">Steps</Label>
                              <Button 
                                onClick={() => addStep(opIndex)}
                                variant="outline" 
                                size="sm"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add Step
                              </Button>
                            </div>

                            <div className="space-y-3">
                              {operation.steps.map((step, stepIndex) => (
                                <Card key={stepIndex} className="bg-muted/30 border">
                                  <CardContent className={`space-y-3 ${isMobile ? 'p-3' : 'p-4'}`}>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium">Step {stepIndex + 1}</span>
                                      {operation.steps.length > 1 && (
                                        <Button 
                                          onClick={() => removeStep(opIndex, stepIndex)}
                                          variant="ghost" 
                                          size="sm"
                                          className="text-destructive hover:text-destructive"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      )}
                                    </div>

                                    <div>
                                      <Label className="text-xs font-medium">Step Name *</Label>
                                      <Input
                                        value={step.step}
                                        onChange={(e) => updateStep(opIndex, stepIndex, 'step', e.target.value)}
                                        placeholder="e.g., 'Mount electrical box'"
                                        className="text-sm mt-1"
                                      />
                                    </div>

                                    <div>
                                      <Label className="text-xs font-medium">Step Description</Label>
                                      <Input
                                        value={step.description}
                                        onChange={(e) => updateStep(opIndex, stepIndex, 'description', e.target.value)}
                                        placeholder="Brief description of what this step accomplishes"
                                        className="text-sm mt-1"
                                      />
                                    </div>

                                    <div>
                                      <Label className="text-xs font-medium">Detailed Instructions</Label>
                                      <Textarea
                                        value={step.content}
                                        onChange={(e) => updateStep(opIndex, stepIndex, 'content', e.target.value)}
                                        placeholder="Detailed step-by-step instructions, safety considerations, and tips..."
                                        rows={isMobile ? 2 : 3}
                                        className="text-sm mt-1"
                                      />
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* Action Bar */}
        <div className={`border-t ${isMobile ? 'p-4' : 'p-6'}`}>
          <div className={`flex ${isMobile ? 'flex-col-reverse' : 'justify-between items-center'} gap-3`}>
            <Button 
              variant="outline" 
              onClick={resetForm}
              className={isMobile ? 'w-full' : ''}
            >
              Clear Form
            </Button>
            <div className={`flex gap-3 ${isMobile ? 'w-full' : ''}`}>
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className={isMobile ? 'flex-1' : ''}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreatePhase}
                disabled={!isFormValid()}
                className={`flex items-center gap-2 ${isMobile ? 'flex-1' : ''}`}
              >
                <Save className="w-4 h-4" />
                Create Custom Phase
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};