import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Home, FolderOpen, ChevronDown, Settings } from "lucide-react";
import { useProject } from '@/contexts/ProjectContext';

interface NavigationProps {
  currentView: 'home' | 'admin' | 'user';
  onViewChange: (view: 'home' | 'admin' | 'user') => void;
  onAdminAccess: () => void;
}
export default function Navigation({
  currentView,
  onViewChange,
  onAdminAccess
}: NavigationProps) {
  const { projects, currentProject, setCurrentProject } = useProject();
  const openProjects = projects.filter(p => p.status === 'open' || p.status === 'in-progress');
  return <nav className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/lovable-uploads/4abd91fc-1cee-4a05-927d-e023723f8317.png" alt="Project Partner Logo" className="h-10 w-auto" />
            
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant={currentView === 'home' ? 'default' : 'ghost'} onClick={() => onViewChange('home')} className="transition-fast">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button variant={currentView === 'user' ? 'default' : 'ghost'} onClick={() => onViewChange('user')} className="transition-fast">
              <FolderOpen className="w-4 h-4 mr-2" />
              My Projects
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="transition-fast">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  My Current Project
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card border shadow-lg">
                {openProjects.length > 0 ? (
                  openProjects.map((project) => (
                    <DropdownMenuItem 
                      key={project.id} 
                      onClick={() => setCurrentProject(project)}
                      className={`cursor-pointer ${currentProject?.id === project.id ? 'bg-primary/10 text-primary' : ''}`}
                    >
                      {project.name}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>
                    No open projects
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="ghost" size="icon" onClick={onAdminAccess} className="transition-fast">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>;
}