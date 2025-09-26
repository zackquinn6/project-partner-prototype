import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle, 
  Plus, 
  Users,
  Settings,
  Zap,
  Trash2,
  Save,
  X,
  Target,
  AlertTriangle,
  TrendingUp,
  Brain,
  Calendar
} from 'lucide-react';
import { format, addDays, parseISO, addHours } from 'date-fns';
import { Project } from '@/interfaces/Project';
import { ProjectRun } from '@/interfaces/ProjectRun';
import { useProject } from '@/contexts/ProjectContext';
import { useToast } from '@/hooks/use-toast';
import { useResponsive } from '@/hooks/useResponsive';
import { schedulingEngine } from '@/utils/schedulingEngine';
import { 
  SchedulingInputs, 
  SchedulingResult, 
  Task, 
  Worker, 
  PlanningMode, 
  RiskTolerance,
  RemediationSuggestion 
} from '@/interfaces/Scheduling';

interface ProjectSchedulerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  projectRun: ProjectRun;
}

interface TeamMember extends Worker {
  hoursAvailable: number;
  startDate?: Date;
  endDate?: Date;
}

interface WorkingHours {
  start: string;
  end: string;
  daysOfWeek: number[];
  weekendsOnly: boolean;
  afterHoursOnly: boolean;
}

const planningModes: { mode: PlanningMode; name: string; description: string }[] = [
  { mode: 'quick', name: 'Quick', description: 'Phases and milestones only' },
  { mode: 'balanced', name: 'Balanced', description: 'Task-level with basic constraints' },
  { mode: 'detailed', name: 'Detailed', description: 'Time-of-day slots with full optimization' }
];

export const ProjectScheduler: React.FC<ProjectSchedulerProps> = ({
  open,
  onOpenChange,
  project,
  projectRun
}) => {
  const { updateProjectRun } = useProject();
  const { toast } = useToast();
  const { isMobile } = useResponsive();
  
  // Enhanced scheduling state
  const [planningMode, setPlanningMode] = useState<PlanningMode>('balanced');
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>('moderate');
  const [schedulingResult, setSchedulingResult] = useState<SchedulingResult | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const [targetDate, setTargetDate] = useState<string>(
    format(addDays(new Date(), 30), 'yyyy-MM-dd')
  );
  
  // Team management
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { 
      id: '1', 
      name: 'You', 
      type: 'owner',
      skillLevel: 'intermediate', 
      hoursAvailable: 4,
      availability: []
    }
  ]);
  
  // Working hours
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    start: '09:00',
    end: '17:00',
    daysOfWeek: [1, 2, 3, 4, 5], // Monday-Friday
    weekendsOnly: false,
    afterHoursOnly: false
  });

  // Convert project to scheduling tasks
  const schedulingTasks = useMemo(() => {
    const tasks: Task[] = [];
    const projectSize = parseFloat(projectRun?.projectSize || '1') || 1;
    const scalingFactor = projectRun?.scalingFactor || 1;
    const skillMultiplier = projectRun?.skillLevelMultiplier || 1;

    project.phases.forEach(phase => {
      phase.operations.forEach(operation => {
        operation.steps.forEach((step, index) => {
          const baseWorkTime = step.timeEstimation?.variableTime?.medium || 1;
          const adjustedWorkTime = baseWorkTime * projectSize * scalingFactor * skillMultiplier;
          
          const dependencies: string[] = [];
          if (index > 0) {
            // Depend on previous step in same operation
            dependencies.push(`${operation.id}-step-${index - 1}`);
          }

          tasks.push({
            id: `${operation.id}-step-${index}`,
            title: step.step,
            estimatedHours: adjustedWorkTime,
            minContiguousHours: Math.min(adjustedWorkTime, 2), // Assume 2-hour minimum blocks
            dependencies,
            tags: [], // Default empty tags since WorkflowStep doesn't have tags
            confidence: 0.7, // Default confidence since WorkflowStep doesn't have confidence
            phaseId: phase.id,
            operationId: operation.id
          });
        });
      });
    });

    return tasks;
  }, [project, projectRun]);

  // Handle weekends only toggle
  const handleWeekendsOnly = (checked: boolean) => {
    setWorkingHours(prev => ({
      ...prev,
      weekendsOnly: checked,
      daysOfWeek: checked ? [0, 6] : [1, 2, 3, 4, 5],
      afterHoursOnly: checked ? false : prev.afterHoursOnly
    }));
  };

  // Handle after hours only toggle
  const handleAfterHoursOnly = (checked: boolean) => {
    setWorkingHours(prev => ({
      ...prev,
      afterHoursOnly: checked,
      start: checked ? '17:00' : '09:00',
      end: checked ? '22:00' : '17:00',
      weekendsOnly: checked ? false : prev.weekendsOnly
    }));
  };

  // Generate schedule with advanced algorithm
  const computeAdvancedSchedule = async () => {
    setIsComputing(true);
    
    try {
      // Prepare scheduling inputs
      const schedulingInputs: SchedulingInputs = {
        targetCompletionDate: new Date(targetDate),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        tasks: schedulingTasks,
        workers: teamMembers.map(tm => ({
          ...tm,
          availability: [{
            start: new Date(),
            end: addDays(new Date(), 90),
            workerId: tm.id,
            isAvailable: true
          }]
        })),
        siteConstraints: {
          allowedWorkHours: {
            weekdays: { start: workingHours.start, end: workingHours.end },
            weekends: { start: workingHours.start, end: workingHours.end }
          },
          weekendsOnly: workingHours.weekendsOnly,
          allowNightWork: workingHours.afterHoursOnly,
          noiseCurfew: '22:00'
        },
        blackoutDates: [],
        riskTolerance,
        preferHelpers: teamMembers.some(tm => tm.type === 'helper'),
        mode: planningMode
      };

      // Compute schedule
      const result = schedulingEngine.computeSchedule(schedulingInputs);
      setSchedulingResult(result);
      
      toast({
        title: "Schedule computed",
        description: `Generated ${planningMode} schedule with ${result.scheduledTasks.length} tasks.`
      });
    } catch (error) {
      toast({
        title: "Scheduling failed",
        description: "Failed to compute schedule. Please check your inputs.",
        variant: "destructive"
      });
    } finally {
      setIsComputing(false);
    }
  };

  // Add team member
  const addTeamMember = () => {
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: 'New Team Member',
      type: 'helper',
      skillLevel: 'intermediate',
      hoursAvailable: 4,
      availability: [],
      costPerHour: 25
    };
    setTeamMembers([...teamMembers, newMember]);
  };

  // Apply remediation suggestion
  const applyRemediation = async (remediation: RemediationSuggestion) => {
    if (remediation.preview) {
      setSchedulingResult(remediation.preview);
      toast({
        title: "Remediation applied",
        description: remediation.description
      });
    }
  };

  // Save schedule to project run
  const saveSchedule = async () => {
    if (!schedulingResult) return;
    
    try {
      const updatedProjectRun = {
        ...projectRun,
        calendar_integration: {
          scheduledDays: schedulingResult.scheduledTasks.reduce((acc, task) => {
            const dateKey = format(task.startTime, 'yyyy-MM-dd');
            if (!acc[dateKey]) {
              acc[dateKey] = {
                date: dateKey,
                timeSlots: []
              };
            }
            acc[dateKey].timeSlots.push({
              startTime: format(task.startTime, 'HH:mm'),
              endTime: format(task.endTime, 'HH:mm'),
              phaseId: schedulingTasks.find(t => t.id === task.taskId)?.phaseId,
              operationId: schedulingTasks.find(t => t.id === task.taskId)?.operationId
            });
            return acc;
          }, {} as Record<string, any>),
          preferences: {
            preferredStartTime: workingHours.start,
            maxHoursPerDay: teamMembers.reduce((sum, member) => sum + member.hoursAvailable, 0),
            preferredDays: workingHours.daysOfWeek
          }
        }
      };

      await updateProjectRun(updatedProjectRun);
      schedulingEngine.commitSchedule(schedulingResult);
      
      toast({
        title: "Schedule saved",
        description: "Your optimized schedule has been saved successfully."
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error saving schedule",
        description: "Failed to save the schedule. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatTime = (hours: number): string => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${Math.round(hours * 10) / 10}h`;
    const days = Math.floor(hours / 8);
    const remainingHours = hours % 8;
    return remainingHours > 0 ? `${days}d ${Math.round(remainingHours * 10) / 10}h` : `${days}d`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-[90vw] md:max-w-none h-[85vh] p-0 gap-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-subtle">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CalendarIcon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Project Scheduler</h2>
              <p className="text-xs text-muted-foreground">{project.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            {/* Target Completion Date */}
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Target className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Target Completion Date</p>
                    <Input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="mt-1 h-8"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Planning Mode & Risk Tolerance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-primary" />
                    <CardTitle className="text-sm">Planning Mode</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Select value={planningMode} onValueChange={(value) => setPlanningMode(value as PlanningMode)}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {planningModes.map((mode) => (
                        <SelectItem key={mode.mode} value={mode.mode}>
                          <div>
                            <div className="font-medium">{mode.name}</div>
                            <div className="text-xs text-muted-foreground">{mode.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <CardTitle className="text-sm">Risk Tolerance</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Select value={riskTolerance} onValueChange={(value) => setRiskTolerance(value as RiskTolerance)}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative (Extra buffers)</SelectItem>
                      <SelectItem value="moderate">Moderate (Standard buffers)</SelectItem>
                      <SelectItem value="aggressive">Aggressive (Minimal buffers)</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>

            {/* Working Hours Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Settings className="w-4 h-4 text-primary" />
                <h3 className="text-base font-semibold">Working Hours & Availability</h3>
              </div>
              
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="weekends-only"
                        checked={workingHours.weekendsOnly}
                        onCheckedChange={handleWeekendsOnly}
                      />
                      <Label htmlFor="weekends-only" className="text-sm font-medium">
                        Weekends Only
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="after-hours"
                        checked={workingHours.afterHoursOnly}
                        onCheckedChange={handleAfterHoursOnly}
                      />
                      <Label htmlFor="after-hours" className="text-sm font-medium">
                        After 5pm Only
                      </Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Start Time</Label>
                      <Input 
                        type="time" 
                        value={workingHours.start}
                        onChange={(e) => setWorkingHours({...workingHours, start: e.target.value})}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">End Time</Label>
                      <Input 
                        type="time" 
                        value={workingHours.end}
                        onChange={(e) => setWorkingHours({...workingHours, end: e.target.value})}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Team Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <h3 className="text-base font-semibold">Team Members</h3>
                </div>
                <Button onClick={addTeamMember} size="sm" className="h-8">
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </div>
              
              <div className="space-y-2">
                {teamMembers.map((member, index) => (
                  <Card key={member.id} className="border border-border">
                    <CardContent className="p-3">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Name</Label>
                          <Input 
                            value={member.name}
                            onChange={(e) => {
                              const updated = [...teamMembers];
                              updated[index].name = e.target.value;
                              setTeamMembers(updated);
                            }}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Skill Level</Label>
                          <Select 
                            value={member.skillLevel}
                            onValueChange={(value: any) => {
                              const updated = [...teamMembers];
                              updated[index].skillLevel = value;
                              setTeamMembers(updated);
                            }}
                          >
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="novice">Novice</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="expert">Expert</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Hours/Day</Label>
                          <Input 
                            type="number"
                            min="1"
                            max="12"
                            value={member.hoursAvailable}
                            onChange={(e) => {
                              const updated = [...teamMembers];
                              updated[index].hoursAvailable = parseInt(e.target.value) || 1;
                              setTeamMembers(updated);
                            }}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="flex items-end">
                          {teamMembers.length > 1 && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setTeamMembers(teamMembers.filter((_, i) => i !== index))}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Schedule Generation Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <CalendarIcon className="w-4 h-4 text-primary" />
                <h3 className="text-base font-semibold">Generate Schedule</h3>
              </div>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">
                        Planning mode: <strong>{planningMode}</strong>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {schedulingResult 
                          ? `${schedulingResult.scheduledTasks.length} tasks scheduled`
                          : 'No schedule generated yet'
                        }
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {schedulingResult && (
                        <Button 
                          variant="outline" 
                          onClick={() => setSchedulingResult(null)}
                          className="h-8"
                        >
                          Clear
                        </Button>
                      )}
                      <Button 
                        onClick={computeAdvancedSchedule} 
                        className="h-8"
                        disabled={isComputing || teamMembers.length === 0}
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        {isComputing ? 'Computing...' : 'Generate'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 p-4 border-t bg-muted/20">
          <div className="text-xs text-muted-foreground">
            {planningMode} mode • {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''} • Risk: {riskTolerance}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="h-8">
              Cancel
            </Button>
            <Button 
              onClick={saveSchedule} 
              disabled={!schedulingResult}
              className="h-8"
            >
              <Save className="w-3 h-3 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};