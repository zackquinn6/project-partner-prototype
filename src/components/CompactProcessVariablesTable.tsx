import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus, Settings } from 'lucide-react';
import { StepInput } from '@/interfaces/Project';

interface CompactProcessVariablesTableProps {
  variables: StepInput[];
  onVariablesChange: (variables: StepInput[]) => void;
  onAddVariable: () => void;
}

export function CompactProcessVariablesTable({ variables, onVariablesChange, onAddVariable }: CompactProcessVariablesTableProps) {
  const handleVariableChange = (index: number, field: keyof StepInput, value: any) => {
    const updatedVariables = [...variables];
    updatedVariables[index] = { ...updatedVariables[index], [field]: value };
    onVariablesChange(updatedVariables);
  };

  const handleRemoveVariable = (index: number) => {
    const updatedVariables = variables.filter((_, i) => i !== index);
    onVariablesChange(updatedVariables);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Process Variables ({variables.length})
        </h3>
        <Button size="sm" variant="outline" onClick={onAddVariable}>
          <Plus className="w-3 h-3 mr-1" />
          Add Variable
        </Button>
      </div>

      {variables.length > 0 && (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-xs py-2">Variable Name</TableHead>
                <TableHead className="text-xs py-2 w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variables.map((variable, index) => (
                <TableRow key={variable.id} className="text-xs">
                  <TableCell className="py-2">
                    <Input
                      value={variable.name}
                      onChange={(e) => handleVariableChange(index, 'name', e.target.value)}
                      placeholder="Variable name"
                      className="text-xs h-6"
                    />
                  </TableCell>
                  <TableCell className="py-2 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveVariable(index)}
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {variables.length === 0 && (
        <div className="text-center py-4 text-xs text-muted-foreground border border-dashed rounded-md">
          No process variables defined
        </div>
      )}
    </div>
  );
}