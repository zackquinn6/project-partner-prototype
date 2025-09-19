import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, Play, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Project } from '@/interfaces/Project';
import { ProjectRun } from '@/interfaces/ProjectRun';

interface MobileProjectCardProps {
  project: Project | ProjectRun;
  onSelect: () => void;
  variant?: 'project' | 'run';
}

export function MobileProjectCard({ project, onSelect, variant = 'project' }: MobileProjectCardProps) {
  const isProjectRun = variant === 'run' || 'progress' in project;
  const progress = isProjectRun ? (project as ProjectRun).progress || 0 : 0;
  const status = isProjectRun ? getProjectRunStatus(project as ProjectRun) : 'template';
  
  return (
    <Card 
      className="gradient-card hover:shadow-card transition-smooth cursor-pointer touch-target"
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-card-foreground text-base leading-tight line-clamp-2">
                {project.name}
              </h3>
              {project.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {project.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <StatusBadge status={status} />
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Progress (for project runs) */}
          {isProjectRun && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-card-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {isProjectRun && (
                <>
                  <span>Started {formatDate((project as ProjectRun).createdAt)}</span>
                  {(project as ProjectRun).updatedAt && (
                    <span>• Updated {formatDate((project as ProjectRun).updatedAt)}</span>
                  )}
                </>
              )}
              {!isProjectRun && project.phases && (
                <span>{project.phases.length} phases</span>
              )}
            </div>
            <ActionButton status={status} progress={progress} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    template: { 
      color: 'bg-muted text-muted-foreground',
      label: 'Template',
      icon: null
    },
    'not-started': { 
      color: 'bg-secondary text-secondary-foreground',
      label: 'Ready',
      icon: Play
    },
    'in-progress': { 
      color: 'bg-primary/10 text-primary',
      label: 'Active',
      icon: Clock
    },
    completed: { 
      color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
      label: 'Done',
      icon: CheckCircle
    },
    'needs-attention': { 
      color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
      label: 'Review',
      icon: AlertTriangle
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.template;
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} text-xs px-2 py-1 font-medium`}>
      <div className="flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3" />}
        {config.label}
      </div>
    </Badge>
  );
}

function ActionButton({ status, progress }: { status: string; progress: number }) {
  if (status === 'completed') {
    return (
      <Button variant="outline" size="sm" className="text-xs px-3 py-1 h-7">
        View
      </Button>
    );
  }
  
  if (status === 'in-progress') {
    return (
      <Button variant="default" size="sm" className="text-xs px-3 py-1 h-7">
        Continue
      </Button>
    );
  }
  
  return (
    <Button variant="outline" size="sm" className="text-xs px-3 py-1 h-7">
      Start
    </Button>
  );
}

function getProjectRunStatus(projectRun: ProjectRun): string {
  if (!projectRun.progress || projectRun.progress === 0) return 'not-started';
  if (projectRun.progress >= 100) return 'completed';
  if (projectRun.progress > 0) return 'in-progress';
  return 'not-started';
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffInMs = now.getTime() - d.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'today';
  if (diffInDays === 1) return 'yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}