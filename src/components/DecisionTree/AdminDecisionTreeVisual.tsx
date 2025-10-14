import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Phase } from '@/interfaces/Project';

interface AdminDecisionTreeVisualProps {
  phases: Phase[];
  onBack: () => void;
}

// Custom node for operations
const OperationNode = ({ data }: { data: any }) => {
  const getNodeStyle = (flowType?: string) => {
    switch (flowType) {
      case 'prime':
        return 'bg-blue-50 border-blue-500';
      case 'alternate':
        return 'bg-orange-50 border-orange-500';
      case 'if-necessary':
        return 'bg-gray-50 border-gray-500';
      default:
        return 'bg-background border-border';
    }
  };

  return (
    <Card className={`min-w-48 border-2 ${getNodeStyle(data.flowType)}`}>
      <CardHeader className="p-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {data.operationNumber}
          </Badge>
          {data.flowType && (
            <Badge className="text-xs capitalize">
              {data.flowType.replace('-', ' ')}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <p className="text-sm font-medium">{data.label}</p>
        {data.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {data.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// Decision diamond node
const DecisionNode = ({ data }: { data: any }) => {
  return (
    <div className="relative">
      <div className="w-32 h-32 bg-yellow-50 border-4 border-yellow-500 transform rotate-45 flex items-center justify-center">
        <div className="transform -rotate-45 text-center">
          <p className="text-xs font-bold text-yellow-900">Decision</p>
          <p className="text-xs text-yellow-800 mt-1">{data.label}</p>
        </div>
      </div>
    </div>
  );
};

const nodeTypes = {
  operation: OperationNode,
  decision: DecisionNode,
};

export const AdminDecisionTreeVisual: React.FC<AdminDecisionTreeVisualProps> = ({
  phases,
  onBack
}) => {
  const { nodes, edges } = useMemo(() => {
    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];
    
    let yOffset = 0;
    let operationNumber = 0;

    phases.forEach((phase, phaseIndex) => {
      // Add phase label
      flowNodes.push({
        id: `phase-${phase.id}`,
        type: 'default',
        position: { x: 0, y: yOffset },
        data: { 
          label: phase.name,
        },
        style: {
          background: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 'bold'
        },
      });

      yOffset += 100;
      let xOffset = 0;
      let primeOperations: any[] = [];
      let alternateGroups: Map<string, any[]> = new Map();
      let ifNecessaryOps: any[] = [];

      // Group operations by type
      phase.operations.forEach((operation) => {
        const flowType = operation.steps[0]?.flowType || 'prime';
        operationNumber++;

        const opData = {
          operation,
          operationNumber: `Oper ${String(operationNumber).padStart(3, '0')}`,
          flowType
        };

        if (flowType === 'prime') {
          primeOperations.push(opData);
        } else if (flowType === 'alternate') {
          const groupKey = (operation as any).alternateGroup || 'default';
          if (!alternateGroups.has(groupKey)) {
            alternateGroups.set(groupKey, []);
          }
          alternateGroups.get(groupKey)!.push(opData);
        } else if (flowType === 'if-necessary') {
          ifNecessaryOps.push(opData);
        }
      });

      // Layout prime path
      let lastPrimeId: string | null = null;
      primeOperations.forEach((opData, index) => {
        const nodeId = `op-${opData.operation.id}`;
        flowNodes.push({
          id: nodeId,
          type: 'operation',
          position: { x: xOffset, y: yOffset },
          data: {
            label: opData.operation.name,
            description: opData.operation.description,
            flowType: opData.flowType,
            operationNumber: opData.operationNumber
          }
        });

        if (lastPrimeId) {
          flowEdges.push({
            id: `edge-${lastPrimeId}-${nodeId}`,
            source: lastPrimeId,
            target: nodeId,
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 }
          });
        }

        lastPrimeId = nodeId;
        xOffset += 350;
      });

      // Layout alternate paths with decision diamonds
      alternateGroups.forEach((alternatives, groupKey) => {
        const decisionId = `decision-${phase.id}-${groupKey}`;
        const decisionY = yOffset + 200;
        const baseX = xOffset - 350;

        // Add decision diamond
        flowNodes.push({
          id: decisionId,
          type: 'decision',
          position: { x: baseX + 100, y: decisionY },
          data: {
            label: (alternatives[0].operation as any).userPrompt || 'Decision?'
          }
        });

        // Connect last prime op to decision
        if (lastPrimeId) {
          flowEdges.push({
            id: `edge-${lastPrimeId}-${decisionId}`,
            source: lastPrimeId,
            target: decisionId,
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed }
          });
        }

        // Layout alternate options
        alternatives.forEach((opData, altIndex) => {
          const nodeId = `op-${opData.operation.id}`;
          const altX = baseX + (altIndex * 250);
          const altY = decisionY + 200;

          flowNodes.push({
            id: nodeId,
            type: 'operation',
            position: { x: altX, y: altY },
            data: {
              label: opData.operation.name,
              description: opData.operation.description,
              flowType: opData.flowType,
              operationNumber: opData.operationNumber
            }
          });

          // Connect decision to alternate
          flowEdges.push({
            id: `edge-${decisionId}-${nodeId}`,
            source: decisionId,
            target: nodeId,
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: 'hsl(var(--orange))', strokeWidth: 2, strokeDasharray: '5,5' },
            label: `Option ${altIndex + 1}`
          });
        });
      });

      // Layout if-necessary operations
      ifNecessaryOps.forEach((opData, index) => {
        const nodeId = `op-${opData.operation.id}`;
        const ifNecY = yOffset + 400;
        const ifNecX = index * 250;

        flowNodes.push({
          id: nodeId,
          type: 'operation',
          position: { x: ifNecX, y: ifNecY },
          data: {
            label: opData.operation.name,
            description: opData.operation.description,
            flowType: opData.flowType,
            operationNumber: opData.operationNumber
          }
        });

        // Dotted line from prime path
        if (lastPrimeId) {
          flowEdges.push({
            id: `edge-${lastPrimeId}-${nodeId}`,
            source: lastPrimeId,
            target: nodeId,
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '8,4' },
            label: 'If needed'
          });
        }
      });

      yOffset += 700;
    });

    return { nodes: flowNodes, edges: flowEdges };
  }, [phases]);

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
              <h2 className="text-xl font-bold">Decision Tree Visualization</h2>
              <p className="text-sm text-muted-foreground">Project workflow with all decision paths</p>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="border-b bg-muted/30 p-3">
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Prime Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span>Alternate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded"></div>
            <span>If Necessary</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded transform rotate-45"></div>
            <span>Decision Point</span>
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
          minZoom={0.1}
          maxZoom={1.5}
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
};
