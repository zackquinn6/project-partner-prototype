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
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
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
  Brain
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

interface TeamMember {
  id: string;
  name: string;
  type: 'owner' | 'helper';
  skillLevel: 'novice' | 'intermediate' | 'expert';
  maxTotalHours: number;
  weekendsOnly: boolean;
  weekdaysAfterFivePm: boolean;
  workingHours: {
    start: string;
    end: string;
  };
  availability: {
    [date: string]: {
      start: string;
      end: string;
      available: boolean;
    }[];
  };
  costPerHour?: number;
}

interface GlobalSettings {
  quietHours: {
    start: string;
    end: string;
  };
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
      maxTotalHours: 120,
      weekendsOnly: false,
      weekdaysAfterFivePm: false,
      workingHours: {
        start: '09:00',
        end: '17:00'
      },
      availability: {},
      costPerHour: 0
    }
  ]);
  
  // Global settings
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    quietHours: {
      start: '21:00',
      end: '07:00'
    }
  });

  // Calendar popup state
  const [calendarOpen, setCalendarOpen] = useState<string | null>(null);

  // Convert project to scheduling tasks and calculate totals
  const { schedulingTasks, projectTotals } = useMemo(() => {
    const tasks: Task[] = [];
    let lowTotal = 0;
    let mediumTotal = 0;
    let highTotal = 0;
    
    const projectSize = parseFloat(projectRun?.projectSize || '1') || 1;
    const scalingFactor = projectRun?.scalingFactor || 1;
    const skillMultiplier = projectRun?.skillLevelMultiplier || 1;

    project.phases.forEach(phase => {
      phase.operations.forEach(operation => {
        operation.steps.forEach((step, index) => {
          const baseTimeLow = step.timeEstimation?.variableTime?.low || 1;
          const baseTimeMed = step.timeEstimation?.variableTime?.medium || 1;
          const baseTimeHigh = step.timeEstimation?.variableTime?.high || 1;
          
          const adjustedLow = baseTimeLow * projectSize * scalingFactor * skillMultiplier;
          const adjustedMed = baseTimeMed * projectSize * scalingFactor * skillMultiplier;
          const adjustedHigh = baseTimeHigh * projectSize * scalingFactor * skillMultiplier;
          
          lowTotal += adjustedLow;
          mediumTotal += adjustedMed;
          highTotal += adjustedHigh;
          
          const dependencies: string[] = [];
          if (index > 0) {
            dependencies.push(`${operation.id}-step-${index - 1}`);
          }

          tasks.push({
            id: `${operation.id}-step-${index}`,
            title: step.step,
            estimatedHours: adjustedMed,
            minContiguousHours: Math.min(adjustedMed, 2),
            dependencies,
            tags: [],
            confidence: 0.7,
            phaseId: phase.id,
            operationId: operation.id
          });
        });
      });
    });

    return { 
      schedulingTasks: tasks, 
      projectTotals: { low: lowTotal, medium: mediumTotal, high: highTotal }
    };
  }, [project, projectRun]);

  // Update team member
  const updateTeamMember = (id: string, updates: Partial<TeamMember>) => {
    setTeamMembers(prev => prev.map(member => 
      member.id === id ? { ...member, ...updates } : member
    ));
  };

  // Remove team member
  const removeTeamMember = (id: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== id));
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
            weekdays: { start: '07:00', end: '21:00' },
            weekends: { start: '07:00', end: '21:00' }
          },
          weekendsOnly: false,
          allowNightWork: false,
          noiseCurfew: globalSettings.quietHours.start
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
      maxTotalHours: 80,
      weekendsOnly: false,
      weekdaysAfterFivePm: false,
      workingHours: {
        start: '09:00',
        end: '17:00'
      },
      availability: {},
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
            preferredStartTime: '09:00',
            maxHoursPerDay: 8,
            preferredDays: [1, 2, 3, 4, 5, 6, 0]
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

            {/* Global Settings & Project Totals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <CardTitle className="text-sm">Quiet Hours (Global)</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">From</Label>
                      <Input 
                        type="time" 
                        value={globalSettings.quietHours.start}
                        onChange={(e) => setGlobalSettings(prev => ({
                          ...prev,
                          quietHours: { ...prev.quietHours, start: e.target.value }
                        }))}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">To</Label>
                      <Input 
                        type="time" 
                        value={globalSettings.quietHours.end}
                        onChange={(e) => setGlobalSettings(prev => ({
                          ...prev,
                          quietHours: { ...prev.quietHours, end: e.target.value }
                        }))}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    No work allowed during quiet hours
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <CardTitle className="text-sm">Project Time Estimates</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-green-600 font-medium">Low:</span>
                      <span className="font-mono">{formatTime(projectTotals.low)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-yellow-600 font-medium">Medium:</span>
                      <span className="font-mono">{formatTime(projectTotals.medium)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-red-600 font-medium">High:</span>
                      <span className="font-mono">{formatTime(projectTotals.high)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Raw project time (before scheduling)
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Team Members & Working Hours */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <h3 className="text-base font-semibold">Team Members & Availability</h3>
                </div>
                <Button onClick={addTeamMember} size="sm" className="h-8">
                  <Plus className="w-3 h-3 mr-1" />
                  Add Member
                </Button>
              </div>
              
              <div className="space-y-3">
                {teamMembers.map((member, index) => (
                  <Card key={member.id} className="border border-border">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs font-medium">Name</Label>
                            <Input 
                              value={member.name}
                              onChange={(e) => updateTeamMember(member.id, { name: e.target.value })}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs font-medium">Skill Level</Label>
                            <Select 
                              value={member.skillLevel}
                              onValueChange={(value: any) => updateTeamMember(member.id, { skillLevel: value })}
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
                            <Label className="text-xs font-medium">Max Total Hours (Project)</Label>
                            <Input 
                              type="number"
                              min="1"
                              value={member.maxTotalHours}
                              onChange={(e) => updateTeamMember(member.id, { 
                                maxTotalHours: parseInt(e.target.value) || 1 
                              })}
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>

                        {/* Working Hours */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs font-medium">Start Time</Label>
                            <Input 
                              type="time" 
                              value={member.workingHours.start}
                              onChange={(e) => updateTeamMember(member.id, {
                                workingHours: { ...member.workingHours, start: e.target.value }
                              })}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs font-medium">End Time</Label>
                            <Input 
                              type="time" 
                              value={member.workingHours.end}
                              onChange={(e) => updateTeamMember(member.id, {
                                workingHours: { ...member.workingHours, end: e.target.value }
                              })}
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>

                        {/* Availability Options */}
                        <div className="flex flex-wrap gap-4 items-center">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`weekends-only-${member.id}`}
                              checked={member.weekendsOnly}
                              onCheckedChange={(checked) => updateTeamMember(member.id, { 
                                weekendsOnly: checked as boolean,
                                weekdaysAfterFivePm: false
                              })}
                            />
                            <Label htmlFor={`weekends-only-${member.id}`} className="text-sm font-medium">
                              Weekends Only
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`weekdays-after-5-${member.id}`}
                              checked={member.weekdaysAfterFivePm}
                              onCheckedChange={(checked) => updateTeamMember(member.id, { 
                                weekdaysAfterFivePm: checked as boolean,
                                weekendsOnly: false
                              })}
                            />
                            <Label htmlFor={`weekdays-after-5-${member.id}`} className="text-sm font-medium">
                              Weekdays After 5pm
                            </Label>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setCalendarOpen(member.id)}
                            className="h-8"
                          >
                            <CalendarIcon className="w-3 h-3 mr-1" />
                            Calendar
                          </Button>
                          {teamMembers.length > 1 && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => removeTeamMember(member.id)}
                              className="h-8"
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
      
      {/* Calendar Dialog for Team Member Availability */}
      {calendarOpen && (
        <Dialog open={!!calendarOpen} onOpenChange={() => setCalendarOpen(null)}>
          <DialogContent className="max-w-[500px]">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold">
                  {teamMembers.find(m => m.id === calendarOpen)?.name} - Availability Calendar
                </h3>
                <p className="text-sm text-muted-foreground">
                  Select dates to set specific availability
                </p>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg">
                <CalendarComponent
                  mode="multiple"
                  className="rounded-md border bg-background pointer-events-auto"
                />
              </div>
              
              <div className="text-xs text-muted-foreground">
                <p><strong>Note:</strong> This calendar allows day-by-day updates to override default working hours.</p>
                <p>Selected dates will use custom availability settings.</p>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCalendarOpen(null)}>
                  Cancel
                </Button>
                <Button onClick={() => setCalendarOpen(null)}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
};