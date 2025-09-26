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
import { AlertTriangle, Plus, Trash2, Save } from 'lucide-react';

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
  };

  const addOperation = () => {
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
  };

  const removeOperation = (index: number) => {
    if (operations.length > 1) {
      setOperations(prev => prev.filter((_, i) => i !== index));
    }
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
      <DialogContent className="max-w-4xl h-[85vh] p-0 [&>button]:hidden">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Create Custom Unplanned Work
              </DialogTitle>
              <DialogDescription className="mt-2">
                Design a custom phase for work not covered by standard templates.
              </DialogDescription>
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {/* Warning */}
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Important:</strong> Custom unplanned work may affect your project success guarantee. 
                Ensure all safety requirements and building codes are researched before creating custom work.
              </AlertDescription>
            </Alert>

            {/* Phase Details */}
            <Card>
              <CardHeader>
                <CardTitle>Phase Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="phase-name">Phase Name *</Label>
                  <Input
                    id="phase-name"
                    value={phaseName}
                    onChange={(e) => setPhaseName(e.target.value)}
                    placeholder="Enter phase name (e.g., 'Custom Accent Wall Installation')"
                  />
                </div>
                <div>
                  <Label htmlFor="phase-description">Phase Description</Label>
                  <Textarea
                    id="phase-description"
                    value={phaseDescription}
                    onChange={(e) => setPhaseDescription(e.target.value)}
                    placeholder="Describe what this phase accomplishes and any special considerations..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Operations */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Operations</CardTitle>
                  <Button onClick={addOperation} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Operation
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {operations.map((operation, opIndex) => (
                  <div key={opIndex} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Operation {opIndex + 1}</h4>
                      {operations.length > 1 && (
                        <Button 
                          onClick={() => removeOperation(opIndex)}
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Operation Name *</Label>
                        <Input
                          value={operation.name}
                          onChange={(e) => updateOperation(opIndex, 'name', e.target.value)}
                          placeholder="e.g., 'Install Feature Lighting'"
                        />
                      </div>
                      <div>
                        <Label>Estimated Time</Label>
                        <Input
                          value={operation.estimatedTime}
                          onChange={(e) => updateOperation(opIndex, 'estimatedTime', e.target.value)}
                          placeholder="e.g., '2-3 hours'"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Operation Description</Label>
                      <Textarea
                        value={operation.description}
                        onChange={(e) => updateOperation(opIndex, 'description', e.target.value)}
                        placeholder="Describe this operation in detail..."
                        rows={2}
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

                      {operation.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="bg-muted/50 rounded p-3 mb-3 space-y-3">
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
                            <Label className="text-xs">Step Name *</Label>
                            <Input
                              value={step.step}
                              onChange={(e) => updateStep(opIndex, stepIndex, 'step', e.target.value)}
                              placeholder="e.g., 'Mount electrical box'"
                              className="text-sm"
                            />
                          </div>

                          <div>
                            <Label className="text-xs">Step Description</Label>
                            <Input
                              value={step.description}
                              onChange={(e) => updateStep(opIndex, stepIndex, 'description', e.target.value)}
                              placeholder="Brief description of what this step accomplishes"
                              className="text-sm"
                            />
                          </div>

                          <div>
                            <Label className="text-xs">Detailed Instructions</Label>
                            <Textarea
                              value={step.content}
                              onChange={(e) => updateStep(opIndex, stepIndex, 'content', e.target.value)}
                              placeholder="Detailed step-by-step instructions, safety considerations, and tips..."
                              rows={3}
                              className="text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* Action Bar */}
        <div className="border-t p-6">
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={resetForm}>
              Clear Form
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreatePhase}
                disabled={!isFormValid()}
                className="flex items-center gap-2"
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