import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Project, Phase } from '../../interfaces/Project';
import { Search, Package, Clock, Filter } from 'lucide-react';

interface PhaseBrowserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableProjects: Project[];
  onSelectPhases: (phases: Phase[], insertAfterPhaseId?: string) => void;
  currentProjectId: string;
}

interface PhaseWithProject extends Phase {
  projectName: string;
  projectId: string;
  category: string;
}

export const PhaseBrowser: React.FC<PhaseBrowserProps> = ({
  open,
  onOpenChange,
  availableProjects,
  onSelectPhases,
  currentProjectId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPhases, setSelectedPhases] = useState<PhaseWithProject[]>([]);

  // Get all phases from all projects (excluding current project)
  const allAvailablePhases = useMemo(() => {
    const phases: PhaseWithProject[] = [];
    
    availableProjects.forEach(project => {
      if (project.id === currentProjectId || project.publishStatus === 'draft') return;
      
      project.phases?.forEach(phase => {
        // Skip kickoff and close phases as they're typically project-specific
        if (phase.name.toLowerCase().includes('kickoff') || 
            phase.name.toLowerCase().includes('close')) {
          return;
        }
        
        phases.push({
          ...phase,
          projectName: project.name,
          projectId: project.id,
          category: project.category || 'Other'
        });
      });
    });
    
    return phases;
  }, [availableProjects, currentProjectId]);

  // Filter and search phases
  const filteredPhases = useMemo(() => {
    let filtered = allAvailablePhases;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(phase => 
        phase.name.toLowerCase().includes(searchLower) ||
        phase.description?.toLowerCase().includes(searchLower) ||
        phase.projectName.toLowerCase().includes(searchLower)
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(phase => phase.category === selectedCategory);
    }
    
    return filtered;
  }, [allAvailablePhases, searchTerm, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(allAvailablePhases.map(phase => phase.category));
    return Array.from(cats).sort();
  }, [allAvailablePhases]);

  const handlePhaseToggle = (phase: PhaseWithProject, checked: boolean) => {
    if (checked) {
      setSelectedPhases(prev => [...prev, phase]);
    } else {
      setSelectedPhases(prev => prev.filter(p => p.id !== phase.id));
    }
  };

  const handleAddSelectedPhases = () => {
    if (selectedPhases.length > 0) {
      // Convert back to regular phases and add unique IDs to avoid conflicts
      const phasesToAdd: Phase[] = selectedPhases.map(phase => ({
        ...phase,
        id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        // Remove the extra properties we added
        projectName: undefined as any,
        projectId: undefined as any,
        category: undefined as any
      }));
      
      onSelectPhases(phasesToAdd);
      setSelectedPhases([]);
      onOpenChange(false);
    }
  };

  const isPhaseSelected = (phase: PhaseWithProject) => {
    return selectedPhases.some(p => p.id === phase.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 [&>button]:hidden">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Browse Available Phases
              </DialogTitle>
              <DialogDescription className="mt-2">
                Select phases from other projects to add to your workflow. These are conventional, tested phases.
              </DialogDescription>
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col px-6">
          {/* Search and Filter Controls */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search phases by name, description, or project..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Phase List */}
          <ScrollArea className="flex-1 mb-4">
            {filteredPhases.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Phases Found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || selectedCategory !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'No compatible phases are available from other projects.'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPhases.map((phase) => (
                  <Card 
                    key={`${phase.projectId}-${phase.id}`} 
                    className={`cursor-pointer transition-colors ${
                      isPhaseSelected(phase) ? 'bg-primary/5 border-primary' : ''
                    }`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Checkbox
                              checked={isPhaseSelected(phase)}
                              onCheckedChange={(checked) => handlePhaseToggle(phase, checked as boolean)}
                            />
                            {phase.name}
                          </CardTitle>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {phase.projectName}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {phase.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-2">
                        {phase.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          {phase.operations?.length || 0} operations
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Est. time varies
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Action Bar */}
          <div className="border-t pt-4 pb-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {selectedPhases.length > 0 
                  ? `${selectedPhases.length} phase${selectedPhases.length === 1 ? '' : 's'} selected`
                  : 'Select phases to add to your project'
                }
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedPhases([])}
                  disabled={selectedPhases.length === 0}
                >
                  Clear Selection
                </Button>
                <Button 
                  onClick={handleAddSelectedPhases}
                  disabled={selectedPhases.length === 0}
                >
                  Add {selectedPhases.length} Phase{selectedPhases.length === 1 ? '' : 's'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};