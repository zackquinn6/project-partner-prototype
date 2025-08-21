import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, X, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Tool {
  id: string;
  item: string;
  description?: string;
  example_models?: string;
  photo_url?: string;
}

interface OwnedTool {
  id: string;
  item: string;
  description?: string;
  custom_description?: string;
  example_models?: string;
  photo_url?: string;
}

interface OwnedToolsEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ownedTools: OwnedTool[];
  onSave: (tools: OwnedTool[]) => void;
}

export default function OwnedToolsEditor({ open, onOpenChange, ownedTools, onSave }: OwnedToolsEditorProps) {
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [userTools, setUserTools] = useState<OwnedTool[]>(ownedTools);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchTools();
      setUserTools(ownedTools);
    }
  }, [open, ownedTools]);

  const fetchTools = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .order('item');

      if (error) throw error;
      setAvailableTools(data || []);
    } catch (error) {
      console.error('Error fetching tools:', error);
      toast({
        title: "Error loading tools",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTools = availableTools.filter(tool => {
    const matchesSearch = tool.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (tool.description && tool.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === "all" || 
                       (selectedType === "common" && isCommonTool(tool.item));
    
    const notOwned = !userTools.some(owned => owned.id === tool.id);
    
    return matchesSearch && matchesType && notOwned;
  });

  const isCommonTool = (toolName: string) => {
    const commonTools = [
      "hammer", "screwdriver", "drill", "level", "tape measure", 
      "pliers", "wrench", "saw", "utility knife", "safety glasses"
    ];
    return commonTools.some(common => toolName.toLowerCase().includes(common));
  };

  const addTool = (tool: Tool) => {
    const newOwnedTool: OwnedTool = {
      ...tool,
      custom_description: ""
    };
    setUserTools(prev => [...prev, newOwnedTool]);
  };

  const removeTool = (toolId: string) => {
    setUserTools(prev => prev.filter(tool => tool.id !== toolId));
  };

  const updateCustomDescription = (toolId: string, description: string) => {
    setUserTools(prev => prev.map(tool => 
      tool.id === toolId ? { ...tool, custom_description: description } : tool
    ));
  };

  const handleSave = () => {
    onSave(userTools);
    onOpenChange(false);
    toast({
      title: "Tools saved",
      description: "Your owned tools have been updated."
    });
  };

  const toolTypes = [
    { value: "all", label: "All Tools" },
    { value: "common", label: "Common Tools" }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Your Tool Library</DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 flex-1 min-h-0">
          {/* Available Tools Panel */}
          <div className="flex-1 space-y-4 flex flex-col">
            <div className="space-y-3 flex-shrink-0">
              <Label className="text-sm font-medium">Add Tools from Library</Label>
              
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search tools..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {toolTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 space-y-2">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading tools...</div>
              ) : filteredTools.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm || selectedType !== "all" ? "No tools match your search" : "No tools available"}
                </div>
              ) : (
                filteredTools.map(tool => (
                  <Card key={tool.id} className="hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{tool.item}</div>
                          {tool.description && (
                            <div className="text-sm text-muted-foreground mt-1">{tool.description}</div>
                          )}
                          {tool.example_models && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Examples: {tool.example_models}
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addTool(tool)}
                          className="ml-3"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Owned Tools Panel */}
          <div className="flex-1 space-y-4 flex flex-col">
            <div className="flex-shrink-0">
              <Label className="text-sm font-medium">Your Owned Tools</Label>
              <div className="text-xs text-muted-foreground mt-1">
                {userTools.length} tool{userTools.length !== 1 ? 's' : ''} in your library
              </div>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3">
              {userTools.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No tools in your library yet. Add some from the left panel.
                </div>
              ) : (
                userTools.map(tool => (
                  <Card key={tool.id} className="border-primary/20">
                    <CardContent className="p-3">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <GripVertical className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{tool.item}</div>
                              {tool.description && (
                                <div className="text-sm text-muted-foreground">{tool.description}</div>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeTool(tool.id)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <div>
                          <Label className="text-xs">Personal Notes (optional)</Label>
                          <Textarea
                            placeholder="Add your own notes about this tool (condition, location, etc.)"
                            value={tool.custom_description || ""}
                            onChange={(e) => updateCustomDescription(tool.id, e.target.value)}
                            className="mt-1 text-sm"
                            rows={2}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="gradient-primary text-white">
            Save Tools ({userTools.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}