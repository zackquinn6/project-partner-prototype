import React from 'react';
import ProjectAnalytics from '@/components/ProjectAnalytics';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ProjectAnalyticsWindowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProjectAnalyticsWindow: React.FC<ProjectAnalyticsWindowProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Project Analytics</DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <ProjectAnalytics />
        </div>
      </DialogContent>
    </Dialog>
  );
};