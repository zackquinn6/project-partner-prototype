import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, ExternalLink, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdminActionCenterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface RevisionAlert {
  phaseId: string;
  sourceProjectId: string;
  currentRevision: number;
  latestRevision: number;
  phaseName: string;
}

interface ProjectAlerts {
  project_id: string;
  project_name: string;
  alerts: RevisionAlert[];
}

export const AdminActionCenter: React.FC<AdminActionCenterProps> = ({
  open,
  onOpenChange
}) => {
  const [alerts, setAlerts] = useState<ProjectAlerts[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchRevisionAlerts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('check_phase_revision_updates');
      
      if (error) throw error;
      
      const formattedAlerts = data.map((item: any) => ({
        project_id: item.project_id,
        project_name: item.project_name,
        alerts: item.alerts || []
      }));
      
      setAlerts(formattedAlerts);
    } catch (error) {
      console.error('Error fetching revision alerts:', error);
      toast({
        title: "Failed to Load Alerts",
        description: "Could not fetch revision alerts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAlertAction = async (projectId: string, phaseId: string, action: 'incorporate' | 'dismiss') => {
    try {
      const { error } = await supabase.rpc('update_phase_revision_alert', {
        p_project_id: projectId,
        p_phase_id: phaseId,
        p_action: action
      });

      if (error) throw error;

      // Refresh alerts
      await fetchRevisionAlerts();

      toast({
        title: action === 'incorporate' ? "Alert Incorporated" : "Alert Dismissed",
        description: `Phase revision alert has been ${action}d successfully.`
      });
    } catch (error) {
      console.error('Error handling alert action:', error);
      toast({
        title: "Action Failed",
        description: "Failed to update alert status. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (open) {
      fetchRevisionAlerts();
    }
  }, [open]);

  const totalAlerts = alerts.reduce((sum, project) => sum + project.alerts.length, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Action Center
            {totalAlerts > 0 && (
              <Badge variant="destructive" className="ml-2">
                {totalAlerts} alerts
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Phase Revision Updates Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Phase Revision Updates</h3>
              <Button onClick={fetchRevisionAlerts} disabled={loading} size="sm" variant="outline">
                Refresh
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading alerts...
              </div>
            ) : alerts.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                  <h4 className="font-medium mb-2">No Pending Actions</h4>
                  <p className="text-muted-foreground">
                    All phase revisions are up to date. New alerts will appear here when phases from incorporated projects receive updates.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {alerts.map((projectAlert) => (
                  <Card key={projectAlert.project_id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>{projectAlert.project_name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/admin?project=${projectAlert.project_id}`, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {projectAlert.alerts.map((alert, index) => (
                        <div key={`${alert.phaseId}-${index}`}>
                          {index > 0 && <Separator className="mb-4" />}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-4 h-4 text-orange-500" />
                                <span className="font-medium">{alert.phaseName}</span>
                              </div>
                              <div className="text-sm text-muted-foreground mb-3">
                                <p>A newer revision is available for this incorporated phase.</p>
                                <div className="flex items-center gap-4 mt-1">
                                  <span>Current: Rev {alert.currentRevision}</span>
                                  <span>→</span>
                                  <span className="text-primary font-medium">
                                    Latest: Rev {alert.latestRevision}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAlertAction(
                                  projectAlert.project_id, 
                                  alert.phaseId, 
                                  'dismiss'
                                )}
                              >
                                <X className="w-3 h-3 mr-1" />
                                Dismiss
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleAlertAction(
                                  projectAlert.project_id, 
                                  alert.phaseId, 
                                  'incorporate'
                                )}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Incorporate
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Future sections for other admin actions can be added here */}
        </div>
      </DialogContent>
    </Dialog>
  );
};