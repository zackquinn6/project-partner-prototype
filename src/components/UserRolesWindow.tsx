import React from 'react';
import { UserRoleManager } from '@/components/UserRoleManager';
import { ResponsiveDialog } from '@/components/ResponsiveDialog';

interface UserRolesWindowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserRolesWindow: React.FC<UserRolesWindowProps> = ({ open, onOpenChange }) => {
  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      size="modal-md"
      title="User Role Management"
    >
      <div className="overflow-y-auto">
        <UserRoleManager />
      </div>
    </ResponsiveDialog>
  );
};