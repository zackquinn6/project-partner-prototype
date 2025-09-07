import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface HelpPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpPopup: React.FC<HelpPopupProps> = ({ isOpen, onClose }) => {

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <VisuallyHidden>
          <DialogTitle>Expert Virtual Consults</DialogTitle>
          <DialogDescription>Schedule a consultation with our experts</DialogDescription>
        </VisuallyHidden>
        
        <div className="relative">
          <div className="p-4">
            <h2 className="text-2xl font-bold text-center mb-2">Expert Virtual Consults</h2>
            <p className="text-muted-foreground text-center mb-6">
              Schedule a video consultation with our DIY experts
            </p>
            
            <div className="w-full">
              <iframe 
                src="https://app.acuityscheduling.com/schedule.php?owner=36845722&ref=embedded_csp" 
                title="Schedule Appointment" 
                width="100%" 
                height="800" 
                frameBorder="0" 
                allow="payment"
                className="rounded-lg border w-full"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};