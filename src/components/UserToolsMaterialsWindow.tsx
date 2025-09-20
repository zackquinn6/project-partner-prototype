import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserToolsEditor } from "./UserToolsEditor";
import { UserMaterialsEditor } from "./UserMaterialsEditor";

interface UserToolsMaterialsWindowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialToolsMode?: 'library' | 'add-tools';
}

export function UserToolsMaterialsWindow({ open, onOpenChange, initialToolsMode }: UserToolsMaterialsWindowProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>My Tools Library</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="tools" className="w-full h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tools">My Tools</TabsTrigger>
            <TabsTrigger value="materials">My Materials</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tools" className="h-full">
            <UserToolsEditor initialMode={initialToolsMode} />
          </TabsContent>
          
          <TabsContent value="materials" className="h-full">
            <UserMaterialsEditor initialMode={initialToolsMode === 'add-tools' ? 'add-materials' : 'library'} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}