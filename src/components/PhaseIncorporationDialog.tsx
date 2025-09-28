import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Phase } from "@/interfaces/Project";

interface PhaseIncorporationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIncorporatePhase: (phase: Phase & { sourceProjectId: string; sourceProjectName: string; incorporatedRevision: number }) => void;
}

interface PublishedProject {
  id: string;
  name: string;
  description: string;
  phases: any; // Will be parsed as Phase[] after fetching
  revision_number: number;
}

export const PhaseIncorporationDialog: React.FC<PhaseIncorporationDialogProps> = ({
  open,
  onOpenChange,
  onIncorporatePhase
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<PublishedProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<PublishedProject | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const standardPhaseNames = ['Kickoff', 'Planning', 'Ordering', 'Close Project'];

  const searchProjects = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a search term to find projects.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, description, phases, revision_number')
        .eq('publish_status', 'published')
        .ilike('name', `%${searchQuery}%`)
        .order('updated_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Parse phases as JSON and create proper PublishedProject objects
      const processedProjects = (data || []).map(project => ({
        ...project,
        phases: typeof project.phases === 'string' 
          ? JSON.parse(project.phases) 
          : project.phases || []
      }));

      setProjects(processedProjects);
      setSelectedProject(null);
      setSelectedPhase(null);
    } catch (error) {
      console.error('Error searching projects:', error);
      toast({
        title: "Search Failed",
        description: "Failed to search projects. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    setSelectedProject(project || null);
    setSelectedPhase(null);
  };

  const handlePhaseSelect = (phaseId: string) => {
    const phase = selectedProject?.phases.find(p => p.id === phaseId);
    setSelectedPhase(phase || null);
  };

  const handleIncorporate = () => {
    if (!selectedProject || !selectedPhase) {
      toast({
        title: "Selection Required",
        description: "Please select both a project and a phase to incorporate.",
        variant: "destructive"
      });
      return;
    }

    const incorporatedPhase = {
      ...selectedPhase,
      sourceProjectId: selectedProject.id,
      sourceProjectName: selectedProject.name,
      incorporatedRevision: selectedProject.revision_number,
      isLinked: true
    };

    onIncorporatePhase(incorporatedPhase);
    
    // Reset dialog state
    setSearchQuery('');
    setProjects([]);
    setSelectedProject(null);
    setSelectedPhase(null);
    onOpenChange(false);

    toast({
      title: "Phase Incorporated",
      description: `Phase "${selectedPhase.name}" from project "${selectedProject.name}" has been incorporated.`
    });
  };

  // Filter out standard phases
  const availablePhases = selectedProject?.phases.filter(
    phase => !standardPhaseNames.includes(phase.name)
  ) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Incorporate Phase from Another Project</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Project Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Search Projects</label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter project name to search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchProjects()}
              />
              <Button onClick={searchProjects} disabled={loading} size="sm">
                <Search className="w-4 h-4 mr-1" />
                Search
              </Button>
            </div>
          </div>

          {/* Project Results */}
          {projects.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Project</label>
              <div className="grid gap-2 max-h-40 overflow-y-auto">
                {projects.map((project) => (
                  <Card 
                    key={project.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedProject?.id === project.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleProjectSelect(project.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{project.name}</h4>
                          <p className="text-xs text-muted-foreground">{project.description}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Rev {project.revision_number || 0}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Phase Selection */}
          {selectedProject && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Phase</label>
              {availablePhases.length > 0 ? (
                <Select onValueChange={handlePhaseSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a phase to incorporate..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePhases.map((phase) => (
                      <SelectItem key={phase.id} value={phase.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{phase.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {phase.operations?.length || 0} operations
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground py-2">
                  No incorporable phases found in this project. Only non-standard phases can be incorporated.
                </p>
              )}
            </div>
          )}

          {/* Phase Preview */}
          {selectedPhase && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Phase Preview</label>
              <Card>
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{selectedPhase.name}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/project/${selectedProject?.id}`, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View Source
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedPhase.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{selectedPhase.operations?.length || 0} operations</span>
                      <span>
                        {selectedPhase.operations?.reduce((total, op) => 
                          total + (op.steps?.length || 0), 0) || 0} steps
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleIncorporate}
              disabled={!selectedProject || !selectedPhase}
            >
              Add to Project
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};