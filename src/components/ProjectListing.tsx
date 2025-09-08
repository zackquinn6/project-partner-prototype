import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Play, Trash2, Plus, User, Wrench, Home, Users, Zap, Folder, Calculator, HelpCircle, Hammer, BookOpen, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProject } from '@/contexts/ProjectContext';
import { Project } from '@/interfaces/Project';
import { ProjectRun } from '@/interfaces/ProjectRun';
import { ProjectSelector } from '@/components/ProjectSelector';
import ProfileManager from '@/components/ProfileManager';
import { ToolsMaterialsWindow } from '@/components/ToolsMaterialsWindow';
import { HomeManager } from '@/components/HomeManager';
import { useState } from "react";
import { CommunityPostsWindow } from '@/components/CommunityPostsWindow';

interface ProjectListingProps {
  onProjectSelect?: (project: Project | null | 'workflow') => void;
}

export default function ProjectListing({ onProjectSelect }: ProjectListingProps) {
  const { projectRuns, currentProjectRun, setCurrentProjectRun, deleteProjectRun } = useProject();
  const navigate = useNavigate();
  const [showProfileManager, setShowProfileManager] = useState(false);
  const [showToolsLibrary, setShowToolsLibrary] = useState(false);
  const [showHomeManager, setShowHomeManager] = useState(false);
  const [showCommunityPosts, setShowCommunityPosts] = useState(false);

  const calculateProgress = (projectRun: ProjectRun) => {
    return projectRun.progress || 0;
  };

  const getStatusColor = (status: ProjectRun['status']) => {
    switch (status) {
      case 'not-started':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'complete':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  const handleOpenProjectRun = (projectRun: ProjectRun) => {
    console.log("🎯 ProjectListing: Opening project run:", projectRun.id);
    setCurrentProjectRun(projectRun);
    // Clear any navigation state to ensure clean transition
    window.history.replaceState({}, document.title, window.location.pathname);
    // Signal to parent that we want to switch to workflow mode for this project run
    onProjectSelect?.('workflow' as any);
  };

  const handleDeleteProjectRun = (projectRunId: string) => {
    deleteProjectRun(projectRunId);
    // Ensure we don't auto-select another project run after deletion
    setCurrentProjectRun(null);
    // Clear projectRunId from URL if this was the current one
    if (currentProjectRun?.id === projectRunId) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    // Communicate to parent component that we want to stay in listing mode
    onProjectSelect?.(null as any);
  };

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      
      {/* DIY Dashboard */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">Your DIY Homepage</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Your DIY journey continues here. Pick up where you left off or start your next winning project.
        </p>
        
        {/* Stats */}
        <div className="flex justify-center gap-8 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">1</span>
            </div>
            <span className="text-muted-foreground">Active Projects</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <span className="text-muted-foreground font-bold text-sm">0</span>
            </div>
            <span className="text-muted-foreground">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">2</span>
            </div>
            <span className="text-muted-foreground">Hours Saved</span>
          </div>
        </div>
        
        {/* Apps Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-4xl mx-auto mb-8">
          <div className="flex flex-col items-center group cursor-pointer" onClick={() => onProjectSelect?.(null)}>
            <div className="w-16 h-16 bg-slate-700 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-lg">
              <Folder className="w-8 h-8 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-800">My Projects</span>
          </div>
          
          <div className="flex flex-col items-center group cursor-pointer" onClick={() => window.dispatchEvent(new CustomEvent('show-user-tools-materials'))}>
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-lg">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <span className="text-sm font-medium text-blue-800">Rapid Assessment</span>
          </div>
          
          <div className="flex flex-col items-center group cursor-pointer" onClick={() => setShowHomeManager(true)}>
            <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-lg">
              <Home className="w-8 h-8 text-white" />
            </div>
            <span className="text-sm font-medium text-green-800">My Home Maintenance</span>
          </div>
          
          <div className="flex flex-col items-center group cursor-pointer" onClick={() => setShowToolsLibrary(true)}>
            <div className="w-16 h-16 bg-slate-700 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-lg">
              <Wrench className="w-8 h-8 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-800">My Tool Library</span>
          </div>
          
          <div className="flex flex-col items-center group cursor-pointer" onClick={() => window.dispatchEvent(new CustomEvent('show-tools-materials'))}>
            <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-lg">
              <Hammer className="w-8 h-8 text-white" />
            </div>
            <span className="text-sm font-medium text-orange-800">Tool Rentals</span>
          </div>
          
          <div className="flex flex-col items-center group cursor-pointer" onClick={() => navigate('/projects')}>
            <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <span className="text-sm font-medium text-orange-800">New Project Catalog</span>
          </div>
          
          <div className="flex flex-col items-center group cursor-pointer" onClick={() => window.dispatchEvent(new CustomEvent('show-help-popup'))}>
            <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-lg">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <span className="text-sm font-medium text-green-800">Expert Help</span>
          </div>
          
          <div className="flex flex-col items-center group cursor-pointer" onClick={() => setShowProfileManager(true)}>
            <div className="w-16 h-16 bg-gray-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-800">My Profile</span>
          </div>
          
          <div className="flex flex-col items-center group cursor-pointer" onClick={() => setShowCommunityPosts(true)}>
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <span className="text-sm font-medium text-purple-800">Community</span>
          </div>
          
          <div className="flex flex-col items-center group cursor-pointer" onClick={() => setShowHomeManager(true)}>
            <div className="w-16 h-16 bg-slate-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-lg">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-800">My Homes</span>
          </div>
        </div>
      </div>
      
      <Card className="gradient-card border-0 shadow-card">
        <CardHeader>
          <div>
            <CardTitle className="text-2xl">My Projects</CardTitle>
            <CardDescription>
              View and manage your project portfolio
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Plan End Date</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actual End Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectRuns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <p className="text-muted-foreground">No projects yet.</p>
                      <Button 
                        onClick={() => navigate('/projects')}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Start Your First Project
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                projectRuns.map((projectRun) => {
                  const progress = calculateProgress(projectRun);
                  
                  return (
                    <TableRow key={projectRun.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{projectRun.customProjectName || projectRun.name}</div>
                          <div className="text-sm text-muted-foreground">{projectRun.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(projectRun.startDate)}</TableCell>
                      <TableCell>{formatDate(projectRun.planEndDate)}</TableCell>
                      <TableCell className="w-32">
                        <div className="space-y-1">
                          <Progress value={progress} className="h-2" />
                          <div className="text-xs text-muted-foreground text-center">
                            {Math.round(progress)}%
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(projectRun.status)}>
                          {projectRun.status.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {projectRun.endDate ? formatDate(projectRun.endDate) : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {projectRun.status !== 'complete' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleOpenProjectRun(projectRun)}
                              className="transition-fast"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Continue
                            </Button>
                          )}
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" className="transition-fast">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Project Run</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{projectRun.customProjectName || projectRun.name}"? This will only delete your personal project instance, not the original template.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteProjectRun(projectRun.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <ProfileManager
        open={showProfileManager} 
        onOpenChange={setShowProfileManager} 
      />
      <ToolsMaterialsWindow 
        open={showToolsLibrary} 
        onOpenChange={setShowToolsLibrary} 
      />
      <HomeManager 
        open={showHomeManager} 
        onOpenChange={setShowHomeManager} 
      />
      <CommunityPostsWindow 
        open={showCommunityPosts} 
        onOpenChange={setShowCommunityPosts} 
      />
    </div>
  );
}