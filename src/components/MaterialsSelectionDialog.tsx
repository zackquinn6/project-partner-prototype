import React, { useState, useEffect, useMemo } from 'react';
import { ResponsiveDialog } from '@/components/ResponsiveDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Package, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { ProjectRun } from '@/interfaces/ProjectRun';
import { useIsMobile } from '@/hooks/use-mobile';

interface MaterialItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  selected: boolean;
}

interface CustomMaterialItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

interface MaterialsSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectRun: ProjectRun | null;
  onConfirm: (selectedMaterials: MaterialItem[], customMaterials: CustomMaterialItem[]) => void;
}

export const MaterialsSelectionDialog: React.FC<MaterialsSelectionDialogProps> = ({
  open,
  onOpenChange,
  projectRun,
  onConfirm
}) => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [customMaterials, setCustomMaterials] = useState<CustomMaterialItem[]>([]);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customQuantity, setCustomQuantity] = useState(1);
  const [customUnit, setCustomUnit] = useState('');

  // Extract materials from project run
  useEffect(() => {
    if (projectRun && open) {
      const extractedMaterials: Map<string, MaterialItem> = new Map();
      
      projectRun.phases.forEach(phase => {
        phase.operations.forEach(operation => {
          operation.steps.forEach(step => {
            step.materials?.forEach(material => {
              const existingMaterial = extractedMaterials.get(material.id);
              // Extract actual unit from material, with proper fallback
              const materialUnit = (material as any).unit || (material as any).scalingUnit || 'ea';
              const quantity = (material as any).quantity || 1;
              
              if (existingMaterial) {
                existingMaterial.quantity += quantity;
              } else {
                extractedMaterials.set(material.id, {
                  id: material.id,
                  name: material.name || 'Unknown Material',
                  quantity,
                  unit: materialUnit,
                  selected: false
                });
              }
            });
          });
        });
      });

      setMaterials(Array.from(extractedMaterials.values()).sort((a, b) => a.name.localeCompare(b.name)));
    }
  }, [projectRun, open]);

  // Filter materials based on search
  const filteredMaterials = useMemo(() => {
    if (!searchQuery.trim()) return materials;
    const query = searchQuery.toLowerCase();
    return materials.filter(m => m.name.toLowerCase().includes(query));
  }, [materials, searchQuery]);

  const toggleMaterial = (id: string) => {
    setMaterials(prev => prev.map(m => 
      m.id === id ? { ...m, selected: !m.selected } : m
    ));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setMaterials(prev => prev.map(m => 
      m.id === id ? { ...m, quantity: Math.max(0, quantity) } : m
    ));
  };

  const addCustomMaterial = () => {
    if (!customName.trim()) {
      toast.error('Please enter a material name');
      return;
    }

    const newCustomMaterial: CustomMaterialItem = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      quantity: customQuantity,
      unit: customUnit.trim() || 'unit'
    };

    setCustomMaterials(prev => [...prev, newCustomMaterial]);
    setCustomName('');
    setCustomQuantity(1);
    setCustomUnit('');
    setShowAddCustom(false);
    toast.success('Custom material added');
  };

  const removeCustomMaterial = (id: string) => {
    setCustomMaterials(prev => prev.filter(m => m.id !== id));
  };

  const updateCustomQuantity = (id: string, quantity: number) => {
    setCustomMaterials(prev => prev.map(m => 
      m.id === id ? { ...m, quantity: Math.max(0, quantity) } : m
    ));
  };

  const handleConfirm = () => {
    const selectedMaterials = materials.filter(m => m.selected);
    
    if (selectedMaterials.length === 0 && customMaterials.length === 0) {
      toast.error('Please select at least one material');
      return;
    }

    onConfirm(selectedMaterials, customMaterials);
    onOpenChange(false);
  };

  const selectedCount = materials.filter(m => m.selected).length + customMaterials.length;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      size="large"
      title="Select Materials to Purchase"
      description="Choose which materials you need to purchase for your project"
    >
      <ScrollArea className="h-[calc(100vh-16rem)] max-h-[600px]">
        <div className="space-y-4 pr-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Materials List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Project Materials</span>
                <Badge variant="secondary">{filteredMaterials.length} items</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredMaterials.map(material => (
                  <div key={material.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Checkbox
                      id={material.id}
                      checked={material.selected}
                      onCheckedChange={() => toggleMaterial(material.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <Label htmlFor={material.id} className="cursor-pointer font-medium block truncate">
                        {material.name}
                      </Label>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(material.id, material.quantity - 1)}
                        disabled={material.quantity <= 0 || !material.selected}
                        className="h-7 w-7 p-0"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <Input
                        type="number"
                        value={material.quantity}
                        onChange={(e) => updateQuantity(material.id, parseInt(e.target.value) || 0)}
                        className="w-16 h-7 text-center text-sm"
                        min="0"
                        disabled={!material.selected}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(material.id, material.quantity + 1)}
                        disabled={!material.selected}
                        className="h-7 w-7 p-0"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <span className="text-sm text-muted-foreground w-12">{material.unit}</span>
                    </div>
                  </div>
                ))}
                {filteredMaterials.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    {searchQuery ? 'No materials match your search' : 'No materials found in project'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Custom Materials */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Custom Materials</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddCustom(!showAddCustom)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {showAddCustom && (
                <div className="p-4 border rounded-lg space-y-3 bg-muted/30">
                  <div className="space-y-2">
                    <Label>Material Name</Label>
                    <Input
                      placeholder="Enter material name"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        value={customQuantity}
                        onChange={(e) => setCustomQuantity(parseInt(e.target.value) || 1)}
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unit</Label>
                      <Input
                        placeholder="e.g., box, bag, ft"
                        value={customUnit}
                        onChange={(e) => setCustomUnit(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button onClick={addCustomMaterial} className="w-full">
                    Add Material
                  </Button>
                </div>
              )}

              {customMaterials.length > 0 ? (
                <div className="space-y-2">
                  {customMaterials.map(material => (
                    <div key={material.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Package className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{material.name}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Input
                          type="number"
                          value={material.quantity}
                          onChange={(e) => updateCustomQuantity(material.id, parseInt(e.target.value) || 0)}
                          className="w-16 h-7 text-xs text-center"
                          min="0"
                        />
                        <span className="text-xs text-muted-foreground w-12">{material.unit}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCustomMaterial(material.id)}
                          className="h-7 px-2"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground text-sm py-4">
                  No custom materials added
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Actions - Fixed at bottom */}
      <div className="flex justify-between items-center pt-4 mt-4 border-t">
        <div className="text-sm text-muted-foreground">
          {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Apply
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
};
