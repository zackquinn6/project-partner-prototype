import React from 'react';
import { UserRoleManager } from '@/components/UserRoleManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface UserRolesWindowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserRolesWindow: React.FC<UserRolesWindowProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Role Management</DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <UserRoleManager />
        </div>
      </DialogContent>
    </Dialog>
  );
};