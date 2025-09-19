import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GitBranch, Search, Filter, Plus, Edit, Archive, Eye, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProjectRevisionManager } from './ProjectRevisionManager';

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
  is_current_version: boolean;
  category: string | null;
  difficulty: string | null;
}

export function EnhancedProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'published' | 'beta' | 'draft' | 'archived'>('published');
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, statusFilter, activeTab]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects((data || []) as Project[]);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects.filter(project => {
      // Filter by active tab
      if (project.publish_status !== activeTab) return false;
      
      // Filter by search term
      if (searchTerm && !project.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !project.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });

    setFilteredProjects(filtered);
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
    });
  };

  const getProjectCounts = () => {
    return {
      published: projects.filter(p => p.publish_status === 'published').length,
      beta: projects.filter(p => p.publish_status === 'beta').length,
      draft: projects.filter(p => p.publish_status === 'draft').length,
      archived: projects.filter(p => p.publish_status === 'archived').length,
    };
  };

  const counts = getProjectCounts();

  if (selectedProjectId) {
    return (
      <ProjectRevisionManager
        projectId={selectedProjectId}
        onClose={() => setSelectedProjectId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Enhanced Project Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={fetchProjects} variant="outline">
              Refresh
            </Button>
          </div>

          {/* Status Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="published" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Published ({counts.published})
              </TabsTrigger>
              <TabsTrigger value="beta" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Beta ({counts.beta})
              </TabsTrigger>
              <TabsTrigger value="draft" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Draft ({counts.draft})
              </TabsTrigger>
              <TabsTrigger value="archived" className="flex items-center gap-2">
                <Archive className="w-4 h-4" />
                Archived ({counts.archived})
              </TabsTrigger>
            </TabsList>

            {/* Projects List */}
            <div className="mt-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Archive className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No {activeTab} projects found</p>
                  {searchTerm && (
                    <p className="text-sm mt-1">Try adjusting your search criteria</p>
                  )}
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredProjects.map((project) => (
                    <Card key={project.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{project.name}</h3>
                              {getStatusBadge(project.publish_status, project.is_current_version)}
                              {project.revision_number > 1 && (
                                <Badge variant="outline" className="text-xs">
                                  Rev {project.revision_number}
                                </Badge>
                              )}
                            </div>
                            
                            {project.description && (
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {project.description}
                              </p>
                            )}
                            
                            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                              {project.category && (
                                <span>Category: {project.category}</span>
                              )}
                              {project.difficulty && (
                                <span>Difficulty: {project.difficulty}</span>
                              )}
                              <span>Updated: {formatDate(project.updated_at)}</span>
                              {project.published_at && (
                                <span>Published: {formatDate(project.published_at)}</span>
                              )}
                              {project.beta_released_at && (
                                <span>Beta: {formatDate(project.beta_released_at)}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedProjectId(project.id)}
                              className="flex items-center gap-1"
                            >
                              <GitBranch className="w-3 h-3" />
                              Manage Revisions
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {/* Navigate to edit */}}
                              className="flex items-center gap-1"
                            >
                              <Edit className="w-3 h-3" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}