import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, ArrowRight } from 'lucide-react';

interface SignInDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
}

export const SignInDialog = ({ isOpen, onClose, projectName }: SignInDialogProps) => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/auth?return=projects');
  };

  const handleSignUp = () => {
    navigate('/auth?mode=signup&return=projects');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Ready to Start Your Project?
          </DialogTitle>
          <DialogDescription className="text-center space-y-3 pt-2">
            <p className="text-base">
              You've selected <span className="font-semibold text-primary">{projectName}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Sign in to create your personalized project plan and start building with confidence.
            </p>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 pt-4">
          <Button 
            onClick={handleSignIn}
            className="w-full text-base"
            size="lg"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Sign In to Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          
          <Button 
            onClick={handleSignUp}
            variant="outline"
            className="w-full text-base"
            size="lg"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Create New Account
          </Button>
          
          <div className="text-center">
            <button
              onClick={onClose}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Continue browsing projects
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};