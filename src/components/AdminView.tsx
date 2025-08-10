import React, { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { WorkflowStep, Material, Tool, Output } from '@/interfaces/Project';
import { ProjectSelector } from '@/components/ProjectSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit, Trash2, Plus, Settings, FileText, Video, Image, File } from 'lucide-react';
import { toast } from 'sonner';

export const AdminView: React.FC = () => {
  const { currentProject, updateProject } = useProject();
  const [workflows, setWorkflows] = useState<WorkflowStep[]>(currentProject?.workflows || []);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Update workflows when current project changes
  React.useEffect(() => {
    if (currentProject) {
      setWorkflows(currentProject.workflows);
    }
  }, [currentProject]);

  const updateWorkflowsInProject = (newWorkflows: WorkflowStep[]) => {
    if (currentProject) {
      const updatedProject = {
        ...currentProject,
        workflows: newWorkflows,
        updatedAt: new Date()
      };
      updateProject(updatedProject);
    }
  };

  const [formData, setFormData] = useState({
    phase: '',
    operation: '',
    step: '',
    description: '',
    contentType: 'text' as 'text' | 'video' | 'image' | 'document',
    content: '',
    materials: [] as Material[],
    tools: [] as Tool[],
    outputs: [] as Output[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentProject) {
      toast.error('Please select a project first');
      return;
    }

    if (editingId) {
      const newWorkflows = workflows.map(w => w.id === editingId ? { ...formData, id: editingId } : w);
      setWorkflows(newWorkflows);
      updateWorkflowsInProject(newWorkflows);
      setEditingId(null);
      toast.success('Workflow step updated successfully');
    } else {
      const newWorkflow: WorkflowStep = { ...formData, id: Date.now().toString() };
      const newWorkflows = [...workflows, newWorkflow];
      setWorkflows(newWorkflows);
      updateWorkflowsInProject(newWorkflows);
      toast.success('Workflow step added successfully');
    }

    // Reset form
    setFormData({
      phase: '',
      operation: '',
      step: '',
      description: '',
      contentType: 'text',
      content: '',
      materials: [],
      tools: [],
      outputs: []
    });
  };

  const editWorkflow = (workflow: WorkflowStep) => {
    setFormData(workflow);
    setEditingId(workflow.id);
  };

  const deleteWorkflow = (id: string) => {
    const newWorkflows = workflows.filter(w => w.id !== id);
    setWorkflows(newWorkflows);
    updateWorkflowsInProject(newWorkflows);
    toast.success('Workflow step deleted successfully');
  };

  // Material management functions
  const addMaterial = () => {
    const newMaterial: Material = {
      id: Date.now().toString(),
      name: '',
      description: '',
      category: 'Other',
      required: false
    };
    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, newMaterial]
    }));
  };

  const updateMaterial = (index: number, field: keyof Material, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.map((material, i) => 
        i === index ? { ...material, [field]: value } : material
      )
    }));
  };

  const removeMaterial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }));
  };

  // Tool management functions
  const addTool = () => {
    const newTool: Tool = {
      id: Date.now().toString(),
      name: '',
      description: '',
      category: 'Other',
      required: false
    };
    setFormData(prev => ({
      ...prev,
      tools: [...prev.tools, newTool]
    }));
  };

  const updateTool = (index: number, field: keyof Tool, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.map((tool, i) => 
        i === index ? { ...tool, [field]: value } : tool
      )
    }));
  };

  const removeTool = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.filter((_, i) => i !== index)
    }));
  };

  // Output management functions
  const addOutput = () => {
    const newOutput: Output = {
      id: Date.now().toString(),
      name: '',
      description: '',
      type: 'none'
    };
    setFormData(prev => ({
      ...prev,
      outputs: [...prev.outputs, newOutput]
    }));
  };

  const updateOutput = (index: number, field: keyof Output, value: string) => {
    setFormData(prev => ({
      ...prev,
      outputs: prev.outputs.map((output, i) => 
        i === index ? { ...output, [field]: value } : output
      )
    }));
  };

  const removeOutput = (index: number) => {
    setFormData(prev => ({
      ...prev,
      outputs: prev.outputs.filter((_, i) => i !== index)
    }));
  };

  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      case 'document': return <File className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <ProjectSelector />
      
      {!currentProject ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Please select or create a project to manage workflows.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  {editingId ? 'Edit Workflow Step' : 'Add Workflow Step'}
                </CardTitle>
                <CardDescription>
                  Create detailed workflow steps with materials, tools, and expected outputs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phase">Phase</Label>
                      <Input
                        id="phase"
                        placeholder="e.g., Planning"
                        value={formData.phase}
                        onChange={(e) => setFormData({...formData, phase: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="operation">Operation</Label>
                      <Input
                        id="operation"
                        placeholder="e.g., Requirements Gathering"
                        value={formData.operation}
                        onChange={(e) => setFormData({...formData, operation: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="step">Step</Label>
                    <Input
                      id="step"
                      placeholder="e.g., Stakeholder Interviews"
                      value={formData.step}
                      onChange={(e) => setFormData({...formData, step: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Detailed description of this step"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contentType">Content Type</Label>
                      <Select 
                        value={formData.contentType} 
                        onValueChange={(value: 'text' | 'video' | 'image' | 'document') => setFormData({...formData, contentType: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="document">Document</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="content">Content</Label>
                      <Input
                        id="content"
                        placeholder="Content URL or description"
                        value={formData.content}
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Materials Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Materials</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addMaterial}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Material
                      </Button>
                    </div>
                    {formData.materials.map((material, index) => (
                      <div key={material.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Material {index + 1}</span>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => removeMaterial(index)}
                          >
                            Remove
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <Input
                            placeholder="Material name"
                            value={material.name}
                            onChange={(e) => updateMaterial(index, 'name', e.target.value)}
                          />
                          <Select 
                            value={material.category} 
                            onValueChange={(value: 'Hardware' | 'Software' | 'Consumable' | 'Other') => updateMaterial(index, 'category', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Hardware">Hardware</SelectItem>
                              <SelectItem value="Software">Software</SelectItem>
                              <SelectItem value="Consumable">Consumable</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={material.required}
                              onChange={(e) => updateMaterial(index, 'required', e.target.checked)}
                              className="rounded"
                            />
                            <Label className="text-sm">Required</Label>
                          </div>
                          <Input
                            placeholder="Description"
                            value={material.description}
                            onChange={(e) => updateMaterial(index, 'description', e.target.value)}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tools Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Tools</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addTool}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Tool
                      </Button>
                    </div>
                    {formData.tools.map((tool, index) => (
                      <div key={tool.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Tool {index + 1}</span>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => removeTool(index)}
                          >
                            Remove
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <Input
                            placeholder="Tool name"
                            value={tool.name}
                            onChange={(e) => updateTool(index, 'name', e.target.value)}
                          />
                          <Select 
                            value={tool.category} 
                            onValueChange={(value: 'Hardware' | 'Software' | 'Hand Tool' | 'Power Tool' | 'Other') => updateTool(index, 'category', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Hardware">Hardware</SelectItem>
                              <SelectItem value="Software">Software</SelectItem>
                              <SelectItem value="Hand Tool">Hand Tool</SelectItem>
                              <SelectItem value="Power Tool">Power Tool</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={tool.required}
                              onChange={(e) => updateTool(index, 'required', e.target.checked)}
                              className="rounded"
                            />
                            <Label className="text-sm">Required</Label>
                          </div>
                          <Input
                            placeholder="Description"
                            value={tool.description}
                            onChange={(e) => updateTool(index, 'description', e.target.value)}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Outputs Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Outputs</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addOutput}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Output
                      </Button>
                    </div>
                    {formData.outputs.map((output, index) => (
                      <div key={output.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Output {index + 1}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <Input
                            placeholder="Output name"
                            value={output.name}
                            onChange={(e) => updateOutput(index, 'name', e.target.value)}
                          />
                          <Select 
                            value={output.type} 
                            onValueChange={(value: 'none' | 'major-aesthetics' | 'performance-durability' | 'safety') => updateOutput(index, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Criticality" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="major-aesthetics">Major Aesthetics</SelectItem>
                              <SelectItem value="performance-durability">Performance/Durability</SelectItem>
                              <SelectItem value="safety">Safety</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Description"
                            value={output.description}
                            onChange={(e) => updateOutput(index, 'description', e.target.value)}
                            className="col-span-2"
                          />
                          
                          {output.type !== 'none' && (
                            <>
                              <Input
                                placeholder="Potential Effects of errors *"
                                value={output.potentialEffects || ''}
                                onChange={(e) => updateOutput(index, 'potentialEffects', e.target.value)}
                                required
                                className="col-span-3"
                              />
                              <Input
                                placeholder="Photos of potential effects *"
                                value={output.photosOfEffects || ''}
                                onChange={(e) => updateOutput(index, 'photosOfEffects', e.target.value)}
                                required
                                className="col-span-3"
                              />
                              <Input
                                placeholder="Must get Right *"
                                value={output.mustGetRight || ''}
                                onChange={(e) => updateOutput(index, 'mustGetRight', e.target.value)}
                                required
                                className="col-span-3"
                              />
                              <Input
                                placeholder="Quality checks *"
                                value={output.qualityChecks || ''}
                                onChange={(e) => updateOutput(index, 'qualityChecks', e.target.value)}
                                required
                                className="col-span-3"
                              />
                            </>
                          )}
                          
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeOutput(index)}
                            className="col-span-3"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full gradient-primary text-white shadow-elegant hover:shadow-lg transition-smooth"
                  >
                    {editingId ? 'Update Step' : 'Add Step'}
                  </Button>
                  
                  {editingId && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setEditingId(null);
                        setFormData({
                          phase: '',
                          operation: '',
                          step: '',
                          description: '',
                          contentType: 'text',
                          content: '',
                          materials: [],
                          tools: [],
                          outputs: []
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Workflow List */}
            <Card>
              <CardHeader>
                <CardTitle>Workflow Steps</CardTitle>
                <CardDescription>
                  Current workflow steps for {currentProject.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workflows.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No workflow steps yet. Add your first step to get started.
                    </p>
                  ) : (
                    workflows.map((workflow) => (
                      <div key={workflow.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{workflow.phase}</Badge>
                              <span className="text-sm text-muted-foreground">→</span>
                              <Badge variant="outline">{workflow.operation}</Badge>
                            </div>
                            <h4 className="font-medium">{workflow.step}</h4>
                            <p className="text-sm text-muted-foreground">{workflow.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                {getContentIcon(workflow.contentType)}
                                {workflow.contentType}
                              </span>
                              <span>{workflow.materials.length} materials</span>
                              <span>{workflow.tools.length} tools</span>
                              <span>{workflow.outputs.length} outputs</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => editWorkflow(workflow)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteWorkflow(workflow.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};