import React from 'react';
import { UserDataManagement } from './UserDataManagement';
import { PasswordSecurityManager } from './PasswordSecurityManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DataPrivacyManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DataPrivacyManager: React.FC<DataPrivacyManagerProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Privacy & Data Management</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="security" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="security">Password & Security</TabsTrigger>
            <TabsTrigger value="privacy">Privacy Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="security" className="mt-6">
            <PasswordSecurityManager />
          </TabsContent>
          
          <TabsContent value="privacy" className="mt-6">
            <UserDataManagement />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};