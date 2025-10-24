import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, Plus, Settings2, Trash2 } from 'lucide-react';
import { Phase, Operation } from '@/interfaces/Project';
import { toast } from 'sonner';

interface AdminWorkflowEditorProps {
  phases: Phase[];
  onBack: () => void;
  onSave: (phases: Phase[]) => void;
}

const FLOW_TYPES = [
  { value: 'prime', label: 'Prime (Main Path)', color: 'bg-blue-500' },
  { value: 'alternate', label: 'Alternate', color: 'bg-orange-500' },
  { value: 'if-necessary', label: 'If Necessary', color: 'bg-gray-500' },
  { value: 'inspection', label: 'Inspection', color: 'bg-purple-500' },
  { value: 'repeat', label: 'Repeat', color: 'bg-green-500' }
] as const;

export const AdminWorkflowEditor: React.FC<AdminWorkflowEditorProps> = ({
  phases,
  onBack,
  onSave
}) => {
  const [editingPhases, setEditingPhases] = useState<Phase[]>(phases);
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [editingOperation, setEditingOperation] = useState<{ phaseId: string; operationId: string } | null>(null);
  const [detailLevel, setDetailLevel] = useState<'quick' | 'detailed' | 'contractor'>('detailed');

  const updateOperationFlowType = (phaseId: string, operationId: string, flowType: string) => {
    setEditingPhases(prev => prev.map(phase => {
      if (phase.id !== phaseId) return phase;
      
      return {
        ...phase,
        operations: phase.operations.map(op => {
          if (op.id !== operationId) return op;
          
          return {
            ...op,
            steps: op.steps.map(step => ({
              ...step,
              flowType: flowType as any
            }))
          };
        })
      };
    }));
  };

  const updateOperationPrompt = (phaseId: string, operationId: string, prompt: string) => {
    setEditingPhases(prev => prev.map(phase => {
      if (phase.id !== phaseId) return phase;
      
      return {
        ...phase,
        operations: phase.operations.map(op => {
          if (op.id !== operationId) return op;
          
          return {
            ...op,
            userPrompt: prompt
          };
        })
      };
    }));
  };

  const handleSave = () => {
    onSave(editingPhases);
    toast.success('Workflow structure saved successfully');
  };

  const getOperationFlowType = (operation: Operation): string => {
    // Get flow type from first step (they should all be the same for an operation)
    return operation.steps[0]?.flowType || 'prime';
  };

  const getFlowTypeColor = (flowType: string) => {
    return FLOW_TYPES.find(ft => ft.value === flowType)?.color || 'bg-gray-300';
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h2 className="text-2xl font-bold">Workflow Structure Editor</h2>
              <p className="text-muted-foreground">Configure operation types and decision prompts</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Step Content Detail:</Label>
              <Select value={detailLevel} onValueChange={(value: any) => setDetailLevel(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quick">Quick</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="contractor">Contractor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="border-b bg-muted/30 p-4">
        <div className="flex items-center gap-4 flex-wrap text-sm">
          {FLOW_TYPES.map(type => (
            <div key={type.value} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${type.color}`}></div>
              <span>{type.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {editingPhases.map(phase => (
            <Card key={phase.id}>
              <CardHeader className="cursor-pointer" onClick={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}>
                <CardTitle className="flex items-center justify-between">
                  <span>{phase.name}</span>
                  <Badge variant="outline">{phase.operations.length} operations</Badge>
                </CardTitle>
              </CardHeader>
              
              {expandedPhase === phase.id && (
                <CardContent className="space-y-4">
                  {phase.operations.map(operation => {
                    const flowType = getOperationFlowType(operation);
                    const isEditing = editingOperation?.phaseId === phase.id && editingOperation?.operationId === operation.id;
                    
                    return (
                      <Card key={operation.id} className={`border-l-4 border-l-${getFlowTypeColor(flowType).replace('bg-', '')}`}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold">{operation.name}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{operation.description}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingOperation(isEditing ? null : { phaseId: phase.id, operationId: operation.id })}
                            >
                              <Settings2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        
                        {isEditing && (
                          <CardContent className="space-y-4 pt-0">
                            <div className="space-y-2">
                              <Label>Operation Type</Label>
                              <Select
                                value={flowType}
                                onValueChange={(value) => updateOperationFlowType(phase.id, operation.id, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {FLOW_TYPES.map(type => (
                                    <SelectItem key={type.value} value={type.value}>
                                      <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded ${type.color}`}></div>
                                        {type.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {(flowType === 'alternate' || flowType === 'if-necessary') && (
                              <div className="space-y-2">
                                <Label>User Decision Prompt</Label>
                                <Textarea
                                  placeholder={
                                    flowType === 'alternate' 
                                      ? "e.g., Is your subfloor concrete or wood?"
                                      : "e.g., Do you have a toilet in the installation area?"
                                  }
                                  value={(operation as any).userPrompt || ''}
                                  onChange={(e) => updateOperationPrompt(phase.id, operation.id, e.target.value)}
                                  rows={2}
                                />
                                <p className="text-xs text-muted-foreground">
                                  This question will help users decide whether this operation is needed
                                </p>
                              </div>
                            )}

                            <div className="space-y-3 pt-3 border-t">
                              <div>
                                <Label className="text-sm font-semibold">
                                  Step Content - {detailLevel.charAt(0).toUpperCase() + detailLevel.slice(1)} Level
                                </Label>
                                <p className="text-xs text-muted-foreground mb-3">
                                  Viewing {detailLevel} level instructions. Change detail level at the top to view other levels.
                                </p>
                              </div>
                              
                              {operation.steps.map((step, stepIndex) => (
                                <Card key={step.id} className="p-3 bg-muted/50">
                                  <div className="space-y-2">
                                    <div className="font-medium text-sm">
                                      Step {stepIndex + 1}: {step.step}
                                    </div>
                                    <Alert className="py-2">
                                      <AlertDescription className="text-xs">
                                        <strong>{detailLevel.charAt(0).toUpperCase() + detailLevel.slice(1)}</strong> level instructions 
                                        are stored in the <strong>step_instructions</strong> table with instruction_level='{detailLevel}'. 
                                        Use the Step Content Editor or database to manage content for this level.
                                      </AlertDescription>
                                    </Alert>
                                  </div>
                                </Card>
                              ))}
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t">
                              <Badge className={getFlowTypeColor(flowType)}>
                                {FLOW_TYPES.find(ft => ft.value === flowType)?.label}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {operation.steps.length} steps
                              </span>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
