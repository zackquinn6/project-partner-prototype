import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserDataManagement } from './UserDataManagement';

interface PrivacySettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full h-screen max-w-full max-h-full md:max-w-[90vw] md:h-[90vh] md:rounded-lg p-0 overflow-hidden flex flex-col [&>button]:hidden">
        <div className="flex flex-col h-full">
          <div className="px-4 md:px-6 py-4 border-b flex items-center justify-between flex-shrink-0">
            <h2 className="text-lg md:text-xl font-bold">Privacy Settings</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onOpenChange(false)} 
              className="ml-4 flex-shrink-0"
            >
              Close
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <UserDataManagement />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};