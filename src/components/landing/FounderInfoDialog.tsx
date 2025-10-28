import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import founderPhoto from '@/assets/zack-quinn-founder.png';

interface FounderInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FounderInfoDialog = ({ open, onOpenChange }: FounderInfoDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>About Project Partner</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <p className="text-lg text-muted-foreground leading-relaxed">
            I built this app so people can finish real projects without spending years learning DIY. 
            I combined modern adult‑learning methods with best practices I learned in healthcare and 
            aerospace to guide you to plan, execute, and close projects on time with professional results.
          </p>
          
          <div className="space-y-3">
            <img 
              src={founderPhoto} 
              alt="Zack Quinn, Co-Founder of Toolio" 
              className="w-full rounded-lg shadow-lg"
            />
            <p className="text-sm text-muted-foreground italic text-center">
              Zack Quinn, Co-Founder of Toolio and creator of Project Partner
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
