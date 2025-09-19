import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Plus, SortAsc } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { MobileProjectCard } from './MobileProjectCard';
import { Project } from '@/interfaces/Project';
import { ProjectRun } from '@/interfaces/ProjectRun';

interface MobileProjectListingProps {
  onProjectSelect: (project: Project | ProjectRun) => void;
  onNewProject?: () => void;
}

export function MobileProjectListing({ onProjectSelect, onNewProject }: MobileProjectListingProps) {
  const { projects, projectRuns, currentProjectRun } = useProject();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'templates' | 'completed'>('active');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'progress'>('recent');

  // Filter and sort project runs
  const filteredProjectRuns = useMemo(() => {
    let filtered = projectRuns.filter(run => {
      const matchesSearch = run.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          run.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (activeTab === 'active') {
        return matchesSearch && (run.progress || 0) < 100;
      } else if (activeTab === 'completed') {
        return matchesSearch && (run.progress || 0) >= 100;
      }
      return false;
    });

    // Sort
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'progress':
          return (b.progress || 0) - (a.progress || 0);
        case 'recent':
        default:
          return new Date(b.updatedAt || b.createdAt).getTime() - 
                 new Date(a.updatedAt || a.createdAt).getTime();
      }
    });
  }, [projectRuns, searchQuery, activeTab, sortBy]);

  // Filter project templates
  const filteredProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      return project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [projects, searchQuery]);

  // Get counts for tabs
  const activeCount = projectRuns.filter(run => (run.progress || 0) < 100).length;
  const completedCount = projectRuns.filter(run => (run.progress || 0) >= 100).length;
  const templatesCount = projects.length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-4 space-y-4 bg-background/95 backdrop-blur-sm border-b border-border">
        {/* Search and Actions */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const nextSort = sortBy === 'recent' ? 'name' : sortBy === 'name' ? 'progress' : 'recent';
              setSortBy(nextSort);
            }}
            className="px-3 h-10"
          >
            <SortAsc className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onNewProject}
            className="px-3 h-10"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Continue Current Project (if any) */}
        {currentProjectRun && activeTab === 'active' && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary">Continue Current Project</p>
                <p className="text-xs text-muted-foreground truncate">{currentProjectRun.name}</p>
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={() => onProjectSelect(currentProjectRun)}
                className="ml-3"
              >
                Continue
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mx-4 mb-4">
            <TabsTrigger value="active" className="relative">
              Active
              {activeCount > 0 && (
                <Badge className="ml-2 bg-primary text-primary-foreground text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                  {activeCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="templates" className="relative">
              Templates
              {templatesCount > 0 && (
                <Badge className="ml-2 bg-muted text-muted-foreground text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                  {templatesCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed" className="relative">
              Done
              {completedCount > 0 && (
                <Badge className="ml-2 bg-green-100 text-green-700 text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                  {completedCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <Tabs value={activeTab} className="h-full">
          <TabsContent value="active" className="p-4 space-y-3 mt-0">
            {filteredProjectRuns.length > 0 ? (
              filteredProjectRuns.map((run) => (
                <MobileProjectCard
                  key={run.id}
                  project={run}
                  variant="run"
                  onSelect={() => onProjectSelect(run)}
                />
              ))
            ) : (
              <EmptyState
                title="No active projects"
                description="Start a new project from our templates"
                actionLabel="Browse Templates"
                onAction={() => setActiveTab('templates')}
              />
            )}
          </TabsContent>

          <TabsContent value="templates" className="p-4 space-y-3 mt-0">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <MobileProjectCard
                  key={project.id}
                  project={project}
                  variant="project"
                  onSelect={() => onProjectSelect(project)}
                />
              ))
            ) : (
              <EmptyState
                title="No templates found"
                description="Try adjusting your search"
                actionLabel="Clear Search"
                onAction={() => setSearchQuery('')}
              />
            )}
          </TabsContent>

          <TabsContent value="completed" className="p-4 space-y-3 mt-0">
            {filteredProjectRuns.length > 0 ? (
              filteredProjectRuns.map((run) => (
                <MobileProjectCard
                  key={run.id}
                  project={run}
                  variant="run"
                  onSelect={() => onProjectSelect(run)}
                />
              ))
            ) : (
              <EmptyState
                title="No completed projects"
                description="Finish a project to see it here"
                actionLabel="View Active"
                onAction={() => setActiveTab('active')}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
        <Plus className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-card-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      <Button variant="outline" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}