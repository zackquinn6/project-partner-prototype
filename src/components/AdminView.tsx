import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit3, Trash2, Image, Video, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

export interface WorkflowStep {
  id: string;
  phase: string;
  operation: string;
  step: string;
  description: string;
  contentType: 'text' | 'link' | 'image' | 'video';
  content: string;
  order: number;
}

export default function AdminView() {
  const [steps, setSteps] = useState<WorkflowStep[]>([
    {
      id: '1',
      phase: 'Planning',
      operation: 'Requirements Gathering',
      step: 'Stakeholder Interview',
      description: 'Conduct interviews with key stakeholders to understand project requirements.',
      contentType: 'text',
      content: 'Prepare a list of open-ended questions focusing on project goals, constraints, and success criteria.',
      order: 1
    },
    {
      id: '2',
      phase: 'Planning',
      operation: 'Requirements Gathering',
      step: 'Document Requirements',
      description: 'Create comprehensive documentation of all gathered requirements.',
      contentType: 'link',
      content: 'https://example.com/requirements-template',
      order: 2
    }
  ]);
  
  const [formData, setFormData] = useState<{
    phase: string;
    operation: string;
    step: string;
    description: string;
    contentType: 'text' | 'link' | 'image' | 'video';
    content: string;
  }>({
    phase: '',
    operation: '',
    step: '',
    description: '',
    contentType: 'text',
    content: ''
  });
  
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.phase || !formData.operation || !formData.step) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newStep: WorkflowStep = {
      id: editingId || Date.now().toString(),
      ...formData,
      order: editingId ? steps.find(s => s.id === editingId)?.order || 0 : steps.length + 1
    };

    if (editingId) {
      setSteps(steps.map(step => step.id === editingId ? newStep : step));
      setEditingId(null);
      toast.success("Step updated successfully");
    } else {
      setSteps([...steps, newStep]);
      toast.success("Step added successfully");
    }

    setFormData({
      phase: '',
      operation: '',
      step: '',
      description: '',
      contentType: 'text',
      content: ''
    });
  };

  const handleEdit = (step: WorkflowStep) => {
    setFormData({
      phase: step.phase,
      operation: step.operation,
      step: step.step,
      description: step.description,
      contentType: step.contentType,
      content: step.content
    });
    setEditingId(step.id);
  };

  const handleDelete = (id: string) => {
    setSteps(steps.filter(step => step.id !== id));
    toast.success("Step deleted successfully");
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'link': return <LinkIcon className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      default: return null;
    }
  };

  const uniquePhases = [...new Set(steps.map(s => s.phase))];
  const uniqueOperations = [...new Set(steps.map(s => s.operation))];

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Create and manage workflow processes</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <Card className="lg:col-span-1 gradient-card border-0 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              {editingId ? 'Edit Step' : 'Add New Step'}
            </CardTitle>
            <CardDescription>
              Create structured workflow steps with multimedia content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phase">Phase *</Label>
                <Input
                  id="phase"
                  value={formData.phase}
                  onChange={(e) => setFormData({...formData, phase: e.target.value})}
                  placeholder="e.g., Planning, Execution, Review"
                  className="transition-fast focus:shadow-soft"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="operation">Operation *</Label>
                <Input
                  id="operation"
                  value={formData.operation}
                  onChange={(e) => setFormData({...formData, operation: e.target.value})}
                  placeholder="e.g., Requirements Gathering"
                  className="transition-fast focus:shadow-soft"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="step">Step *</Label>
                <Input
                  id="step"
                  value={formData.step}
                  onChange={(e) => setFormData({...formData, step: e.target.value})}
                  placeholder="e.g., Stakeholder Interview"
                  className="transition-fast focus:shadow-soft"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of this step"
                  className="transition-fast focus:shadow-soft"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contentType">Content Type</Label>
                <Select 
                  value={formData.contentType} 
                  onValueChange={(value: any) => setFormData({...formData, contentType: value})}
                >
                  <SelectTrigger className="transition-fast focus:shadow-soft">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="link">Link/URL</SelectItem>
                    <SelectItem value="image">Image URL</SelectItem>
                    <SelectItem value="video">Video URL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder={
                    formData.contentType === 'text' ? 'Enter instructions or notes' :
                    formData.contentType === 'link' ? 'https://example.com' :
                    'Enter URL'
                  }
                  className="transition-fast focus:shadow-soft"
                />
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
                      content: ''
                    });
                  }}
                >
                  Cancel
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="lg:col-span-2 gradient-card border-0 shadow-card">
          <CardHeader>
            <CardTitle>Workflow Steps ({steps.length})</CardTitle>
            <CardDescription>
              Manage your process hierarchy: Phase → Operation → Step
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Phase</TableHead>
                    <TableHead>Operation</TableHead>
                    <TableHead>Step</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {steps.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No workflow steps yet. Add your first step to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    steps.map((step) => (
                      <TableRow key={step.id} className="hover:bg-muted/20 transition-fast">
                        <TableCell className="font-medium">
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            {step.phase}
                          </Badge>
                        </TableCell>
                        <TableCell>{step.operation}</TableCell>
                        <TableCell>{step.step}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getContentIcon(step.contentType)}
                            <span className="text-sm text-muted-foreground capitalize">
                              {step.contentType}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(step)}
                              className="transition-fast hover:bg-primary/10"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(step.id)}
                              className="transition-fast hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="gradient-card border-0 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Steps</p>
                <p className="text-3xl font-bold">{steps.length}</p>
              </div>
              <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="gradient-card border-0 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Phases</p>
                <p className="text-3xl font-bold">{uniquePhases.length}</p>
              </div>
              <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
                <Edit3 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="gradient-card border-0 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Operations</p>
                <p className="text-3xl font-bold">{uniqueOperations.length}</p>
              </div>
              <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
                <LinkIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}