import React from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Trash2, Play, Pause, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const ProjectRunsView: React.FC = () => {
  const { projectRuns, deleteProjectRun } = useProject();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'not-started':
        return <Play className="h-4 w-4" />;
      case 'in-progress':
        return <Pause className="h-4 w-4" />;
      case 'complete':
        return <CheckCircle className="h-4 w-4" />;
      case 'paused':
        return <Pause className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not-started':
        return 'default';
      case 'in-progress':
        return 'default';
      case 'complete':
        return 'default';
      case 'paused':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Project Runs
        </CardTitle>
      </CardHeader>
      <CardContent>
        {projectRuns.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No project runs yet</p>
            <p className="text-sm">Users will create runs when they start projects</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Current Phase</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectRuns.map((run) => {
                const duration = run.completedAt 
                  ? `${Math.ceil((run.completedAt.getTime() - run.startedAt.getTime()) / (1000 * 60 * 60 * 24))} days`
                  : `${Math.ceil((new Date().getTime() - run.startedAt.getTime()) / (1000 * 60 * 60 * 24))} days`;

                return (
                  <TableRow key={run.id}>
                    <TableCell className="font-medium">
                      {run.projectName}
                    </TableCell>
                    <TableCell>
                      {run.userName ? (
                        <div>
                          <div className="font-medium">{run.userName}</div>
                          {run.userEmail && (
                            <div className="text-sm text-muted-foreground">{run.userEmail}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Anonymous</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(run.startedAt, 'MMM dd, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(run.status)} className="flex items-center gap-1 w-fit">
                        {getStatusIcon(run.status)}
                        {run.status.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${run.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{run.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {run.currentPhase ? (
                        <span className="text-sm">{run.currentPhase}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Not started</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {duration}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteProjectRun(run.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectRunsView;