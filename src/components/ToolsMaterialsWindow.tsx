import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToolsLibrary } from "./ToolsLibrary";
import { MaterialsLibrary } from "./MaterialsLibrary";

interface ToolsMaterialsWindowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ToolsMaterialsWindow({ open, onOpenChange }: ToolsMaterialsWindowProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Tools & Materials Library</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="tools" className="w-full h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tools" className="h-full">
            <ToolsLibrary />
          </TabsContent>
          
          <TabsContent value="materials" className="h-full">
            <MaterialsLibrary />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}