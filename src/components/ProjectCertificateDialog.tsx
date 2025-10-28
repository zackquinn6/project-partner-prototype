import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProjectCertificate } from './ProjectCertificate';

interface ProjectCertificateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectRun: any;
}

export function ProjectCertificateDialog({ 
  open, 
  onOpenChange, 
  projectRun 
}: ProjectCertificateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>🎉 Project Completion Certificate</DialogTitle>
        </DialogHeader>
        <ProjectCertificate 
          projectRun={projectRun} 
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
