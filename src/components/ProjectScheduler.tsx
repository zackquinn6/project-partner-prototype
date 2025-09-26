import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle, 
  Plus, 
  AlertTriangle,
  Users,
  Settings,
  Zap,
  Trash2,
  Edit2
} from 'lucide-react';
import { format, addDays, parseISO, isSameDay, startOfDay, addHours, isAfter, isBefore } from 'date-fns';
import { Project } from '@/interfaces/Project';
import { ProjectRun } from '@/interfaces/ProjectRun';
import { useProject } from '@/contexts/ProjectContext';
import { useToast } from '@/components/ui/use-toast';

interface ProjectSchedulerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  projectRun: ProjectRun;
}

interface ScenarioEstimate {
  name: string;
  multiplier: number;
  description: string;
  color: string;
}

interface TeamMember {
  id: string;
  name: string;
  skillLevel: 'novice' | 'intermediate' | 'expert';
  hoursAvailable: number;
  startDate?: Date;
  endDate?: Date;
}

interface ScheduledSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  phaseId?: string;
  operationId?: string;
  teamMemberIds: string[];
  sessionType: 'work' | 'planning' | 'review';
  estimatedHours: number;
  notes?: string;
}

interface WorkingHours {
  start: string;
  end: string;
  daysOfWeek: number[];
}

const scenarios: ScenarioEstimate[] = [
  { name: 'Best Case', multiplier: 0.8, description: 'Everything goes smoothly', color: 'text-green-600' },
  { name: 'Typical', multiplier: 1.0, description: 'Standard timeline with normal delays', color: 'text-blue-600' },
  { name: 'Worst Case', multiplier: 1.5, description: 'Includes potential setbacks', color: 'text-red-600' }
];

export const ProjectScheduler: React.FC<ProjectSchedulerProps> = ({
  open,
  onOpenChange,
  project,
  projectRun
}) => {
  const { updateProjectRun } = useProject();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedScenario, setSelectedScenario] = useState<string>('Typical');
  
  // Team management
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'You', skillLevel: 'intermediate', hoursAvailable: 4 }
  ]);
  
  // Working hours
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    start: '09:00',
    end: '17:00',
    daysOfWeek: [1, 2, 3, 4, 5] // Monday-Friday
  });
  
  // Quick presets
  const [quickPreset, setQuickPreset] = useState<string>('');
  
  // Sessions
  const [scheduledSessions, setScheduledSessions] = useState<ScheduledSession[]>([]);
  const [newSessionDate, setNewSessionDate] = useState<Date>(new Date());
  const [showAddSession, setShowAddSession] = useState(false);

  // Calculate time estimates with scenarios
  const timeEstimates = useMemo(() => {
    const projectSize = parseFloat(projectRun?.projectSize || '1') || 1;
    const scalingFactor = projectRun?.scalingFactor || 1;
    const skillMultiplier = projectRun?.skillLevelMultiplier || 1;

    return scenarios.map(scenario => {
      let totalWorkTime = 0;
      let totalLagTime = 0;
      const phases: any[] = [];

      project.phases.forEach(phase => {
        let phaseWorkTime = 0;
        let phaseLagTime = 0;
        let stepCount = 0;

        phase.operations.forEach(operation => {
          operation.steps.forEach(step => {
            stepCount++;
            const baseWorkTime = step.timeEstimation?.variableTime?.medium || 1;
            const baseLagTime = step.timeEstimation?.lagTime?.medium || 0;

            const adjustedWorkTime = baseWorkTime * projectSize * scalingFactor * skillMultiplier * scenario.multiplier;
            const adjustedLagTime = baseLagTime * projectSize * scalingFactor * scenario.multiplier;

            phaseWorkTime += adjustedWorkTime;
            phaseLagTime += adjustedLagTime;
          });
        });

        phases.push({
          phaseId: phase.id,
          phaseName: phase.name,
          workTime: phaseWorkTime,
          lagTime: phaseLagTime,
          stepCount
        });

        totalWorkTime += phaseWorkTime;
        totalLagTime += phaseLagTime;
      });

      return {
        scenario: scenario.name,
        totalWorkTime,
        totalLagTime,
        totalTime: totalWorkTime + totalLagTime,
        phases,
        color: scenario.color,
        description: scenario.description
      };
    });
  }, [project, projectRun]);

  // Apply quick presets
  const applyQuickPreset = (preset: string) => {
    switch (preset) {
      case 'weekends':
        setWorkingHours({
          start: '09:00',
          end: '17:00',
          daysOfWeek: [0, 6] // Saturday, Sunday
        });
        break;
      case 'evenings':
        setWorkingHours({
          start: '18:00',
          end: '22:00',
          daysOfWeek: [1, 2, 3, 4, 5] // Monday-Friday
        });
        break;
      case 'flexible':
        setWorkingHours({
          start: '09:00',
          end: '17:00',
          daysOfWeek: [1, 2, 3, 4, 5, 6] // Monday-Saturday
        });
        break;
    }
    setQuickPreset(preset);
    toast({
      title: "Working hours updated",
      description: `Applied ${preset} schedule preset.`
    });
  };

  // Add team member
  const addTeamMember = () => {
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: 'New Team Member',
      skillLevel: 'intermediate',
      hoursAvailable: 4
    };
    setTeamMembers([...teamMembers, newMember]);
  };

  // Generate automatic schedule
  const generateSchedule = () => {
    const estimate = timeEstimates.find(e => e.scenario === selectedScenario);
    if (!estimate) return;

    const sessions: ScheduledSession[] = [];
    let currentDate = new Date();
    
    // Find next available working day
    while (!workingHours.daysOfWeek.includes(currentDate.getDay())) {
      currentDate = addDays(currentDate, 1);
    }

    estimate.phases.forEach(phase => {
      let remainingHours = phase.workTime;
      
      while (remainingHours > 0) {
        const dailyCapacity = teamMembers.reduce((sum, member) => sum + member.hoursAvailable, 0);
        const sessionHours = Math.min(remainingHours, dailyCapacity);
        
        sessions.push({
          id: `session-${sessions.length}`,
          date: format(currentDate, 'yyyy-MM-dd'),
          startTime: workingHours.start,
          endTime: format(addHours(parseISO(`2000-01-01T${workingHours.start}`), sessionHours), 'HH:mm'),
          phaseId: phase.phaseId,
          teamMemberIds: teamMembers.map(m => m.id),
          sessionType: 'work',
          estimatedHours: sessionHours,
          notes: `${phase.phaseName} - ${Math.ceil(remainingHours)}h remaining`
        });

        remainingHours -= sessionHours;
        
        // Move to next working day
        do {
          currentDate = addDays(currentDate, 1);
        } while (!workingHours.daysOfWeek.includes(currentDate.getDay()));
      }
    });

    setScheduledSessions(sessions);
    toast({
      title: "Schedule generated",
      description: `Created ${sessions.length} work sessions for ${selectedScenario.toLowerCase()} scenario.`
    });
  };

  // Save schedule to project run
  const saveSchedule = async () => {
    try {
      const updatedProjectRun = {
        ...projectRun,
        calendar_integration: {
          scheduledDays: scheduledSessions.reduce((acc, session) => {
            if (!acc[session.date]) {
              acc[session.date] = {
                date: session.date,
                timeSlots: []
              };
            }
            acc[session.date].timeSlots.push({
              startTime: session.startTime,
              endTime: session.endTime,
              phaseId: session.phaseId,
              operationId: session.operationId
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
      
      toast({
        title: "Schedule saved",
        description: "Your project schedule has been saved successfully."
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

  // Get sessions for a specific date
  const getDateSessions = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return scheduledSessions.filter(session => session.date === dateStr);
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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Project Scheduler - {project.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Time Estimates & Scenarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {timeEstimates.map((estimate) => (
                    <Card key={estimate.scenario} className={`cursor-pointer transition-all ${
                      selectedScenario === estimate.scenario ? 'ring-2 ring-primary' : ''
                    }`} onClick={() => setSelectedScenario(estimate.scenario)}>
                      <CardHeader className="pb-3">
                        <CardTitle className={`text-lg ${estimate.color}`}>
                          {estimate.scenario}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{estimate.description}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Work Time:</span>
                            <span className="font-medium">{formatTime(estimate.totalWorkTime)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Wait Time:</span>
                            <span className="font-medium">{formatTime(estimate.totalLagTime)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-semibold">
                            <span>Total Time:</span>
                            <span>{formatTime(estimate.totalTime)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Working Hours & Availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant={quickPreset === 'weekends' ? 'default' : 'outline'}
                    onClick={() => applyQuickPreset('weekends')}
                    className="flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Weekends Only
                  </Button>
                  <Button 
                    variant={quickPreset === 'evenings' ? 'default' : 'outline'}
                    onClick={() => applyQuickPreset('evenings')}
                    className="flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    After 5pm Only
                  </Button>
                  <Button 
                    variant={quickPreset === 'flexible' ? 'default' : 'outline'}
                    onClick={() => applyQuickPreset('flexible')}
                    className="flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Flexible Schedule
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Time</Label>
                    <Input 
                      type="time" 
                      value={workingHours.start}
                      onChange={(e) => setWorkingHours({...workingHours, start: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>End Time</Label>
                    <Input 
                      type="time" 
                      value={workingHours.end}
                      onChange={(e) => setWorkingHours({...workingHours, end: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Team Members
                  </span>
                  <Button onClick={addTeamMember} size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Member
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.map((member, index) => (
                    <Card key={member.id}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <Label>Name</Label>
                            <Input 
                              value={member.name}
                              onChange={(e) => {
                                const updated = [...teamMembers];
                                updated[index].name = e.target.value;
                                setTeamMembers(updated);
                              }}
                            />
                          </div>
                          <div>
                            <Label>Skill Level</Label>
                            <Select 
                              value={member.skillLevel}
                              onValueChange={(value: any) => {
                                const updated = [...teamMembers];
                                updated[index].skillLevel = value;
                                setTeamMembers(updated);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="novice">Novice</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="expert">Expert</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Hours/Day</Label>
                            <Input 
                              type="number"
                              min="1"
                              max="12"
                              value={member.hoursAvailable}
                              onChange={(e) => {
                                const updated = [...teamMembers];
                                updated[index].hoursAvailable = parseInt(e.target.value) || 4;
                                setTeamMembers(updated);
                              }}
                            />
                          </div>
                          <div className="flex items-end">
                            {teamMembers.length > 1 && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setTeamMembers(teamMembers.filter(m => m.id !== member.id))}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <div className="flex gap-4">
              <Button onClick={generateSchedule} className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Generate Schedule ({selectedScenario})
              </Button>
              <Button onClick={() => setScheduledSessions([])} variant="outline">
                Clear Schedule
              </Button>
            </div>

            {scheduledSessions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Generated Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {scheduledSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">
                            {format(parseISO(session.date), 'MMM d, yyyy')} 
                            {' '}{session.startTime} - {session.endTime}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {session.notes} ({formatTime(session.estimatedHours)})
                          </div>
                        </div>
                        <Badge variant="outline">{session.sessionType}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Calendar View</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border pointer-events-auto"
                    modifiers={{
                      scheduled: scheduledSessions.map(s => parseISO(s.date))
                    }}
                    modifiersStyles={{
                      scheduled: { backgroundColor: 'var(--primary)', color: 'white' }
                    }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {format(selectedDate, 'MMM d, yyyy')} Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getDateSessions(selectedDate).map((session) => (
                      <div key={session.id} className="p-3 border rounded">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">
                              {session.startTime} - {session.endTime}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {session.notes}
                            </div>
                          </div>
                          <Badge>{formatTime(session.estimatedHours)}</Badge>
                        </div>
                      </div>
                    ))}
                    {getDateSessions(selectedDate).length === 0 && (
                      <p className="text-muted-foreground text-center py-4">
                        No sessions scheduled for this date
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={saveSchedule} disabled={scheduledSessions.length === 0}>
            Save Schedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};