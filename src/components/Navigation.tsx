import { Button } from "@/components/ui/button";
import { Settings, Users, Workflow } from "lucide-react";

interface NavigationProps {
  currentView: 'home' | 'admin' | 'user';
  onViewChange: (view: 'home' | 'admin' | 'user') => void;
}

export default function Navigation({ currentView, onViewChange }: NavigationProps) {
  return (
    <nav className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Workflow className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Project Partner
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={currentView === 'home' ? 'default' : 'ghost'}
              onClick={() => onViewChange('home')}
              className="transition-fast"
            >
              <Workflow className="w-4 h-4 mr-2" />
              Overview
            </Button>
            <Button
              variant={currentView === 'admin' ? 'default' : 'ghost'}
              onClick={() => onViewChange('admin')}
              className="transition-fast"
            >
              <Settings className="w-4 h-4 mr-2" />
              Admin
            </Button>
            <Button
              variant={currentView === 'user' ? 'default' : 'ghost'}
              onClick={() => onViewChange('user')}
              className="transition-fast"
            >
              <Users className="w-4 h-4 mr-2" />
              User
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}