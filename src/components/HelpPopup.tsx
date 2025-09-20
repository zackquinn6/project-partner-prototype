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
            
            <div className="w-full space-y-4">
              <div className="bg-muted p-6 rounded-lg text-center">
                <h3 className="font-semibold mb-2">Book Your Expert Consultation</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get personalized help from DIY experts via video call
                </p>
                <a 
                  href="https://app.acuityscheduling.com/schedule.php?owner=36845722" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  Schedule Appointment
                </a>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};