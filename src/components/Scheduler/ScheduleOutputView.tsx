import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Calendar, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { format, isSameDay, startOfDay, addDays } from 'date-fns';
import { SchedulingResult, Task, PlanningMode } from '@/interfaces/Scheduling';

interface TeamMember {
  id: string;
  name: string;
}

interface ScheduleOutputViewProps {
  schedulingResult: SchedulingResult;
  planningMode: PlanningMode;
  schedulingTasks: Task[];
  teamMembers: TeamMember[];
}

export const ScheduleOutputView: React.FC<ScheduleOutputViewProps> = ({
  schedulingResult,
  planningMode,
  schedulingTasks,
  teamMembers
}) => {
  // Group tasks by day for Standard mode
  const tasksByDay = useMemo(() => {
    const grouped: Record<string, typeof schedulingResult.scheduledTasks> = {};
    
    schedulingResult.scheduledTasks
      .filter(st => st.status === 'confirmed')
      .forEach(task => {
        const dateKey = format(startOfDay(task.startTime), 'yyyy-MM-dd');
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(task);
      });
    
    return grouped;
  }, [schedulingResult]);

  // Group tasks by phase for Quick mode
  const tasksByPhase = useMemo(() => {
    const grouped: Record<string, typeof schedulingResult.scheduledTasks> = {};
    
    schedulingResult.scheduledTasks
      .filter(st => st.status === 'confirmed')
      .forEach(scheduledTask => {
        const task = schedulingTasks.find(t => t.id === scheduledTask.taskId);
        const phaseId = task?.phaseId || 'Other';
        
        if (!grouped[phaseId]) {
          grouped[phaseId] = [];
        }
        grouped[phaseId].push(scheduledTask);
      });
    
    return grouped;
  }, [schedulingResult, schedulingTasks]);

  if (planningMode === 'quick') {
    // Quick Mode: Phase/Milestone Timeline
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Project Timeline (Phases)
          </h3>
        </div>

        <div className="space-y-3">
          {Object.entries(tasksByPhase).map(([phaseId, tasks], index) => {
            const startDate = new Date(Math.min(...tasks.map(t => t.startTime.getTime())));
            const endDate = new Date(Math.max(...tasks.map(t => t.endTime.getTime())));
            const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <Card key={phaseId} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">Phase {index + 1}</h4>
                          <p className="text-xs text-muted-foreground">{tasks.length} tasks</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm mt-3">
                        <span className="text-muted-foreground">
                          {format(startDate, 'MMM dd')} - {format(endDate, 'MMM dd')}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          ~{totalDays} days
                        </Badge>
                      </div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  if (planningMode === 'standard') {
    // Standard Mode: Daily Task Lists
    const sortedDays = Object.keys(tasksByDay).sort();
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Daily Task Schedule
          </h3>
        </div>

        <div className="space-y-4">
          {sortedDays.map((dateKey) => {
            const date = new Date(dateKey);
            const dayTasks = tasksByDay[dateKey];
            const totalHours = dayTasks.reduce((sum, st) => {
              return sum + ((st.endTime.getTime() - st.startTime.getTime()) / (1000 * 60 * 60));
            }, 0);

            return (
              <Card key={dateKey}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      {format(date, 'EEEE, MMMM dd, yyyy')}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {Math.round(totalHours * 10) / 10}h
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {dayTasks
                      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
                      .map((scheduledTask) => {
                        const task = schedulingTasks.find(t => t.id === scheduledTask.taskId);
                        const worker = teamMembers.find(w => w.id === scheduledTask.workerId);
                        
                        return (
                          <div 
                            key={scheduledTask.taskId}
                            className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <CheckCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{task?.title || 'Unknown Task'}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {worker?.name || 'Unknown'} • {format(scheduledTask.startTime, 'h:mm a')} - {format(scheduledTask.endTime, 'h:mm a')}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Detailed Mode: Hour-by-Hour Table (existing view)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Detailed Schedule (Hour-by-Hour)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Task</th>
                <th className="text-left p-2 font-medium">Worker</th>
                <th className="text-left p-2 font-medium">Start</th>
                <th className="text-left p-2 font-medium text-green-700">Target Complete</th>
                <th className="text-left p-2 font-medium text-red-700">Latest Complete</th>
                <th className="text-left p-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {schedulingResult.scheduledTasks
                .filter(st => st.status === 'confirmed')
                .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
                .map((scheduledTask) => {
                  const task = schedulingTasks.find(t => t.id === scheduledTask.taskId);
                  const worker = teamMembers.find(w => w.id === scheduledTask.workerId);
                  
                  return (
                    <tr key={scheduledTask.taskId} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <div className="font-medium">{task?.title || 'Unknown'}</div>
                      </td>
                      <td className="p-2">{worker?.name || 'Unknown'}</td>
                      <td className="p-2 text-xs">{format(scheduledTask.startTime, 'MMM dd, h:mm a')}</td>
                      <td className="p-2 text-xs text-green-700 font-medium">
                        {format(scheduledTask.targetCompletionDate, 'MMM dd, h:mm a')}
                      </td>
                      <td className="p-2 text-xs text-red-700 font-medium">
                        {format(scheduledTask.latestCompletionDate, 'MMM dd, h:mm a')}
                      </td>
                      <td className="p-2">
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          {scheduledTask.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        
        {schedulingResult.scheduledTasks.some(st => st.status === 'conflict') && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {schedulingResult.scheduledTasks.filter(st => st.status === 'conflict').length} tasks could not be scheduled
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> Target dates are your goal completion times. 
            Latest dates represent absolute deadlines based on critical path analysis.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
