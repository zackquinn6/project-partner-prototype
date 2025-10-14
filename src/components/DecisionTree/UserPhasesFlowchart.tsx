import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Phase } from '@/interfaces/Project';

interface UserPhasesFlowchartProps {
  phases: Phase[];
  onBack: () => void;
  selectedAlternates?: Record<string, string>;
  selectedIfNecessary?: Record<string, boolean>;
}

// Simplified phase node
const PhaseNode = ({ data }: { data: any }) => {
  return (
    <Card className="min-w-64 border-2 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge className="bg-primary">{data.phaseNumber}</Badge>
          <Badge variant="outline" className="text-xs">
            {data.operationCount} operations
          </Badge>
        </div>
        <h3 className="font-bold text-lg">{data.label}</h3>
        {data.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {data.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const nodeTypes = {
  phase: PhaseNode,
};

export const UserPhasesFlowchart: React.FC<UserPhasesFlowchartProps> = ({
  phases,
  onBack,
  selectedAlternates = {},
  selectedIfNecessary = {}
}) => {
  const { nodes, edges } = useMemo(() => {
    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];

    phases.forEach((phase, index) => {
      // Count operations (excluding non-selected alternates and if-necessary)
      let operationCount = 0;
      phase.operations.forEach(operation => {
        const flowType = operation.steps[0]?.flowType || 'prime';
        
        if (flowType === 'prime') {
          operationCount++;
        } else if (flowType === 'alternate') {
          const groupKey = (operation as any).alternateGroup || 'default';
          if (selectedAlternates[groupKey] === operation.id) {
            operationCount++;
          }
        } else if (flowType === 'if-necessary') {
          if (selectedIfNecessary[operation.id]) {
            operationCount++;
          }
        }
      });

      const nodeId = `phase-${phase.id}`;
      const yPosition = index * 250;

      flowNodes.push({
        id: nodeId,
        type: 'phase',
        position: { x: 400, y: yPosition },
        data: {
          label: phase.name,
          description: phase.description,
          phaseNumber: `Phase ${index + 1}`,
          operationCount
        }
      });

      // Connect to previous phase
      if (index > 0) {
        const prevNodeId = `phase-${phases[index - 1].id}`;
        flowEdges.push({
          id: `edge-${prevNodeId}-${nodeId}`,
          source: prevNodeId,
          target: nodeId,
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { 
            stroke: 'hsl(var(--primary))',
            strokeWidth: 3
          },
          animated: true
        });
      }
    });

    return { nodes: flowNodes, edges: flowEdges };
  }, [phases, selectedAlternates, selectedIfNecessary]);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h2 className="text-xl font-bold">Project Overview</h2>
              <p className="text-sm text-muted-foreground">Simplified view of your project phases</p>
            </div>
          </div>
        </div>
      </div>

      {/* Flow Chart */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.5}
          maxZoom={1.5}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
        >
          <Background />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
};
