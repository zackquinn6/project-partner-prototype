import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppReference } from '@/interfaces/Project';
import { getAllNativeApps } from '@/utils/appsRegistry';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { Check } from 'lucide-react';

interface AppsLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedApps: AppReference[];
  onAppsSelected: (apps: AppReference[]) => void;
}

export const AppsLibraryDialog = ({
  open,
  onOpenChange,
  selectedApps,
  onAppsSelected
}: AppsLibraryDialogProps) => {
  const [tempSelected, setTempSelected] = useState<AppReference[]>(selectedApps);
  const nativeApps = getAllNativeApps();

  const getIconComponent = (iconName: string): LucideIcon => {
    const Icon = (Icons as any)[iconName];
    return Icon || Icons.Sparkles;
  };

  const isSelected = (appId: string) => {
    return tempSelected.some(app => app.id === appId);
  };

  const toggleApp = (app: AppReference) => {
    if (isSelected(app.id)) {
      setTempSelected(tempSelected.filter(a => a.id !== app.id));
    } else {
      setTempSelected([...tempSelected, app]);
    }
  };

  const handleSave = () => {
    onAppsSelected(tempSelected);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTempSelected(selectedApps);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Apps to Workflow Step</DialogTitle>
          <DialogDescription>
            Select apps to help users complete this step
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="native" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="native">Native Apps</TabsTrigger>
            <TabsTrigger value="external" disabled>External Apps (Coming Soon)</TabsTrigger>
          </TabsList>

          <TabsContent value="native" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {nativeApps.map((app) => {
                const IconComponent = getIconComponent(app.icon);
                const selected = isSelected(app.id);
                
                return (
                  <Card
                    key={app.id}
                    className={`cursor-pointer transition-all ${
                      selected
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border hover:border-primary/50 hover:shadow-sm'
                    }`}
                    onClick={() => toggleApp(app)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          selected ? 'bg-primary/20' : 'bg-primary/10'
                        }`}>
                          <IconComponent className={`w-6 h-6 ${
                            selected ? 'text-primary' : 'text-primary/70'
                          }`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-medium text-sm">{app.appName}</h4>
                            {selected && (
                              <Check className="w-5 h-5 text-primary flex-shrink-0" />
                            )}
                          </div>
                          {app.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {app.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="external" className="mt-4">
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                External apps support coming soon. You'll be able to add custom embeds and links.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {tempSelected.length} app{tempSelected.length !== 1 ? 's' : ''} selected
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Apps
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
