import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { UserToolsEditor } from "./UserToolsEditor";
import { UserMaterialsEditor } from "./UserMaterialsEditor";

interface UserToolsMaterialsWindowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialToolsMode?: 'library' | 'add-tools';
}

export function UserToolsMaterialsWindow({ open, onOpenChange, initialToolsMode }: UserToolsMaterialsWindowProps) {
  const [currentMode, setCurrentMode] = useState<'library' | 'add-tools'>('library');

  // Update currentMode when initialToolsMode changes
  useEffect(() => {
    if (initialToolsMode) {
      setCurrentMode(initialToolsMode);
    }
  }, [initialToolsMode]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full h-screen max-w-full max-h-full md:max-w-[90vw] md:h-[90vh] md:rounded-lg p-0 overflow-hidden flex flex-col [&>button]:hidden">
        <DialogHeader className="px-4 md:px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg md:text-xl font-bold">
              {currentMode === 'add-tools' ? 'Add to Library' : 'My Tools Library'}
            </DialogTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onOpenChange(false)} 
              className="ml-4 flex-shrink-0"
            >
              Close
            </Button>
          </div>
        </DialogHeader>
        
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col p-4 sm:p-6">
            <Tabs defaultValue="tools" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 h-12">
                <TabsTrigger value="tools" className="text-sm px-3 py-2">My Tools</TabsTrigger>
                <TabsTrigger value="materials" className="text-sm px-3 py-2">My Materials</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tools">
                <UserToolsEditor 
                  initialMode={currentMode}
                  onBackToLibrary={() => setCurrentMode('library')}
                  onSwitchToAdd={() => setCurrentMode('add-tools')}
                />
              </TabsContent>
              
              <TabsContent value="materials">
                <UserMaterialsEditor 
                  initialMode={'library'}
                  onBackToLibrary={() => setCurrentMode('library')}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
