import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, GitBranch, Clock, CheckCircle, Archive, Eye, Plus, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

interface Project {
  id: string;
  name: string;
  description: string;
  publish_status: 'draft' | 'beta' | 'published' | 'archived';
  revision_number: number;
  parent_project_id: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  beta_released_at: string | null;
  archived_at: string | null;
  release_notes: string | null;
  revision_notes: string | null;
  is_current_version: boolean;
  created_by: string;
}

interface ProjectRevisionManagerProps {
  projectId: string;
  onClose: () => void;
}

export function ProjectRevisionManager({ projectId, onClose }: ProjectRevisionManagerProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [revisions, setRevisions] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [selectedRevision, setSelectedRevision] = useState<Project | null>(null);
  const [newStatus, setNewStatus] = useState<'beta' | 'published'>('beta');
  const [releaseNotes, setReleaseNotes] = useState('');
  const [createRevisionDialogOpen, setCreateRevisionDialogOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchProjectAndRevisions();
  }, [projectId]);

  const fetchProjectAndRevisions = async () => {
    try {
      setLoading(true);
      
      // First get the current project
      const { data: currentProject, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;
      setProject(currentProject as Project);

      // Then get all revisions for this project family
      const parentId = currentProject.parent_project_id || currentProject.id;
      
      const { data: allRevisions, error: revisionsError } = await supabase
        .from('projects')
        .select('*')
        .or(`parent_project_id.eq.${parentId},id.eq.${parentId}`)
        .order('revision_number', { ascending: false });

      if (revisionsError) throw revisionsError;
      setRevisions((allRevisions || []) as Project[]);
    } catch (error) {
      console.error('Error fetching project revisions:', error);
      toast({
        title: "Error",
        description: "Failed to load project revisions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (revision: Project, status: 'beta' | 'published') => {
    setSelectedRevision(revision);
    setNewStatus(status);
    setReleaseNotes('');
    setPublishDialogOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedRevision) return;

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          publish_status: newStatus,
          release_notes: releaseNotes,
        })
        .eq('id', selectedRevision.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Project ${newStatus === 'beta' ? 'released to Beta' : 'published'}!`,
      });

      setPublishDialogOpen(false);
      fetchProjectAndRevisions();
    } catch (error) {
      console.error('Error updating project status:', error);
      toast({
        title: "Error",
        description: "Failed to update project status",
        variant: "destructive",
      });
    }
  };

  const createNewRevision = async () => {
    try {
      const { data, error } = await supabase.rpc('create_project_revision', {
        source_project_id: projectId,
        revision_notes_text: revisionNotes || null,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "New draft revision created!",
      });

      setCreateRevisionDialogOpen(false);
      setRevisionNotes('');
      fetchProjectAndRevisions();
    } catch (error) {
      console.error('Error creating revision:', error);
      toast({
        title: "Error",
        description: "Failed to create new revision",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string, isCurrentVersion: boolean) => {
    const baseClasses = "font-medium";
    const currentIndicator = isCurrentVersion ? " (Current)" : "";
    
    switch (status) {
      case 'published':
        return <Badge className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`}>
          <CheckCircle className="w-3 h-3 mr-1" />
          Published{currentIndicator}
        </Badge>;
      case 'beta':
        return <Badge className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`}>
          <Eye className="w-3 h-3 mr-1" />
          Beta{currentIndicator}
        </Badge>;
      case 'draft':
        return <Badge className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`}>
          <Clock className="w-3 h-3 mr-1" />
          Draft{currentIndicator}
        </Badge>;
      case 'archived':
        return <Badge className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`}>
          <Archive className="w-3 h-3 mr-1" />
          Archived
        </Badge>;
      default:
        return <Badge variant="outline">{status}{currentIndicator}</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Loading Revision History...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="w-5 h-5" />
              Revision Control - {project?.name}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={() => setCreateRevisionDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create New Revision
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status Overview */}
          {project && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold mb-2">Current Project Status</h3>
              <div className="flex items-center gap-4">
                {getStatusBadge(project.publish_status, project.is_current_version)}
                <span className="text-sm text-muted-foreground">
                  Revision {project.revision_number}
                </span>
                <span className="text-sm text-muted-foreground">
                  Updated: {formatDate(project.updated_at)}
                </span>
              </div>
            </div>
          )}

          <Separator />

          {/* Revision History */}
          <div>
            <h3 className="font-semibold mb-4">All Revisions</h3>
            <div className="space-y-4">
              {revisions.map((revision) => (
                <Card key={revision.id} className="border-l-4 border-l-primary/20">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">Revision {revision.revision_number}</h4>
                          {getStatusBadge(revision.publish_status, revision.is_current_version)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-3">
                          <div>
                            <span className="font-medium">Created:</span> {formatDate(revision.created_at)}
                          </div>
                          {revision.beta_released_at && (
                            <div>
                              <span className="font-medium">Beta Release:</span> {formatDate(revision.beta_released_at)}
                            </div>
                          )}
                          {revision.published_at && (
                            <div>
                              <span className="font-medium">Published:</span> {formatDate(revision.published_at)}
                            </div>
                          )}
                          {revision.archived_at && (
                            <div>
                              <span className="font-medium">Archived:</span> {formatDate(revision.archived_at)}
                            </div>
                          )}
                        </div>

                        {revision.revision_notes && (
                          <div className="mb-2">
                            <span className="font-medium text-sm">Revision Notes:</span>
                            <p className="text-sm text-muted-foreground mt-1">{revision.revision_notes}</p>
                          </div>
                        )}

                        {revision.release_notes && (
                          <div>
                            <span className="font-medium text-sm">Release Notes:</span>
                            <p className="text-sm text-muted-foreground mt-1">{revision.release_notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {revision.publish_status === 'draft' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(revision, 'beta')}
                              className="flex items-center gap-1"
                            >
                              <ArrowRight className="w-3 h-3" />
                              Release to Beta
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(revision, 'published')}
                              className="flex items-center gap-1"
                            >
                              <ArrowRight className="w-3 h-3" />
                              Publish
                            </Button>
                          </>
                        )}
                        {revision.publish_status === 'beta' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(revision, 'published')}
                            className="flex items-center gap-1"
                          >
                            <ArrowRight className="w-3 h-3" />
                            Publish
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Publish Confirmation Dialog */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Confirm {newStatus === 'beta' ? 'Beta Release' : 'Publication'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {newStatus === 'beta' 
                ? 'This will release the project to beta testing. Beta projects are visible to users but marked as experimental.'
                : 'This will publish the project for all users. This action will archive all previous versions.'
              }
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="release-notes">Release Notes *</Label>
              <Textarea
                id="release-notes"
                placeholder={`Describe what's new in this ${newStatus} release...`}
                value={releaseNotes}
                onChange={(e) => setReleaseNotes(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPublishDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={confirmStatusChange}
                disabled={!releaseNotes.trim()}
                className={newStatus === 'published' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {newStatus === 'beta' ? 'Release to Beta' : 'Publish'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Revision Dialog */}
      <Dialog open={createRevisionDialogOpen} onOpenChange={setCreateRevisionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Revision
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Create a new draft revision based on the current project. The new revision will start in draft status.
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="revision-notes">Revision Notes (Optional)</Label>
              <Textarea
                id="revision-notes"
                placeholder="Describe the purpose of this revision..."
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateRevisionDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createNewRevision}>
                Create Draft Revision
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}