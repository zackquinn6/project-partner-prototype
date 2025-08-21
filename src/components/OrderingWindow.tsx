import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight, ShoppingCart, Eye, EyeOff, ExternalLink } from "lucide-react";
import { Project, Material, Tool } from "@/interfaces/Project";
import { supabase } from "@/integrations/supabase/client";

interface OrderingWindowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  userOwnedTools: string[];
  onOrderingComplete?: () => void;
}

interface ShoppingSite {
  name: string;
  url: string;
  color: string;
}

const SHOPPING_SITES: ShoppingSite[] = [
  { name: "Lowe's", url: "https://lowes.com", color: "bg-blue-600 hover:bg-blue-700" },
  { name: "Floor & Decor", url: "https://flooranddecor.com", color: "bg-orange-600 hover:bg-orange-700" },
  { name: "Wayfair", url: "https://wayfair.com", color: "bg-purple-600 hover:bg-purple-700" },
  { name: "Amazon", url: "https://amazon.com", color: "bg-yellow-600 hover:bg-yellow-700" },
  { name: "Toolio.us", url: "https://toolio.us", color: "bg-green-600 hover:bg-green-700" },
];

export function OrderingWindow({ open, onOpenChange, project, userOwnedTools, onOrderingComplete }: OrderingWindowProps) {
  const [currentUrl, setCurrentUrl] = useState<string>(SHOPPING_SITES[0].url);
  const [checklistVisible, setChecklistVisible] = useState(true);
  const [orderedTools, setOrderedTools] = useState<Set<string>>(new Set());
  const [orderedMaterials, setOrderedMaterials] = useState<Set<string>>(new Set());
  const [userProfile, setUserProfile] = useState<any>(null);

  // Fetch user profile to get owned tools
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('owned_tools')
            .eq('user_id', user.id)
            .single();
          
          if (!error && data) {
            setUserProfile(data);
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    if (open) {
      fetchUserProfile();
    }
  }, [open]);

  // Extract all tools and materials from project
  const allTools = project?.phases.flatMap(phase => 
    phase.operations.flatMap(operation => 
      operation.steps.flatMap(step => step.tools)
    )
  ) || [];

  const allMaterials = project?.phases.flatMap(phase => 
    phase.operations.flatMap(operation => 
      operation.steps.flatMap(step => step.materials)
    )
  ) || [];

  // Get unique tools and materials
  const uniqueTools = allTools.reduce((acc: Tool[], tool) => {
    if (!acc.find(t => t.id === tool.id)) {
      acc.push(tool);
    }
    return acc;
  }, []);

  const uniqueMaterials = allMaterials.reduce((acc: Material[], material) => {
    if (!acc.find(m => m.id === material.id)) {
      acc.push(material);
    }
    return acc;
  }, []);

  // Auto-check tools that user already owns
  useEffect(() => {
    const ownedToolIds = new Set<string>();
    uniqueTools.forEach(tool => {
      const ownedTools = userProfile?.owned_tools || [];
      if (ownedTools.some((ownedTool: any) => ownedTool.tool === tool.name || ownedTool.name === tool.name)) {
        ownedToolIds.add(tool.id);
      }
    });
    setOrderedTools(ownedToolIds);
  }, [uniqueTools, userProfile]);

  const handleToolToggle = (toolId: string) => {
    setOrderedTools(prev => {
      const newSet = new Set(prev);
      if (newSet.has(toolId)) {
        newSet.delete(toolId);
      } else {
        newSet.add(toolId);
      }
      return newSet;
    });
  };

  const handleMaterialToggle = (materialId: string) => {
    setOrderedMaterials(prev => {
      const newSet = new Set(prev);
      if (newSet.has(materialId)) {
        newSet.delete(materialId);
      } else {
        newSet.add(materialId);
      }
      return newSet;
    });
  };

  const allItemsOrdered = uniqueTools.every(tool => orderedTools.has(tool.id)) &&
                          uniqueMaterials.every(material => orderedMaterials.has(material.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Tool & Material Ordering
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex h-[calc(95vh-120px)]">
          {/* Main Browser Area */}
          <div className="flex-1 flex flex-col border-r">
            {/* Navigation Bar */}
            <div className="p-4 border-b bg-muted/30">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setChecklistVisible(!checklistVisible)}
                  className="flex items-center gap-2"
                >
                  {checklistVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {checklistVisible ? 'Hide' : 'Show'} Checklist
                </Button>
                
                <div className="flex-1" />
                
                {allItemsOrdered && onOrderingComplete && (
                  <Button
                    onClick={onOrderingComplete}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Complete Ordering
                  </Button>
                )}
              </div>
              
              {/* Shopping Site Buttons */}
              <div className="flex gap-2 flex-wrap">
                {SHOPPING_SITES.map((site) => (
                  <Button
                    key={site.name}
                    onClick={() => setCurrentUrl(site.url)}
                    className={`${site.color} text-white flex items-center gap-2`}
                    size="sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {site.name}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Browser iframe */}
            <div className="flex-1 bg-white">
              <iframe
                src={currentUrl}
                className="w-full h-full border-0"
                title="Shopping Browser"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>
          </div>

          {/* Checklist Sidebar */}
          {checklistVisible && (
            <div className="w-80 flex flex-col bg-background border-l">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-lg">Shopping Checklist</h3>
                <p className="text-sm text-muted-foreground">
                  Check off items as you order them
                </p>
              </div>
              
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                  {/* Tools Section */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        Tools
                        <Badge variant="secondary">
                          {orderedTools.size}/{uniqueTools.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                     <CardContent className="space-y-3">
                       {uniqueTools.map((tool) => {
                         const isOrdered = orderedTools.has(tool.id);
                         
                         return (
                           <div key={tool.id} className="flex items-start gap-3">
                             <Checkbox
                               checked={isOrdered}
                               onCheckedChange={() => handleToolToggle(tool.id)}
                               className="mt-1"
                             />
                             <div className="flex-1 min-w-0">
                               <div className="flex items-center gap-2">
                                 <p className="font-medium text-sm">{tool.name}</p>
                                 {(userProfile?.owned_tools || []).some((ownedTool: any) => 
                                   ownedTool.tool === tool.name || ownedTool.name === tool.name
                                 ) && (
                                   <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                     Owned
                                   </Badge>
                                 )}
                               </div>
                               {tool.description && (
                                 <p className="text-xs text-muted-foreground mt-1">
                                   {tool.description}
                                 </p>
                               )}
                               {tool.required && (
                                 <Badge variant="destructive" className="text-xs mt-1">
                                   Required
                                 </Badge>
                               )}
                             </div>
                           </div>
                         );
                       })}
                     </CardContent>
                  </Card>

                  <Separator />

                  {/* Materials Section */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        Materials
                        <Badge variant="secondary">
                          {orderedMaterials.size}/{uniqueMaterials.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {uniqueMaterials.map((material) => {
                        const isOrdered = orderedMaterials.has(material.id);
                        
                        return (
                          <div key={material.id} className="flex items-start gap-3">
                            <Checkbox
                              checked={isOrdered}
                              onCheckedChange={() => handleMaterialToggle(material.id)}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{material.name}</p>
                              {material.description && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {material.description}
                                </p>
                              )}
                              {material.required && (
                                <Badge variant="destructive" className="text-xs mt-1">
                                  Required
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}