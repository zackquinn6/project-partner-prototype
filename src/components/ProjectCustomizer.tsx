import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DecisionTreeFlowchart } from './DecisionTreeFlowchart';
import { DecisionRollupWindow } from './DecisionRollupWindow';
import { ProjectRun } from '../interfaces/ProjectRun';
import { Project } from '../interfaces/Project';
import { Settings, GitBranch } from 'lucide-react';

interface ProjectCustomizerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentProjectRun: ProjectRun;
  activeProject: Project;
  mode: 'initial-plan' | 'final-plan' | 'unplanned-work';
  onUpdateProjectRun: (updatedProjectRun: ProjectRun) => void;
}

export const ProjectCustomizer: React.FC<ProjectCustomizerProps> = ({
  open,
  onOpenChange,
  currentProjectRun,
  activeProject,
  mode,
  onUpdateProjectRun
}) => {
  const [activeTab, setActiveTab] = useState('decisions');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Project Customizer</DialogTitle>
          <DialogDescription>
            Review decisions and customize your workflow by defining decision points and alternate paths
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mx-6 w-fit">
            <TabsTrigger value="decisions" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Review Decisions
            </TabsTrigger>
            <TabsTrigger value="workflow" className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Decision Tree
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="decisions" className="flex-1 overflow-hidden mt-0">
            <DecisionRollupWindow
              open={true}
              onOpenChange={() => onOpenChange(false)}
              phases={activeProject.phases || []}
              onPhasesUpdate={(updatedPhases) => {
                onUpdateProjectRun({
                  ...currentProjectRun,
                  phases: updatedPhases,
                  updatedAt: new Date()
                });
              }}
              mode={mode}
              title="Review Project Decisions"
            />
          </TabsContent>
          
          <TabsContent value="workflow" className="flex-1 overflow-hidden mt-0">
            <DecisionTreeFlowchart
              phases={activeProject.phases || []}
              onBack={() => onOpenChange(false)}
              onUpdatePhases={(updatedPhases) => {
                onUpdateProjectRun({
                  ...currentProjectRun,
                  phases: updatedPhases,
                  updatedAt: new Date()
                });
              }}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};