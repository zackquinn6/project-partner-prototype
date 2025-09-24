import React from 'react';
import ProjectAnalytics from '@/components/ProjectAnalytics';
import { ResponsiveDialog } from '@/components/ResponsiveDialog';

interface ProjectAnalyticsWindowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProjectAnalyticsWindow: React.FC<ProjectAnalyticsWindowProps> = ({ open, onOpenChange }) => {
  return (
    <ResponsiveDialog 
      open={open} 
      onOpenChange={onOpenChange}
      size="content-large"
      title="Project Analytics"
    >
      <div className="grid grid-cols-1 gap-6 min-h-0 flex-1">
        <div className="overflow-y-auto">
          <ProjectAnalytics />
        </div>
      </div>
    </ResponsiveDialog>
  );
};