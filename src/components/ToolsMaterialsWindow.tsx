import { useState } from "react";
import { ResponsiveDialog } from "@/components/ResponsiveDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToolsLibrary } from "./ToolsLibrary";
import { MaterialsLibrary } from "./MaterialsLibrary";
import { UserToolsEditor } from "./UserToolsEditor";
import { UserMaterialsEditor } from "./UserMaterialsEditor";
import { useUserRole } from "@/hooks/useUserRole";

interface ToolsMaterialsWindowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ToolsMaterialsWindow({ open, onOpenChange }: ToolsMaterialsWindowProps) {
  const { isAdmin, loading } = useUserRole();

  if (loading) {
    return (
      <ResponsiveDialog
        open={open}
        onOpenChange={onOpenChange}
        size="content-large"
        title="Loading..."
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading tools & materials...</div>
        </div>
      </ResponsiveDialog>
    );
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      size="content-large"
      title={isAdmin ? "Tools & Materials Library (Admin)" : "My Tools & Materials Library"}
    >
      <Tabs defaultValue="tools" className="w-full flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="tools">
            {isAdmin ? "Tools Library" : "My Tools"}
          </TabsTrigger>
          <TabsTrigger value="materials">
            {isAdmin ? "Materials Library" : "My Materials"}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tools" className="flex-1 overflow-y-auto">
          {isAdmin ? <ToolsLibrary /> : <UserToolsEditor />}
        </TabsContent>
        
        <TabsContent value="materials" className="flex-1 overflow-y-auto">
          {isAdmin ? <MaterialsLibrary /> : <UserMaterialsEditor />}
        </TabsContent>
      </Tabs>
    </ResponsiveDialog>
  );
}