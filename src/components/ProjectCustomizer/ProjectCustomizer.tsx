import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { WorkflowDecisionEngine } from './WorkflowDecisionEngine';
import { CustomWorkManager } from './CustomWorkManager';
import { PhaseBrowser } from './PhaseBrowser';
import { ProjectRun } from '../../interfaces/ProjectRun';
import { Project, Phase } from '../../interfaces/Project';
import { useProject } from '../../contexts/ProjectContext';
import { Settings, GitBranch, Plus, Clock, AlertTriangle } from 'lucide-react';

interface ProjectCustomizerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentProjectRun?: ProjectRun;
  mode?: 'initial-plan' | 'final-plan' | 'unplanned-work' | 'replan';
}

interface CustomizationState {
  standardDecisions: Record<string, string[]>; // phaseId -> selected alternatives
  ifNecessaryWork: Record<string, string[]>; // phaseId -> selected optional work
  customPlannedWork: Phase[]; // phases added from other projects
  customUnplannedWork: Phase[]; // novel phases created by user
  workflowOrder: string[]; // ordered phase ids
}

export const ProjectCustomizer: React.FC<ProjectCustomizerProps> = ({
  open,
  onOpenChange,
  currentProjectRun,
  mode = 'initial-plan'
}) => {
  const { projects, updateProjectRun } = useProject();
  const [activeTab, setActiveTab] = useState('decisions');
  const [customizationState, setCustomizationState] = useState<CustomizationState>({
    standardDecisions: {},
    ifNecessaryWork: {},
    customPlannedWork: [],
    customUnplannedWork: [],
    workflowOrder: []
  });

  const [showPhaseBrowser, setShowPhaseBrowser] = useState(false);
  const [showCustomWorkManager, setShowCustomWorkManager] = useState(false);

  // Initialize workflow order from current project run
  useEffect(() => {
    if (currentProjectRun?.phases && open) {
      const phaseIds = currentProjectRun.phases.map(p => p.id);
      setCustomizationState(prev => ({
        ...prev,
        workflowOrder: phaseIds
      }));
    }
  }, [currentProjectRun, open]);

  const handleStandardDecision = (phaseId: string, alternatives: string[]) => {
    setCustomizationState(prev => ({
      ...prev,
      standardDecisions: {
        ...prev.standardDecisions,
        [phaseId]: alternatives
      }
    }));
  };

  const handleIfNecessaryWork = (phaseId: string, optionalWork: string[]) => {
    setCustomizationState(prev => ({
      ...prev,
      ifNecessaryWork: {
        ...prev.ifNecessaryWork,
        [phaseId]: optionalWork
      }
    }));
  };

  const handleAddCustomPlannedWork = (phases: Phase[], insertAfterPhaseId?: string) => {
    setCustomizationState(prev => {
      const newCustomPlanned = [...prev.customPlannedWork, ...phases];
      let newWorkflowOrder = [...prev.workflowOrder];
      
      if (insertAfterPhaseId) {
        const insertIndex = newWorkflowOrder.findIndex(id => id === insertAfterPhaseId) + 1;
        const newPhaseIds = phases.map(p => p.id);
        newWorkflowOrder.splice(insertIndex, 0, ...newPhaseIds);
      } else {
        // Insert before close phase
        const closePhaseIndex = newWorkflowOrder.findIndex(id => 
          currentProjectRun?.phases?.find(p => p.id === id)?.name.toLowerCase().includes('close')
        );
        if (closePhaseIndex !== -1) {
          newWorkflowOrder.splice(closePhaseIndex, 0, ...phases.map(p => p.id));
        } else {
          newWorkflowOrder.push(...phases.map(p => p.id));
        }
      }

      return {
        ...prev,
        customPlannedWork: newCustomPlanned,
        workflowOrder: newWorkflowOrder
      };
    });
  };

  const handleAddCustomUnplannedWork = (phase: Phase, insertAfterPhaseId?: string) => {
    setCustomizationState(prev => {
      const newCustomUnplanned = [...prev.customUnplannedWork, phase];
      let newWorkflowOrder = [...prev.workflowOrder];
      
      if (insertAfterPhaseId) {
        const insertIndex = newWorkflowOrder.findIndex(id => id === insertAfterPhaseId) + 1;
        newWorkflowOrder.splice(insertIndex, 0, phase.id);
      } else {
        newWorkflowOrder.push(phase.id);
      }

      return {
        ...prev,
        customUnplannedWork: newCustomUnplanned,
        workflowOrder: newWorkflowOrder
      };
    });
  };

  const handleReorderPhases = (newOrder: string[]) => {
    setCustomizationState(prev => ({
      ...prev,
      workflowOrder: newOrder
    }));
  };

  const handleSaveCustomization = async () => {
    if (!currentProjectRun) return;

    try {
      // Build the new phases array based on customization
      let newPhases = [...(currentProjectRun.phases || [])];
      
      // Apply standard decisions and if-necessary work modifications
      newPhases = newPhases.map(phase => {
        const standardChoices = customizationState.standardDecisions[phase.id] || [];
        const ifNecessaryChoices = customizationState.ifNecessaryWork[phase.id] || [];
        
        // Modify phase operations based on decisions
        let modifiedOperations = [...phase.operations];
        
        // Filter operations based on standard decisions
        if (standardChoices.length > 0) {
          modifiedOperations = modifiedOperations.filter(op => 
            standardChoices.some(choice => op.name.toLowerCase().includes(choice.toLowerCase()))
          );
        }
        
        // Add if-necessary operations
        // This would need more complex logic based on your operation structure
        
        return {
          ...phase,
          operations: modifiedOperations
        };
      });

      // Add custom planned work phases
      customizationState.customPlannedWork.forEach(phase => {
        if (!newPhases.find(p => p.id === phase.id)) {
          newPhases.push(phase);
        }
      });

      // Add custom unplanned work phases  
      customizationState.customUnplannedWork.forEach(phase => {
        if (!newPhases.find(p => p.id === phase.id)) {
          newPhases.push(phase);
        }
      });

      // Reorder phases based on workflow order
      const orderedPhases = customizationState.workflowOrder
        .map(id => newPhases.find(p => p.id === id))
        .filter(Boolean) as Phase[];

      // Add any phases not in the order at the end
      newPhases.forEach(phase => {
        if (!orderedPhases.find(p => p.id === phase.id)) {
          orderedPhases.push(phase);
        }
      });

      // Update the project run
      const updatedProjectRun = {
        ...currentProjectRun,
        phases: orderedPhases,
        updatedAt: new Date()
      };

      await updateProjectRun(updatedProjectRun);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving customization:', error);
    }
  };

  const getModeTitle = () => {
    switch (mode) {
      case 'initial-plan': return 'Project Work Scope';
      case 'final-plan': return 'Finalize Project Plan';
      case 'unplanned-work': return 'Add New Work';
      case 'replan': return 'Re-plan Project';
      default: return 'Project Customizer';
    }
  };

  const getModeDescription = () => {
    switch (mode) {
      case 'initial-plan': return 'Define your project scope and customize the workflow to match your specific needs.';
      case 'final-plan': return 'Review and finalize all project decisions before starting execution.';
      case 'unplanned-work': return 'Add new work that wasn\'t in the original plan.';
      case 'replan': return 'Modify your project plan and add or remove work as needed.';
      default: return 'Customize your project workflow with decision points and additional work.';
    }
  };

  if (!currentProjectRun) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl h-[90vh] p-0 z-[60] [&>button]:hidden">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  {getModeTitle()}
                </DialogTitle>
                <DialogDescription className="mt-2">
                  {getModeDescription()}
                </DialogDescription>
              </div>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="mx-6 w-fit">
              <TabsTrigger value="decisions" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Standard Decisions
              </TabsTrigger>
              <TabsTrigger value="planned-work" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Planned Work
              </TabsTrigger>
              <TabsTrigger value="unplanned-work" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Add Unplanned Work
              </TabsTrigger>
              <TabsTrigger value="workflow" className="flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                Review Workflow
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="decisions" className="flex-1 overflow-hidden mt-0">
              <WorkflowDecisionEngine
                projectRun={currentProjectRun}
                onStandardDecision={handleStandardDecision}
                onIfNecessaryWork={handleIfNecessaryWork}
                customizationState={customizationState}
              />
            </TabsContent>
            
            <TabsContent value="planned-work" className="flex-1 overflow-hidden mt-0">
              <div className="p-6 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Add Conventional Work</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Add phases from other related projects that make sense for your workflow.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => setShowPhaseBrowser(true)}>
                      Browse Available Phases
                    </Button>
                  </CardContent>
                </Card>

                {customizationState.customPlannedWork.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Added Planned Work</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-40">
                        {customizationState.customPlannedWork.map((phase, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded mb-2">
                            <div>
                              <span className="font-medium">{phase.name}</span>
                              <p className="text-sm text-muted-foreground">{phase.description}</p>
                            </div>
                            <Badge variant="secondary">Planned</Badge>
                          </div>
                        ))}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="unplanned-work" className="flex-1 overflow-hidden mt-0">
              <div className="p-6 space-y-4">
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="text-orange-800 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Unplanned Work Warning
                    </CardTitle>
                    <p className="text-sm text-orange-700">
                      Adding unplanned work may affect your project success guarantee. 
                      Custom work should be well-researched and tested.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="outline" 
                      className="border-orange-300 hover:bg-orange-100"
                      onClick={() => setShowCustomWorkManager(true)}
                    >
                      Create Custom Work
                    </Button>
                  </CardContent>
                </Card>

                {customizationState.customUnplannedWork.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Added Unplanned Work</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-40">
                        {customizationState.customUnplannedWork.map((phase, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded mb-2">
                            <div>
                              <span className="font-medium">{phase.name}</span>
                              <p className="text-sm text-muted-foreground">{phase.description}</p>
                            </div>
                            <Badge variant="destructive">Unplanned</Badge>
                          </div>
                        ))}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="workflow" className="flex-1 overflow-hidden mt-0">
              <div className="p-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Final Workflow Order</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Review the complete customized workflow. Phases will be executed in this order.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-60">
                      {customizationState.workflowOrder.map((phaseId, index) => {
                        const phase = [
                          ...(currentProjectRun.phases || []),
                          ...customizationState.customPlannedWork,
                          ...customizationState.customUnplannedWork
                        ].find(p => p.id === phaseId);

                        if (!phase) return null;

                        return (
                          <div key={phaseId} className="flex items-center gap-3 p-3 border rounded mb-2">
                            <Badge variant="outline">{index + 1}</Badge>
                            <div className="flex-1">
                              <span className="font-medium">{phase.name}</span>
                              <p className="text-sm text-muted-foreground">{phase.description}</p>
                            </div>
                            {customizationState.customPlannedWork.find(p => p.id === phaseId) && (
                              <Badge variant="secondary">Planned</Badge>
                            )}
                            {customizationState.customUnplannedWork.find(p => p.id === phaseId) && (
                              <Badge variant="destructive">Unplanned</Badge>
                            )}
                          </div>
                        );
                      })}
                    </ScrollArea>
                  </CardContent>
                </Card>

                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveCustomization}>
                    Save Customization
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <PhaseBrowser
        open={showPhaseBrowser}
        onOpenChange={setShowPhaseBrowser}
        availableProjects={projects}
        onSelectPhases={handleAddCustomPlannedWork}
        currentProjectId={currentProjectRun.templateId}
      />

      <CustomWorkManager
        open={showCustomWorkManager}
        onOpenChange={setShowCustomWorkManager}
        onCreateCustomWork={handleAddCustomUnplannedWork}
      />
    </>
  );
};