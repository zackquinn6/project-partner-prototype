import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { DecisionTreeManager } from './DecisionTree';
import { ProjectRun } from '../interfaces/ProjectRun';
import { Project } from '../interfaces/Project';

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
  return (
    <DecisionTreeManager
      open={open}
      onOpenChange={onOpenChange}
      phases={activeProject.phases || []}
      onPhasesUpdate={(updatedPhases) => {
        onUpdateProjectRun({
          ...currentProjectRun,
          phases: updatedPhases,
          updatedAt: new Date()
        });
      }}
      onCustomizationSave={(selections) => {
        // Store customization selections in project run
        onUpdateProjectRun({
          ...currentProjectRun,
          customization_decisions: {
            ...currentProjectRun.customization_decisions,
            alternateChoices: selections.alternateChoices as any,
            ifNecessaryChoices: selections.ifNecessaryChoices as any
          } as any,
          updatedAt: new Date()
        });
      }}
    />
  );
};