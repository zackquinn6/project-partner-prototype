import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Home, Calendar, CheckCircle, Camera, MapPin, Star, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Home {
  id: string;
  user_id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  home_type?: string;
  build_year?: string;
  is_primary: boolean;
  photos?: string[];
  created_at: string;
  updated_at: string;
}

interface ProjectRun {
  id: string;
  name: string;
  status: string;
  end_date: string;
  category?: string;
  created_at: string;
}

interface CompletedMaintenance {
  id: string;
  task_id: string;
  completed_at: string;
  notes?: string;
  photo_url?: string;
  user_maintenance_tasks: {
    title: string;
    category: string;
  };
}

interface HomeDetailsWindowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  home: Home | null;
}

export const HomeDetailsWindow: React.FC<HomeDetailsWindowProps> = ({
  open,
  onOpenChange,
  home
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [completedProjects, setCompletedProjects] = useState<ProjectRun[]>([]);
  const [completedMaintenance, setCompletedMaintenance] = useState<CompletedMaintenance[]>([]);

  useEffect(() => {
    if (open && home && user) {
      fetchHomeData();
    }
  }, [open, home, user]);

  const fetchHomeData = async () => {
    if (!home || !user) return;
    
    setLoading(true);
    try {
      // Fetch completed projects for this home
      const { data: projects, error: projectsError } = await supabase
        .from('project_runs')
        .select('id, name, status, end_date, category, created_at')
        .eq('user_id', user.id)
        .eq('home_id', home.id)
        .eq('status', 'completed')
        .order('end_date', { ascending: false });

      if (projectsError) throw projectsError;
      setCompletedProjects(projects || []);

      // Fetch completed maintenance for this home
      const { data: maintenance, error: maintenanceError } = await supabase
        .from('maintenance_completions')
        .select(`
          id,
          task_id,
          completed_at,
          notes,
          photo_url,
          user_maintenance_tasks!inner (
            title,
            category,
            home_id
          )
        `)
        .eq('user_id', user.id)
        .eq('user_maintenance_tasks.home_id', home.id)
        .order('completed_at', { ascending: false });

      if (maintenanceError) throw maintenanceError;
      setCompletedMaintenance(maintenance || []);

    } catch (error) {
      console.error('Error fetching home data:', error);
      toast.error('Failed to load home data');
    } finally {
      setLoading(false);
    }
  };

  if (!home) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            {home.name}
            {home.is_primary && (
              <Badge variant="secondary" className="text-xs">
                <Star className="w-3 h-3 mr-1" />
                Primary
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="projects">Completed Projects</TabsTrigger>
            <TabsTrigger value="maintenance">Completed Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Home Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {home.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {home.address}
                      {home.city && home.state && `, ${home.city}, ${home.state}`}
                    </span>
                  </div>
                )}
                
                {home.home_type && (
                  <div>
                    <span className="font-medium">Type: </span>
                    <span className="capitalize">{home.home_type.replace('-', ' ')}</span>
                  </div>
                )}
                
                {home.build_year && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Built in {home.build_year}</span>
                  </div>
                )}
                
                <div>
                  <span className="font-medium">Added: </span>
                  <span>{new Date(home.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos" className="space-y-4">
            {home.photos && home.photos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {home.photos.map((photo, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-0">
                      <img 
                        src={photo} 
                        alt={`${home.name} photo ${index + 1}`}
                        className="w-full h-48 object-cover"
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No photos uploaded yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Loading completed projects...</div>
            ) : completedProjects.length > 0 ? (
              <div className="space-y-4">
                {completedProjects.map((project) => (
                  <Card key={project.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <Badge variant="secondary">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {project.category && (
                          <div>
                            <span className="font-medium">Category: </span>
                            <span className="capitalize">{project.category}</span>
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Completed: </span>
                          <span>
                            {project.end_date 
                              ? new Date(project.end_date).toLocaleDateString()
                              : 'Date not recorded'
                            }
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No completed projects for this home yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Loading completed maintenance...</div>
            ) : completedMaintenance.length > 0 ? (
              <div className="space-y-4">
                {completedMaintenance.map((maintenance) => (
                  <Card key={maintenance.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">
                        {maintenance.user_maintenance_tasks.title}
                      </CardTitle>
                      <CardDescription>
                        {maintenance.user_maintenance_tasks.category}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium">Completed: </span>
                          <span>{new Date(maintenance.completed_at).toLocaleDateString()}</span>
                        </div>
                        {maintenance.notes && (
                          <div>
                            <span className="font-medium">Notes: </span>
                            <span>{maintenance.notes}</span>
                          </div>
                        )}
                        {maintenance.photo_url && (
                          <div className="mt-3">
                            <img 
                              src={maintenance.photo_url} 
                              alt="Maintenance completion photo"
                              className="w-32 h-32 object-cover rounded border"
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No completed maintenance for this home yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};