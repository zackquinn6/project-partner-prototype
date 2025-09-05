import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Home, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AddMaintenanceTaskDialog } from './AddMaintenanceTaskDialog';
import { TaskCompletionDialog } from './TaskCompletionDialog';
import { format, differenceInDays, isAfter, isBefore, addDays } from 'date-fns';

interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  category: string;
  frequency_days: number;
  last_completed_at: string | null;
  next_due_date: string;
  is_custom: boolean;
  home_id: string;
  template_id?: string;
  created_at: string;
}

interface MaintenanceCompletion {
  id: string;
  completed_at: string;
  notes: string;
  photo_url?: string;
}

interface Home {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
}

interface HomeMaintenanceWindowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HomeMaintenanceWindow({ open, onOpenChange }: HomeMaintenanceWindowProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [homes, setHomes] = useState<Home[]>([]);
  const [selectedHomeId, setSelectedHomeId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [completionHistory, setCompletionHistory] = useState<Record<string, MaintenanceCompletion[]>>({});

  useEffect(() => {
    if (open && user) {
      fetchHomes();
    }
  }, [open, user]);

  useEffect(() => {
    if (selectedHomeId) {
      fetchTasks();
    }
  }, [selectedHomeId]);

  const fetchHomes = async () => {
    try {
      const { data, error } = await supabase
        .from('homes')
        .select('id, name, address, city, state')
        .eq('user_id', user?.id)
        .order('is_primary', { ascending: false });

      if (error) throw error;
      
      setHomes(data || []);
      if (data && data.length > 0 && !selectedHomeId) {
        setSelectedHomeId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching homes:', error);
      toast({
        title: "Error",
        description: "Failed to load homes",
        variant: "destructive",
      });
    }
  };

  const fetchTasks = async () => {
    if (!selectedHomeId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_maintenance_tasks')
        .select('*')
        .eq('user_id', user?.id)
        .eq('home_id', selectedHomeId)
        .eq('is_active', true)
        .order('next_due_date');

      if (error) throw error;
      setTasks(data || []);

      // Fetch completion history for each task
      if (data && data.length > 0) {
        const taskIds = data.map(task => task.id);
        const { data: completions, error: completionsError } = await supabase
          .from('maintenance_completions')
          .select('*')
          .in('task_id', taskIds)
          .order('completed_at', { ascending: false });

        if (completionsError) throw completionsError;
        
        const historyMap: Record<string, MaintenanceCompletion[]> = {};
        completions?.forEach(completion => {
          if (!historyMap[completion.task_id]) {
            historyMap[completion.task_id] = [];
          }
          historyMap[completion.task_id].push(completion);
        });
        setCompletionHistory(historyMap);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load maintenance tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTaskProgress = (task: MaintenanceTask) => {
    const now = new Date();
    const dueDate = new Date(task.next_due_date);
    const lastCompleted = task.last_completed_at ? new Date(task.last_completed_at) : null;
    
    if (!lastCompleted) {
      // Never completed - show as coming due based on creation date
      const daysSinceCreated = differenceInDays(now, new Date(task.created_at || now));
      const progress = Math.min((daysSinceCreated / task.frequency_days) * 100, 100);
      return Math.max(progress, 0);
    }
    
    const totalDays = task.frequency_days;
    const daysSinceCompletion = differenceInDays(now, lastCompleted);
    const progress = (daysSinceCompletion / totalDays) * 100;
    
    return Math.min(Math.max(progress, 0), 100);
  };

  const getTaskStatus = (task: MaintenanceTask) => {
    const now = new Date();
    const dueDate = new Date(task.next_due_date);
    const daysDiff = differenceInDays(dueDate, now);
    
    if (daysDiff < 0) return { status: 'overdue', color: 'destructive', icon: AlertTriangle };
    if (daysDiff <= 7) return { status: 'due-soon', color: 'secondary', icon: Clock };
    return { status: 'upcoming', color: 'outline', icon: CheckCircle };
  };

  const handleTaskComplete = (task: MaintenanceTask) => {
    setSelectedTask(task);
  };

  const handleTaskCompleted = () => {
    fetchTasks(); // Refresh tasks after completion
    setSelectedTask(null);
  };

  const getCategoryTasks = (category: string) => {
    return tasks.filter(task => task.category === category);
  };

  const categories = ['appliances', 'hvac', 'safety', 'plumbing', 'exterior', 'general'];
  const categoryLabels: Record<string, string> = {
    appliances: 'Appliances',
    hvac: 'HVAC',
    safety: 'Safety',
    plumbing: 'Plumbing',
    exterior: 'Exterior',
    general: 'General'
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Home Maintenance Tracker
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Home Selection */}
            <div className="flex items-center gap-4">
              <Select value={selectedHomeId} onValueChange={setSelectedHomeId}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select a home" />
                </SelectTrigger>
                <SelectContent>
                  {homes.map(home => (
                    <SelectItem key={home.id} value={home.id}>
                      {home.name} {home.address && `- ${home.address}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                onClick={() => setShowAddTask(true)}
                disabled={!selectedHomeId}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </div>

            {selectedHomeId && (
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid grid-cols-7 w-full">
                  <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
                  {categories.map(category => {
                    const count = getCategoryTasks(category).length;
                    return count > 0 ? (
                      <TabsTrigger key={category} value={category}>
                        {categoryLabels[category]} ({count})
                      </TabsTrigger>
                    ) : null;
                  })}
                </TabsList>

                <div className="mt-4 max-h-[60vh] overflow-y-auto">
                  <TabsContent value="all" className="space-y-4">
                    {loading ? (
                      <div className="text-center py-8">Loading tasks...</div>
                    ) : tasks.length === 0 ? (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center py-8">
                            <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">No maintenance tasks yet</h3>
                            <p className="text-muted-foreground mb-4">
                              Add your first maintenance task to start tracking your home maintenance.
                            </p>
                            <Button onClick={() => setShowAddTask(true)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Add Your First Task
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid gap-4">
                        {tasks.map(task => {
                          const progress = getTaskProgress(task);
                          const { status, color, icon: StatusIcon } = getTaskStatus(task);
                          const history = completionHistory[task.id] || [];
                          
                          return (
                            <Card key={task.id} className="hover:shadow-md transition-shadow">
                              <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                      {task.title}
                                      <Badge variant={color as any}>
                                        <StatusIcon className="h-3 w-3 mr-1" />
                                        {status === 'overdue' ? 'Overdue' : 
                                         status === 'due-soon' ? 'Due Soon' : 'Upcoming'}
                                      </Badge>
                                      {task.is_custom && <Badge variant="outline">Custom</Badge>}
                                    </CardTitle>
                                    <div className="text-sm text-muted-foreground">
                                      Due: {format(new Date(task.next_due_date), 'MMM dd, yyyy')}
                                    </div>
                                  </div>
                                  <Button 
                                    onClick={() => handleTaskComplete(task)}
                                    size="sm"
                                  >
                                    Mark Complete
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  {task.description && (
                                    <p className="text-sm text-muted-foreground">{task.description}</p>
                                  )}
                                  
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span>Progress to next maintenance</span>
                                      <span>{Math.round(progress)}%</span>
                                    </div>
                                    <Progress value={progress} className="h-2" />
                                  </div>

                                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span>Every {task.frequency_days} days</span>
                                    {task.last_completed_at && (
                                      <span>Last: {format(new Date(task.last_completed_at), 'MMM dd, yyyy')}</span>
                                    )}
                                    {history.length > 0 && (
                                      <span>{history.length} completions</span>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>

                  {categories.map(category => (
                    <TabsContent key={category} value={category} className="space-y-4">
                      {getCategoryTasks(category).map(task => {
                        const progress = getTaskProgress(task);
                        const { status, color, icon: StatusIcon } = getTaskStatus(task);
                        const history = completionHistory[task.id] || [];
                        
                        return (
                          <Card key={task.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-lg flex items-center gap-2">
                                    {task.title}
                                    <Badge variant={color as any}>
                                      <StatusIcon className="h-3 w-3 mr-1" />
                                      {status === 'overdue' ? 'Overdue' : 
                                       status === 'due-soon' ? 'Due Soon' : 'Upcoming'}
                                    </Badge>
                                    {task.is_custom && <Badge variant="outline">Custom</Badge>}
                                  </CardTitle>
                                  <div className="text-sm text-muted-foreground">
                                    Due: {format(new Date(task.next_due_date), 'MMM dd, yyyy')}
                                  </div>
                                </div>
                                <Button 
                                  onClick={() => handleTaskComplete(task)}
                                  size="sm"
                                >
                                  Mark Complete
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {task.description && (
                                  <p className="text-sm text-muted-foreground">{task.description}</p>
                                )}
                                
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>Progress to next maintenance</span>
                                    <span>{Math.round(progress)}%</span>
                                  </div>
                                  <Progress value={progress} className="h-2" />
                                </div>

                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                  <span>Every {task.frequency_days} days</span>
                                  {task.last_completed_at && (
                                    <span>Last: {format(new Date(task.last_completed_at), 'MMM dd, yyyy')}</span>
                                  )}
                                  {history.length > 0 && (
                                    <span>{history.length} completions</span>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AddMaintenanceTaskDialog
        open={showAddTask}
        onOpenChange={setShowAddTask}
        homeId={selectedHomeId}
        onTaskAdded={fetchTasks}
      />

      {selectedTask && (
        <TaskCompletionDialog
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
          task={selectedTask}
          onCompleted={handleTaskCompleted}
        />
      )}
    </>
  );
}