import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Edit, Trash2, Target, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

// Database types for PFMEA
interface DatabaseProject {
  id: string;
  name: string;
  description: string;
  phases: any;
  [key: string]: any;
}

interface PFMEAProject {
  id: string;
  project_id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  projects?: DatabaseProject;
}

interface PFMEARequirement {
  id: string;
  pfmea_project_id: string;
  process_step_id: string;
  requirement_text: string;
  output_reference: any;
}

interface PFMEAFailureMode {
  id: string;
  requirement_id: string;
  failure_mode: string;
  severity_score: number;
  pfmea_potential_effects: PFMEAPotentialEffect[];
  pfmea_potential_causes: PFMEAPotentialCause[];
  pfmea_controls: PFMEAControl[];
  pfmea_action_items: PFMEAActionItem[];
}

interface PFMEAPotentialEffect {
  id: string;
  failure_mode_id: string;
  effect_description: string;
  severity_score: number;
}

interface PFMEAPotentialCause {
  id: string;
  failure_mode_id: string;
  cause_description: string;
  occurrence_score: number;
}

interface PFMEAControl {
  id: string;
  failure_mode_id?: string;
  cause_id?: string;
  control_type: string;
  control_description: string;
  detection_score?: number;
}

interface PFMEAActionItem {
  id: string;
  failure_mode_id: string;
  recommended_action: string;
  responsible_person?: string;
  target_completion_date?: string;
  status: string;
  completion_notes?: string;
}

export const PFMEAManagement: React.FC = () => {
  const [pfmeaProjects, setPfmeaProjects] = useState<PFMEAProject[]>([]);
  const [selectedPfmeaProject, setSelectedPfmeaProject] = useState<PFMEAProject | null>(null);
  const [projects, setProjects] = useState<DatabaseProject[]>([]);
  const [requirements, setRequirements] = useState<PFMEARequirement[]>([]);
  const [failureModes, setFailureModes] = useState<PFMEAFailureMode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [editingCell, setEditingCell] = useState<{row: string, column: string} | null>(null);
  const [currentTab, setCurrentTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch projects for selection
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('publish_status', 'published')
        .order('name');
      
      if (projectsData) {
        setProjects(projectsData);
      }
      
      // Fetch PFMEA projects
      const { data: pfmeaData } = await supabase
        .from('pfmea_projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (pfmeaData) {
        setPfmeaProjects(pfmeaData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load PFMEA data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPfmeaDetails = async (pfmeaProjectId: string) => {
    try {
      // Fetch requirements
      const { data: reqData } = await supabase
        .from('pfmea_requirements')
        .select('*')
        .eq('pfmea_project_id', pfmeaProjectId);

      if (reqData) {
        setRequirements(reqData);
      }

      // Fetch failure modes with related data
      const { data: fmData } = await supabase
        .from('pfmea_failure_modes')
        .select(`
          *,
          pfmea_potential_effects(*),
          pfmea_potential_causes(*),
          pfmea_controls(*),
          pfmea_action_items(*)
        `)
        .in('requirement_id', reqData?.map(r => r.id) || []);

      if (fmData) {
        setFailureModes(fmData as PFMEAFailureMode[]);
      }
    } catch (error) {
      console.error('Error fetching PFMEA details:', error);
      toast.error('Failed to load PFMEA details');
    }
  };

  const createPfmeaProject = async (projectId: string, name: string, description: string) => {
    try {
      const { data, error } = await supabase
        .from('pfmea_projects')
        .insert({
          project_id: projectId,
          name,
          description,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      await syncProjectOutputsToRequirements(data.id, projectId);
      await fetchData();
      setShowCreateProject(false);
      toast.success('PFMEA project created successfully');
    } catch (error) {
      console.error('Error creating PFMEA project:', error);
      toast.error('Failed to create PFMEA project');
    }
  };

  const syncProjectOutputsToRequirements = async (pfmeaProjectId: string, projectId: string) => {
    try {
      // Get project with phases data  
      const project = projects.find(p => p.id === projectId);
      if (!project || !project.phases) return;

      const requirementsToInsert: any[] = [];
      
      // Parse phases if it's a string
      let phases = project.phases;
      if (typeof phases === 'string') {
        try {
          phases = JSON.parse(phases);
        } catch (e) {
          console.error('Failed to parse phases JSON:', e);
          return;
        }
      }

      // Extract all steps with outputs from the project
      if (Array.isArray(phases)) {
        phases.forEach((phase: any) => {
          if (Array.isArray(phase.operations)) {
            phase.operations.forEach((operation: any) => {
              if (Array.isArray(operation.steps)) {
                operation.steps.forEach((step: any) => {
                  if (Array.isArray(step.outputs) && step.outputs.length > 0) {
                    step.outputs.forEach((output: any) => {
                      requirementsToInsert.push({
                        pfmea_project_id: pfmeaProjectId,
                        process_step_id: step.id,
                        requirement_text: output.name,
                        output_reference: {
                          step_name: step.step,
                          output_name: output.name,
                          output_type: output.type,
                          phase_name: phase.name,
                          operation_name: operation.name
                        }
                      });
                    });
                  }
                });
              }
            });
          }
        });
      }

      if (requirementsToInsert.length > 0) {
        await supabase
          .from('pfmea_requirements')
          .insert(requirementsToInsert);
      }
    } catch (error) {
      console.error('Error syncing outputs to requirements:', error);
    }
  };

  const addFailureMode = async (requirementId: string) => {
    try {
      const { error } = await supabase
        .from('pfmea_failure_modes')
        .insert({
          requirement_id: requirementId,
          failure_mode: 'New Failure Mode',
          severity_score: 5
        });

      if (error) throw error;
      
      if (selectedPfmeaProject) {
        await fetchPfmeaDetails(selectedPfmeaProject.id);
      }
      toast.success('Failure mode added');
    } catch (error) {
      console.error('Error adding failure mode:', error);
      toast.error('Failed to add failure mode');
    }
  };

  const calculateRPN = (failureMode: PFMEAFailureMode): number => {
    const maxSeverity = Math.max(
      failureMode.severity_score || 0,
      ...failureMode.pfmea_potential_effects.map(e => e.severity_score)
    );
    
    const avgOccurrence = failureMode.pfmea_potential_causes.length > 0
      ? failureMode.pfmea_potential_causes.reduce((sum, c) => sum + c.occurrence_score, 0) / failureMode.pfmea_potential_causes.length
      : 10;

    const minDetection = Math.min(
      ...failureMode.pfmea_controls
        .filter(c => c.control_type === 'detection' && c.detection_score)
        .map(c => c.detection_score!),
      10
    );

    return Math.round(maxSeverity * avgOccurrence * minDetection);
  };

  const getRPNColor = (rpn: number): string => {
    if (rpn >= 200) return 'bg-red-100 border-red-500 text-red-900';
    if (rpn >= 100) return 'bg-orange-100 border-orange-500 text-orange-900';
    if (rpn >= 50) return 'bg-yellow-100 border-yellow-500 text-yellow-900';
    return 'bg-green-100 border-green-500 text-green-900';
  };

  const renderProjectSelector = () => {
    // If no project is selected, show the full card
    if (!selectedPfmeaProject) {
      return (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              PFMEA Project Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              {pfmeaProjects.map(project => (
                <Button
                  key={project.id}
                  variant="outline"
                  onClick={() => {
                    setSelectedPfmeaProject(project);
                    fetchPfmeaDetails(project.id);
                  }}
                  className="h-auto p-4 text-left flex flex-col items-start gap-2"
                >
                  <div className="font-medium">{project.name}</div>
                  <div className="text-sm opacity-70">{project.description}</div>
                  <Badge variant="secondary" className="text-xs">
                    {project.status}
                  </Badge>
                </Button>
              ))}
              <Button
                variant="outline"
                onClick={() => setShowCreateProject(true)}
                className="h-auto p-4 border-2 border-dashed"
              >
                <div className="flex flex-col items-center gap-2">
                  <Plus className="w-6 h-6" />
                  <span>Create New PFMEA</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    // If a project is selected, show a compact project switcher
    return (
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Project:</span>
        </div>
        <Select
          value={selectedPfmeaProject.id}
          onValueChange={(value) => {
            const project = pfmeaProjects.find(p => p.id === value);
            if (project) {
              setSelectedPfmeaProject(project);
              fetchPfmeaDetails(project.id);
            }
          }}
        >
          <SelectTrigger className="w-auto min-w-[200px]">
            <SelectValue>
              <div className="flex items-center gap-2">
                <span className="font-medium">{selectedPfmeaProject.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {selectedPfmeaProject.status}
                </Badge>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {pfmeaProjects.map(project => (
              <SelectItem key={project.id} value={project.id}>
                <div className="flex flex-col items-start gap-1">
                  <span className="font-medium">{project.name}</span>
                  <span className="text-xs text-muted-foreground">{project.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowCreateProject(true)}
        >
          <Plus className="w-4 h-4 mr-1" />
          New PFMEA
        </Button>
      </div>
    );
  };

  const renderPfmeaTable = () => {
    if (!selectedPfmeaProject) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            PFMEA Analysis - {selectedPfmeaProject.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Process Step</TableHead>
                  <TableHead className="min-w-[200px]">Failure Mode</TableHead>
                  <TableHead className="min-w-[200px]">Potential Effects</TableHead>
                  <TableHead className="w-20">S</TableHead>
                  <TableHead className="min-w-[200px]">Potential Causes</TableHead>
                  <TableHead className="w-20">O</TableHead>
                  <TableHead className="min-w-[200px]">Controls</TableHead>
                  <TableHead className="w-20">D</TableHead>
                  <TableHead className="w-20">RPN</TableHead>
                  <TableHead className="min-w-[200px]">Actions</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requirements.map(requirement => {
                  const reqFailureModes = failureModes.filter(fm => fm.requirement_id === requirement.id);
                  
                  return reqFailureModes.map((failureMode, index) => {
                    const rpn = calculateRPN(failureMode);
                    const rpnColorClass = getRPNColor(rpn);
                    
                    return (
                      <TableRow key={failureMode.id} className={rpnColorClass}>
                        {index === 0 && (
                          <TableCell rowSpan={reqFailureModes.length} className="font-medium">
                            <div className="space-y-1">
                              <div>{requirement.output_reference?.step_name || 'Unknown Step'}</div>
                              <div className="text-xs text-muted-foreground">
                                {requirement.output_reference?.phase_name} → {requirement.output_reference?.operation_name}
                              </div>
                              <div className="font-normal text-sm">{requirement.requirement_text}</div>
                            </div>
                          </TableCell>
                        )}
                        <TableCell>{failureMode.failure_mode}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {failureMode.pfmea_potential_effects.map(effect => (
                              <div key={effect.id} className="text-sm">
                                {effect.effect_description} (S:{effect.severity_score})
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          {Math.max(failureMode.severity_score || 0, ...failureMode.pfmea_potential_effects.map(e => e.severity_score))}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {failureMode.pfmea_potential_causes.map(cause => (
                              <div key={cause.id} className="text-sm">
                                {cause.cause_description} (O:{cause.occurrence_score})
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          {failureMode.pfmea_potential_causes.length > 0
                            ? Math.round(failureMode.pfmea_potential_causes.reduce((sum, c) => sum + c.occurrence_score, 0) / failureMode.pfmea_potential_causes.length)
                            : 10
                          }
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {failureMode.pfmea_controls
                              .filter(control => control.control_type === 'prevention')
                              .map(control => (
                                <div key={control.id} className="text-sm">
                                  <Badge variant="outline" className="text-xs mr-1">Prev</Badge>
                                  {control.control_description}
                                </div>
                              ))
                            }
                            {failureMode.pfmea_controls
                              .filter(control => control.control_type === 'detection')
                              .map(control => (
                                <div key={control.id} className="text-sm">
                                  <Badge variant="outline" className="text-xs mr-1">Det</Badge>
                                  {control.control_description} (D:{control.detection_score})
                                </div>
                              ))
                            }
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          {Math.min(
                            ...failureMode.pfmea_controls
                              .filter(c => c.control_type === 'detection' && c.detection_score)
                              .map(c => c.detection_score!),
                            10
                          )}
                        </TableCell>
                        <TableCell className={`text-center font-bold text-lg ${rpn >= 200 ? 'text-red-600' : rpn >= 100 ? 'text-orange-600' : ''}`}>
                          {rpn}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {failureMode.pfmea_action_items.map(action => (
                              <div key={action.id} className="text-sm p-2 bg-blue-50 rounded border">
                                <div>{action.recommended_action}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {action.responsible_person && `Assigned: ${action.responsible_person}`}
                                  {action.target_completion_date && ` | Due: ${action.target_completion_date}`}
                                </div>
                                <Badge variant="secondary" className="text-xs mt-1">
                                  {action.status.replace('_', ' ')}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => addFailureMode(requirement.id)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  });
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  const renderCreateProjectDialog = () => (
    <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New PFMEA Project</DialogTitle>
        </DialogHeader>
        <CreatePfmeaProjectForm
          projects={projects}
          onSubmit={createPfmeaProject}
          onCancel={() => setShowCreateProject(false)}
        />
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading PFMEA data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Process Failure Mode and Effects Analysis</h2>
          <p className="text-muted-foreground">Identify, assess, and mitigate potential process failures</p>
        </div>
      </div>

      {renderProjectSelector()}

      {selectedPfmeaProject && (
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="table">PFMEA Table</TabsTrigger>
            <TabsTrigger value="actions">Action Tracker</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Requirements</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{requirements.length}</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      <span className="font-medium">Failure Modes</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">{failureModes.length}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="font-medium">High Priority (RPN ≥ 200)</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {failureModes.filter(fm => calculateRPN(fm) >= 200).length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="table" className="mt-6">
            {renderPfmeaTable()}
          </TabsContent>

          <TabsContent value="actions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Action Tracker</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Action tracking functionality coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Reports & Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Reporting functionality coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {renderCreateProjectDialog()}
    </div>
  );
};

// Create PFMEA Project Form Component
interface CreatePfmeaProjectFormProps {
  projects: DatabaseProject[];
  onSubmit: (projectId: string, name: string, description: string) => void;
  onCancel: () => void;
}

const CreatePfmeaProjectForm: React.FC<CreatePfmeaProjectFormProps> = ({
  projects,
  onSubmit,
  onCancel
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !name) {
      toast.error('Please fill in all required fields');
      return;
    }
    onSubmit(selectedProjectId, name, description);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Source Project *</label>
        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a project to analyze" />
          </SelectTrigger>
          <SelectContent>
            {projects.map(project => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">PFMEA Name *</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter PFMEA project name"
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the scope and objectives of this PFMEA"
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit">Create PFMEA Project</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};